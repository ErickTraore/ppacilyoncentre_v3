// File: frontend/src/actions/messageActions.js

import { FETCH_MESSAGES } from './types';

const USER_API = process.env.REACT_APP_USER_API;
const PRESSE_LOCALE_API = process.env.REACT_APP_PRESSE_LOCALE_API || process.env.REACT_APP_USER_API;
const MEDIA_API = process.env.REACT_APP_USER_MEDIA;

/** Presse générale = user-backend (PresseGle). Presse locale = presseLocale-backend (PresseLocale). */
export const fetchMessages = (categ) => {
  return async dispatch => {
    const key = categ === 'presse-locale' ? 'presse-locale' : 'presse';
    const baseUrl = key === 'presse-locale' ? PRESSE_LOCALE_API : USER_API;
    const siteKey = process.env.REACT_APP_PRESSE_LOCALE_SITE_KEY || 'ppacilyoncentre';
    const url = key === 'presse-locale'
      ? `${baseUrl}/messages/?categ=presse-locale&siteKey=${encodeURIComponent(siteKey)}`
      : `${baseUrl}/api/users/messages/`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      dispatch({ type: FETCH_MESSAGES, payload: { categ: key, messages: Array.isArray(data) ? data : [] } });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages', error);
      dispatch({ type: FETCH_MESSAGES, payload: { categ: key, messages: [] } });
    }
  };
};
export const fetchMediaForMessages = (messageIds) => async (dispatch) => {
  try {
    const mediaData = {};
    for (const messageId of messageIds) {
      const response = await fetch(`${MEDIA_API}/media/api/media/message/${messageId}`);
      const data = await response.json();
      mediaData[messageId] = data;
    }
    dispatch({ type: 'FETCH_MEDIA_SUCCESS', payload: mediaData });
  } catch (error) {
    console.error("❌ Erreur lors du chargement des médias:", error);
    dispatch({ type: 'FETCH_MEDIA_ERROR', error });
  }
};


export const addMessage = (formData) => {
  return async dispatch => {
    try {
      const messageData = {
        title: formData.get('title'),
        content: formData.get('content'),
      };

      await fetch(`${USER_API}/api/users/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const mediaFormData = new FormData();
      if (formData.get('image')) {
        mediaFormData.append('image', formData.get('image'));
      }
      if (formData.get('video')) {
        mediaFormData.append('video', formData.get('video'));
      }

      if (formData.get('image') && formData.get('video')) {
        await fetch(`${USER_API}/media/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: mediaFormData,
        });
      }

      dispatch(fetchMessages());
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message', error);
    }
  };
  
};
