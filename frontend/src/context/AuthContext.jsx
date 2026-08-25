import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Saved user or default to null for auth wall
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('carelink_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('carelink_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('carelink_user');
    localStorage.removeItem('carelink_vitals');
    localStorage.removeItem('carelink_patient_profile');
    localStorage.removeItem('carelink_careteam');
    localStorage.removeItem('carelink_requests');
    localStorage.removeItem('carelink_history');
    localStorage.removeItem('carelink_connected_patients');
    localStorage.removeItem('carelink_thresholds');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
