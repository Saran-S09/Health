#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

const int BUFFER_SIZE = 100;
const uint32_t FINGER_THRESHOLD = 50000;
const unsigned long READING_INTERVAL = 3000;

uint32_t redBuffer[BUFFER_SIZE];
uint32_t irBuffer[BUFFER_SIZE];
unsigned long nextReadingAt = 0;

void setup()
{
  Serial.begin(115200);
  Wire.begin(21, 22);

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

bool collectSamples()
{
  for (int i = 0; i < BUFFER_SIZE; i++)
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
    BUFFER_SIZE,
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
}
