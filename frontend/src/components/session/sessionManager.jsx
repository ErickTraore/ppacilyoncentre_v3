// File: frontend/src/components/session/SessionManager.jsx
// Modale 60s au login ; après "Prolonger", timer = durée JWT (30 min côté backend).

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../common/Spinner';

const USER_API = process.env.REACT_APP_USER_API;
const expiryWarning = parseInt(process.env.REACT_APP_SESSION_EXPIRY_WARNING, 10) || 60;

const SessionContext = createContext({
  timeLeft: 0,
  setTimeLeft: () => {},
  switchToRealToken: () => {},
  isInitialSession: true,
  justLoggedIn: false,
});

export const useSessionTimer = () => {
  const context = useContext(SessionContext);
  return context?.timeLeft || 0;
};

// SessionProvider : logique strictement identique à cppeurope (validée en prod)
export const SessionProvider = ({ children, isAuthenticated = false, accessToken = null }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isInitialSession, setIsInitialSession] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const prevAuthRef = useRef(false);
  const lastTokenRef = useRef(null);

  const getTokenRemainingTime = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (!decoded.exp || typeof decoded.exp !== 'number') return 0;
      return decoded.exp - now;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!isAuthenticated) {
      lastTokenRef.current = null;
      setTimeLeft(0);
      setIsInitialSession(true);
      setJustLoggedIn(false);
      return;
    }

    if (isAuthenticated && !wasAuth) {
      lastTokenRef.current = accessToken;
      setIsInitialSession(true);
      setJustLoggedIn(true);
      setTimeLeft(expiryWarning);
      sessionStorage.setItem('sessionJustLoggedIn', '1');
    }

    if (isAuthenticated && wasAuth && accessToken && accessToken !== lastTokenRef.current) {
      lastTokenRef.current = accessToken;
      setIsInitialSession(false);
      setJustLoggedIn(false);
      setTimeLeft(getTokenRemainingTime());
      sessionStorage.removeItem('sessionJustLoggedIn');
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isInitialSession && justLoggedIn) {
      setTimeLeft(expiryWarning);
      let current = expiryWarning;
      const timer = setInterval(() => {
        current -= 1;
        setTimeLeft(current);
        if (current <= 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isInitialSession, justLoggedIn, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isInitialSession && !justLoggedIn) {
      const updateTimeLeft = () => {
        const remaining = getTokenRemainingTime();
        setTimeLeft(remaining > 0 ? remaining : 0);
      };
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitialSession, justLoggedIn, isAuthenticated]);

  const switchToRealToken = () => {
    setIsInitialSession(false);
    setJustLoggedIn(false);
  };

  return (
    <SessionContext.Provider
      value={{ timeLeft, setTimeLeft, switchToRealToken, isInitialSession, justLoggedIn }}
    >
      {children}
    </SessionContext.Provider>
  );
};

const SessionManager = () => {
  const dispatch = useDispatch();
  const context = useContext(SessionContext);
  const timeLeft = context?.timeLeft || 0;
  const setTimeLeft = context?.setTimeLeft || (() => {});
  const switchToRealToken = context?.switchToRealToken || (() => {});
  const isInitialSession = context?.isInitialSession ?? true;
  const justLoggedIn = context?.justLoggedIn ?? false;
  const [showModal, setShowModal] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const hasInitialized = useRef(false);

  const VisualTimer = ({ timeLeft, onLogout }) => {
    let color = '#4caf50'; // vert
    let iconClass = 'fa-lock-open';
    if (timeLeft <= 20 && timeLeft > 5) {
      color = '#ff9800'; // orange
    } else if (timeLeft <= 5) {
      color = '#f44336'; // rouge
      iconClass = 'fa-lock';
    }
    return (
      <div
        className="App__header__actions__cadenas"
        onClick={onLogout}
      >
        <i
          className={`App__header__actions__cadenas__icon fas ${iconClass}`}
          style={{ color }}
        />
        <span
          className="App__header__actions__cadenas__timer"
          style={{ color }}
        >
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('sessionJustLoggedIn');
    window.location.hash = 'auth';
    window.location.reload();
  }, [dispatch]);

  const handleExtend = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return handleLogout();

    setIsExtending(true);

    try {
      const response = await fetch(`${USER_API}/api/users/extend-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.accessToken) {
        return handleLogout();
      }

      localStorage.setItem('accessToken', data.accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.accessToken });

      const remaining = (() => {
        try {
          const decoded = jwtDecode(data.accessToken);
          const now = Math.floor(Date.now() / 1000);
          return decoded?.exp && typeof decoded.exp === 'number'
            ? Math.max(0, decoded.exp - now)
            : 0;
        } catch {
          return 0;
        }
      })();

      switchToRealToken();
      setTimeLeft(remaining);
      setShowModal(false);
      setIsExtending(false);
    } catch (err) {
      setIsExtending(false);
      handleLogout();
    }
  };

  useEffect(() => {
    const sessionJustLoggedIn = sessionStorage.getItem('sessionJustLoggedIn') === '1';
    const hash = window.location.hash.slice(1);
    const isAuthPage = hash === 'auth';
    if (sessionJustLoggedIn && !hasInitialized.current && !isAuthPage) {
      hasInitialized.current = true;
      setShowModal(true);
      sessionStorage.removeItem('sessionJustLoggedIn');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (showModal && timeLeft <= 0) return handleLogout();
  }, [showModal, timeLeft, handleLogout]);

  useEffect(() => {
    if (!showModal && !isInitialSession && !justLoggedIn && timeLeft <= 0) {
      handleLogout();
    }
  }, [showModal, isInitialSession, justLoggedIn, timeLeft, handleLogout]);

  return (
    <>
      <VisualTimer timeLeft={timeLeft} onLogout={handleLogout} />
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '20px',
            border: '2px solid #333',
            zIndex: 1000,
          }}
        >
          <p>Votre session va expirer.</p>
          <p key={timeLeft} style={{ fontWeight: 'bold', color: 'red' }}>
            Déconnexion automatique dans : {Math.max(timeLeft, 0)} secondes
          </p>
          <button type="button" onClick={handleExtend} disabled={isExtending} data-testid="prolonger-session" aria-label="Prolonger la session">
            {isExtending ? <Spinner size="small" inline={true} /> : 'Prolonger'}
          </button>
          <button onClick={handleLogout}>Déconnecter</button>
        </div>
      )}
    </>
  );
};

export default SessionManager;
