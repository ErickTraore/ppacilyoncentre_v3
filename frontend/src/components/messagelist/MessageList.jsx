// Rendu presse générale Consulter — aligné cppeurope (PresseList + PresseTextOnly)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';
import '../../styles/pages/MessagesList.scss';

const API_BASE = (process.env.REACT_APP_USER_API || '').replace(/\/$/, '');

const getMessageViewType = (message) => {
  const media = message.media;
  const hasMedia = Array.isArray(media) && media.length > 0;
  if (!hasMedia) return 'text-only';
  const hasImage = media.some((m) => m.type === 'image');
  const hasVideo = media.some((m) => m.type === 'video');
  if (hasImage && !hasVideo) return 'image-only';
  if (!hasImage && hasVideo) return 'video-only';
  if (hasImage && hasVideo) return 'image-and-video';
  return 'text-only';
};

const TITLES = { presse: '📝 Presse PPA-CI', 'presse-locale': '📍 Presse Locale' };

const MessageList = ({ categ = 'presse', embed = false }) => {
  const dispatch = useDispatch();
  const messagesByCateg = useSelector((state) => state.messages.messagesByCateg) || {};
  const messages = messagesByCateg[categ] ?? [];
  const [activeId, setActiveId] = useState(null);
  const [activeImageId, setActiveImageId] = useState(null);
  const toggle = (id) => setActiveId((prev) => (prev === id ? null : id));
  const isActive = (id) => activeId === id;
  const toggleImageText = (id) => setActiveImageId((prev) => (prev === id ? null : id));
  const isImageActive = (id) => activeImageId === id;

  useEffect(() => {
    dispatch(fetchMessages(categ));
  }, [dispatch, categ]);

  const renderMessage = (message) => {
    const type = getMessageViewType(message);
    const author = message.User?.email || 'Utilisateur inconnu';
    const date = message.createdAt ? new Date(message.createdAt).toLocaleString() : '';

    if (type === 'text-only') {
      return (
        <div
          key={message.id}
          className={`presse__message presse__message--text-only`}
        >
          <div className="presse__message__header" onClick={() => toggle(message.id)}>
            <p className="presse__message__header__title">{message.title}</p>
            <p className="presse__message__header__author">
              Expédié par : {author}
              <span className="presse__message__header__author__date"> ({date})</span>
            </p>
          </div>
          {isActive(message.id) && (
            <p className="presse__message__content">{message.content}</p>
          )}
        </div>
      );
    }

    if (type === 'image-only') {
      return (
        <div
          key={message.id}
          className={`presse__message presse__message--image-only ${isImageActive(message.id) ? 'active' : ''}`}
        >
          <div className="presse__message__header" onClick={() => toggleImageText(message.id)}>
            <p className="presse__message__header__title">{message.title}</p>
            <p className="presse__message__header__author">
              Expédié par : {author}
              <span className="presse__message__header__author__date"> ({date})</span>
            </p>
          </div>
          <div className="presse__message__media">
            <div className="presse__message__media__grid">
              {message.media.map((file, index) => (
                <div key={file.filename || file.id || index}>
                  <img src={`${API_BASE}/api/uploads/images/${file.filename}`} alt="" />
                </div>
              ))}
            </div>
          </div>
          {isImageActive(message.id) && (
            <p className="presse__message__content">{message.content}</p>
          )}
        </div>
      );
    }

    if (type === 'video-only' || type === 'image-and-video') {
      return (
        <div
          key={message.id}
          className={`presse__message presse__message--${type} ${isImageActive(message.id) ? 'active' : ''}`}
        >
          <div className="presse__message__header" onClick={() => toggleImageText(message.id)}>
            <p className="presse__message__header__title">{message.title}</p>
            <p className="presse__message__header__author">
              Expédié par : {author}
              <span className="presse__message__header__author__date"> ({date})</span>
            </p>
          </div>
          <div className="presse__message__media">
            <div className="presse__message__media__grid">
              {message.media?.map((file, index) => (
                <div key={file.filename || file.id || index}>
                  {file.type === 'image' ? (
                    <img src={`${API_BASE}/api/uploads/images/${file.filename}`} alt="" />
                  ) : (
                    <video controls>
                      <source src={`${API_BASE}/api/uploads/videos/${file.filename}`} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isImageActive(message.id) && (
            <p className="presse__message__content">{message.content}</p>
          )}
        </div>
      );
    }

    return (
      <div key={message.id} className="presse__message presse__message--text-only">
        <p>⚠️ Format non reconnu.</p>
      </div>
    );
  };

  const listContent =
    !Array.isArray(messages) || messages.length === 0 ? (
      <div className="presse__container__messagelist__empty">
        <h3 className="presse__container__messagelist__empty__nothing">📭 Aucun message</h3>
        <p className="presse__container__messagelist__empty__add">
          Connectez-vous pour publier le premier message.
        </p>
      </div>
    ) : (
      messages.map(renderMessage)
    );

  if (embed) {
    return <>{listContent}</>;
  }

  return (
    <div className="presse">
      <div className="presse__container">
        <div className="presse__container__title">{TITLES[categ] || TITLES.presse}</div>
        <div className="presse__container__messagelist">{listContent}</div>
      </div>
    </div>
  );
};

export default MessageList;
