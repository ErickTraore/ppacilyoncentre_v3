// File: frontend/src/components/session/SessionManager.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

const expiryWarning = parseInt(process.env.REACT_APP_SESSION_EXPIRY_WARNING, 10) || 60;

const SessionManager = () => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalCountdown, setModalCountdown] = useState(expiryWarning);
  const [isExtending, setIsExtending] = useState(false);

  const modalTimerRef = useRef(null);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.hash = 'auth';
    window.location.reload();
  }, [dispatch]);

  const getTokenRemainingTime = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const remaining = getTokenRemainingTime();
    if (remaining <= 0) return handleLogout();
    setTimeLeft(remaining);
  }, [isExtending, handleLogout]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowModal(true);
          return 0;
        }
        if (prev === expiryWarning) setShowModal(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (showModal) {
      setModalCountdown(expiryWarning);
      modalTimerRef.current = setInterval(() => {
        setModalCountdown(prev => {
          if (prev <= 1) {
            clearInterval(modalTimerRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(modalTimerRef.current);
  }, [showModal, handleLogout]);

  const handleExtend = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return handleLogout();

    setIsExtending(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/extend-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.accessToken) return handleLogout();

      localStorage.setItem('accessToken', data.accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.accessToken });

      const remaining = getTokenRemainingTime();
      if (remaining <= 0) return handleLogout();

      setTimeLeft(remaining);
      setShowModal(false);
      setIsExtending(false);
    } catch {
      setIsExtending(false);
      handleLogout();
    }
  };

  return (
    <>
      {timeLeft > 0 && (
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Session expire dans : {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '20px',
          border: '2px solid #333',
          zIndex: 1000
        }}>
          <p>⏰ Votre session va expirer.</p>
          <p style={{ fontWeight: 'bold', color: 'red' }}>
            Déconnexion automatique dans : {modalCountdown} secondes
          </p>
          <button onClick={handleExtend}>Prolonger</button>
          <button onClick={handleLogout}>Déconnecter</button>
        </div>
      )}
    </>
  );
};

export default SessionManager;
