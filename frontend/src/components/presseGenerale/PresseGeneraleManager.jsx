// PresseGeneraleManager.jsx - Interface CRUD Gérer la presse générale

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';
import './PresseGeneraleManager.css';

const MEDIA_API = process.env.REACT_APP_MEDIA_API || '';
const API_BASE = (process.env.REACT_APP_USER_API || '').replace(/\/$/, '');
const messagesBase = () => `${API_BASE}/api/users/messages`;
const getMediaSrc = (m) => (m && (m.path || m.url) && (m.path.startsWith('http') || m.path.startsWith('/')) ? (m.path || m.url) : (m && m.filename ? `${API_BASE}/api/uploads/${(m.type || '').toLowerCase() === 'video' ? 'videos' : 'images'}/${m.filename}` : ''));

const PresseGeneraleManager = () => {
  const dispatch = useDispatch();
  const messagesByCateg = useSelector((s) => s.messages.messagesByCateg) || {};
  const messagesList = useMemo(() => (Array.isArray(messagesByCateg.presse) ? messagesByCateg.presse : []), [messagesByCateg.presse]);

  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', link: '', attachment: '' });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [messageMedia, setMessageMedia] = useState({});

  useEffect(() => { dispatch(fetchMessages('presse')); }, [dispatch]);

  useEffect(() => {
    if (messagesList.length === 0) return;

    const loadMedia = async () => {
      const media = {};
      for (const msg of messagesList) {
        try {
          const res = await fetch(`${MEDIA_API}/getMedia/${msg.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
          });
          if (res.ok) {
            const data = await res.json();
            const normalized = (Array.isArray(data) ? data : []).map(f => ({
              ...f,
              path: f.url || (f.path ? f.path.replace("/usr/src/app/uploads", "/media-backend") : "")
            }));
            media[msg.id] = normalized;
          }
        } catch (err) {
          console.error(`Erreur média ${msg.id}:`, err);
        }
      }
      setMessageMedia(media);
    };
    loadMedia();
  }, [messagesList]);

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const resetForm = () => {
    setFormData({ title: '', content: '', link: '', attachment: '' });
    setImageFile(null);
    setVideoFile(null);
    setEditingId(null);
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setFormData({ title: msg.title || '', content: msg.content || '', link: msg.link || '', attachment: msg.attachment || '' });
    setImageFile(null);
    setVideoFile(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${messagesBase()}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Erreur');

      if (imageFile) {
        const existingImage = messageMedia[editingId]?.find(m => m.type === 'image');
        if (existingImage) {
          await fetch(`${MEDIA_API}/media/${existingImage.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('messageId', editingId);
        await fetch(`${MEDIA_API}/uploadImage`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
      }

      if (videoFile) {
        const existingVideo = messageMedia[editingId]?.find(m => m.type === 'video');
        if (existingVideo) {
          await fetch(`${MEDIA_API}/media/${existingVideo.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        const fd = new FormData();
        fd.append('video', videoFile);
        fd.append('messageId', editingId);
        await fetch(`${MEDIA_API}/uploadVideo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
      }

      alert('✅ Modifié !');
      resetForm();
      dispatch(fetchMessages('presse'));
    } catch (error) {
      alert('❌ Erreur modification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Supprimer ?')) return;
    try {
      const res = await fetch(`${messagesBase()}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("accessToken")}` }
      });
      if (!res.ok) throw new Error('Erreur');
      alert('✅ Supprimé !');
      dispatch(fetchMessages('presse'));
    } catch (error) {
      alert('❌ Erreur suppression');
    }
  };

  return (
    <div className="admin-presse-manager">
      <h1 className="admin-title">🔧 GESTION PRESSE (ADMIN)</h1>

      <div className="messages-list">
        <h2>📋 Messages existants ({messagesList.length})</h2>
        {messagesList.length === 0 ? (
          <p className="no-messages">Aucun message</p>
        ) : (
          messagesList.map((msg) => {
            const mediaList = messageMedia[msg.id] ?? msg.media ?? [];
            return (
            <div key={msg.id} className="message-card">
              {editingId === msg.id ? (
                <form onSubmit={handleUpdate} className="crud-form">
                  <h3>✏️ Modifier #{msg.id}</h3>
                  <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
                  <textarea value={formData.content} onChange={(e) => handleChange('content', e.target.value)} required rows="5" />
                  <input type="text" value={formData.link} onChange={(e) => handleChange('link', e.target.value)} />
                  <input type="text" value={formData.attachment} onChange={(e) => handleChange('attachment', e.target.value)} />

                  {mediaList.length > 0 && (
                    <div className="message-media">
                      <h4>📁 Médias actuels :</h4>
                      {mediaList.map((m) => (
                        <div key={m.id} className="media-item-display">
                          {m.type === 'image' ? (
                            <div className="media-preview">
                              <img src={getMediaSrc(m)} alt={m.filename} className="media-thumbnail" />
                              <span className="media-filename">🖼️ {m.filename}</span>
                            </div>
                          ) : (
                            <div className="media-preview">
                              <video controls className="media-thumbnail">
                                <source src={getMediaSrc(m)} type="video/mp4" />
                              </video>
                              <span className="media-filename">🎥 {m.filename}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="media-upload-section">
                    <h4>🔄 Remplacer les médias :</h4>

                    {mediaList.some(m => (m.type || '').toLowerCase() === 'image') && (
                      <div className="media-upload">
                        <label>📷 Remplacer l'image :</label>
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                        {imageFile && <p className="file-count">✅ {imageFile.name} sélectionnée</p>}
                      </div>
                    )}

                    {mediaList.some(m => (m.type || '').toLowerCase() === 'video') && (
                      <div className="media-upload">
                        <label>🎥 Remplacer la vidéo :</label>
                        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
                        {videoFile && <p className="file-count">✅ {videoFile.name} sélectionnée</p>}
                      </div>
                    )}

                    {mediaList.length === 0 && (
                      <p className="media-note">📝 Cet article est de type "Texte seul" - aucun média ne peut être ajouté.</p>
                    )}

                    {mediaList.length > 0 && (
                      <p className="media-note">💡 Vous pouvez uniquement remplacer les médias existants. Le type d'article ne peut pas être modifié.</p>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">💾 Sauvegarder</button>
                    <button type="button" onClick={resetForm} className="btn-cancel">❌ Annuler</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="message-header">
                    <h3 onClick={() => toggleExpand(msg.id)} className="message-title-clickable">{msg.title}</h3>
                    <span className="message-id">ID: {msg.id}</span>
                  </div>
                  {expandedId === msg.id && (
                    <>
                      <p className="message-content">{msg.content}</p>
                      {msg.link && <p className="message-link">🔗 <a href={msg.link} target="_blank" rel="noopener noreferrer">{msg.link}</a></p>}
                      {msg.attachment && <p className="message-attachment">📎 {msg.attachment}</p>}
                      {mediaList.length > 0 && (
                    <div className="message-media">
                      <h4>📁 Médias :</h4>
                      <div className="media-gallery">
                        {mediaList.map((m) => (
                          <div key={m.id} className="media-item-card">
                            {m.type === 'image' ? (
                              <img src={getMediaSrc(m)} alt={m.filename} className="media-display" />
                            ) : (
                              <video controls className="media-display">
                                <source src={getMediaSrc(m)} type="video/mp4" />
                              </video>
                            )}
                            <div className="media-card-footer">
                              <span className="media-label">{m.type === 'image' ? '🖼️' : '🎥'} {m.filename}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                      )}
                    </>
                  )}
                  <div className="message-actions">
                    <button onClick={() => handleEdit(msg)} className="btn-edit">✏️ Modifier</button>
                    <button onClick={() => handleDelete(msg.id)} className="btn-delete">🗑️ Supprimer</button>
                  </div>
                </>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default PresseGeneraleManager;
