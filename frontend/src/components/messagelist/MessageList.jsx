// File: frontend/src/components/messages/MessageList.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';
import '../messagelist/MessageList.css';

const MEDIA_BACKEND_URL = 'http://localhost:3001/api/getMedia';
const MessageList = () => {

  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages.messages);

 useEffect(() => {
  dispatch(fetchMessages());
}, [dispatch]);

useEffect(() => {
  if (!messages || messages.length === 0) return;

  const validMessages = messages.filter((msg) => msg && msg.id);
  if (validMessages.length === 0) return;

  const fetchMediaForMessages = async () => {
    try {
      const enrichedMessages = await Promise.all(
        validMessages.map(async (message) => {
          const response = await fetch(`${MEDIA_BACKEND_URL}/${message.id}`);
          if (!response.ok) {
            console.warn(`Media non trouvé pour le message ${message.id}`);
            return { ...message, media: [] };
          }
          const mediaData = await response.json();
          return { ...message, media: mediaData || [] };
        })
      );

      dispatch({ type: 'UPDATE_MESSAGES', payload: enrichedMessages });
    } catch (error) {
      console.error('Erreur lors du fetch des médias :', error);
    }
  };

  fetchMediaForMessages();
}, [messages]
);



return (
  <div className="messagelist">
    <h2>📝 Liste des articles</h2>

    {!Array.isArray(messages) ? (
      <p className="error-message">Erreur : les données des messages sont invalides.</p>
    ) : messages.length === 0 ? (
      <p className="no-message">📭 Aucun message pour le moment.</p>
    ) : (
      messages.map((message) => (
        <div key={message.id} className="message-card">
          <h3>{message.tittle}</h3>
          <p>{message.content}</p>
          <p className="author">Expédié par : {message.User?.email || 'Utilisateur inconnu'}</p>

          {message.media && message.media.length > 0 && (
            <div>
              <h4>📷 Médias associés :</h4>
              <div className="media-grid">
                {message.media.map((file) => (
                  <div key={file.filename} className="media-item">
                    {file.type === 'image' ? (
                      <img
                        src={`http://localhost:3001/uploads/images/${file.filename}`}
                        alt="Message media"
                      />
                    ) : (
                      <video controls>
                        <source
                          src={`http://localhost:3001/uploads/videos/${file.filename}`}
                          type="video/mp4"
                        />
                        Votre navigateur ne supporte pas la lecture des vidéos.
                      </video>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);
}
export default MessageList;
