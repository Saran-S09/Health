#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

const char *WIFI_SSID = "iQOO Z9x 5G";
const char *WIFI_PASSWORD = "Saran2006";
const char *SERVER_URL = "https://health-a1gj.onrender.com/api/sensor/upload";
const char *API_KEY = "carelink_esp32_secret";
const char *PATIENT_ID = "CL-P10234";

const int SAMPLE_COUNT = 100;
const uint32_t FINGER_THRESHOLD = 50000;
const unsigned long READING_INTERVAL = 3000;

uint32_t redBuffer[SAMPLE_COUNT];
uint32_t irBuffer[SAMPLE_COUNT];
unsigned long nextReadingAt = 0;

void connectWiFi();
bool collectSamples();
void sendValidReading();

void setup()
{
  Serial.begin(115200);
  Wire.begin(21, 22);

  WiFi.setAutoReconnect(true);
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  connectWiFi();

  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD))
  {
    Serial.println(F("MAX30102 NOT FOUND - check VIN, GND, SDA and SCL"));
    while (true) delay(1000);
  }

  particleSensor.setup(60, 4, 2, 100, 411, 4096);
  particleSensor.setPulseAmplitudeRed(0x24);
  particleSensor.setPulseAmplitudeIR(0x24);

  Serial.println(F("CARELINK SENSOR READY"));
  Serial.println(F("PLACE FINGER ON SENSOR"));
}

void loop()
{
  particleSensor.check();

  if (!particleSensor.available())
  {
    delay(20);
    return;
  }

  uint32_t irValue = particleSensor.getIR();
  particleSensor.nextSample();

  if (irValue < FINGER_THRESHOLD)
  {
    nextReadingAt = 0;
    delay(100);
    return;
  }

  if (millis() < nextReadingAt)
  {
    delay(50);
    return;
  }

  if (collectSamples())
  {
    sendValidReading();
    nextReadingAt = millis() + READING_INTERVAL;
  }
  else
  {
    Serial.println(F("Reading rejected - hold finger still"));
    nextReadingAt = millis() + 1000;
  }
}

void connectWiFi()
{
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print(F("Connecting to Wi-Fi"));
  WiFi.disconnect(true);
  delay(250);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 20000)
  {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print(F("Wi-Fi connected. ESP32 IP: "));
    Serial.println(WiFi.localIP());
  }
  else
  {
    Serial.println(F("Wi-Fi connection failed"));
  }
}

bool collectSamples()
{
  for (int i = 0; i < SAMPLE_COUNT; i++)
  {
    unsigned long startedAt = millis();

    while (!particleSensor.available())
    {
      particleSensor.check();
      if (millis() - startedAt > 2000) return false;
      delay(1);
    }

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();

    if (irBuffer[i] < FINGER_THRESHOLD) return false;
  }

  return true;
}

void sendValidReading()
{
  int32_t spo2;
  int32_t heartRate;
  int8_t validSpO2;
  int8_t validHeartRate;

  maxim_heart_rate_and_oxygen_saturation(
    irBuffer,
    SAMPLE_COUNT,
    redBuffer,
    &spo2,
    &validSpO2,
    &heartRate,
    &validHeartRate
  );

  bool validReading = validHeartRate && validSpO2 &&
    heartRate >= 40 && heartRate <= 200 &&
    spo2 >= 70 && spo2 <= 100;

  if (!validReading) return;

  Serial.print(F("Heart Rate : "));
  Serial.print(heartRate);
  Serial.println(F(" BPM"));
  Serial.print(F("SpO2       : "));
  Serial.print(spo2);
  Serial.println(F(" %"));

  Serial.print(F("{\"heartRate\":"));
  Serial.print(heartRate);
  Serial.print(F(",\"spo2\":"));
  Serial.print(spo2);
  Serial.println(F("}"));

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println(F("Wi-Fi disconnected; reconnecting"));
    connectWiFi();
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println(F("Reading not uploaded: Wi-Fi unavailable"));
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  if (!http.begin(client, SERVER_URL))
  {
    Serial.println(F("Could not initialize HTTP connection"));
    return;
  }

  http.setTimeout(15000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  String payload = String("{\"patientId\":\"") + PATIENT_ID +
    String("\",\"heartRate\":") + heartRate +
    String(",\"spo2\":") + spo2 + "}";
  int responseCode = http.POST(payload);

  Serial.print(F("Upload HTTP status: "));
  Serial.println(responseCode);
  if (responseCode > 0)
  {
    Serial.println(http.getString());
  }
  else
  {
    Serial.println(http.errorToString(responseCode));
  }
  http.end();
}
