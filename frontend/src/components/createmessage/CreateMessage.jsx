// File: frontend/src/components/messages/CreateMessage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';

const CreateMessage = () => {
  const [newMessage, setNewMessage] = useState({ tittle: '', content: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewMessage((prev) => ({ ...prev, [name]: value }));
  setErrorMessage('');
};


  const uploadFile = async (file, endpoint, messageId) => {
    const formData = new FormData();
    formData.append(endpoint, file);
    formData.append('messageId', messageId);

    await fetch(`http://localhost:3001/api/upload${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`, {
      method: 'POST',
      body: formData,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.tittle || !newMessage.content) {
      setErrorMessage('⚠️ Un titre et un contenu sont obligatoires.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/messages/new', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tittle: newMessage.tittle, content: newMessage.content }),
      });

      const { id: newMessageId } = await response.json();

      if (newMessage.image) await uploadFile(newMessage.image, 'image', newMessageId);
      if (newMessage.video) await uploadFile(newMessage.video, 'video', newMessageId);

      setNewMessage({ tittle: '', content: '', image: null, video: null });
      document.querySelector("input[name='image']").value = "";
      document.querySelector("input[name='video']").value = "";
      setErrorMessage('');
      dispatch(fetchMessages());
    } catch (error) {
      setErrorMessage("⚠️ Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="text" name="tittle" value={newMessage.tittle} onChange={handleInputChange} placeholder="Titre" required />
      <textarea name="content" value={newMessage.content} onChange={handleInputChange} placeholder="Contenu" maxLength={50000} required />
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        {newMessage.content.length} / 50000 caractères
      </p>
      <label>🖼️ Image :</label>
      <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
      <label>🎥 Vidéo :</label>
      <input type="file" name="video" accept="video/*" onChange={handleFileChange} />
      {errorMessage && <p style={{ color: 'red' }}><strong>{errorMessage}</strong></p>}
      <button type="submit">🚀 Envoyer</button>
    </form>
  );
};

export default CreateMessage;
