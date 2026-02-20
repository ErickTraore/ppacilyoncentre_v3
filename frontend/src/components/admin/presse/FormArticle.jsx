// File: frontend/src/components/admin/presse/FormArticle.jsx


import React, { useState } from 'react';

const USER_API = process.env.REACT_APP_USER_API;
const PRESSE_LOCALE_API = process.env.REACT_APP_PRESSE_LOCALE_API || USER_API;

const FormArticle = ({ onReset, categ = 'presse' }) => {
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.title || !newMessage.content) {
      setErrorMessage('⚠️ Un titre et un contenu sont obligatoires.');
      return;
    }

    if (newMessage.content.length > 50000) {
      setErrorMessage('⚠️ Le contenu est trop volumineux (max 50000 caractères).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const isLocale = categ === 'presse-locale';
      const url = isLocale ? `${PRESSE_LOCALE_API}/messages/new` : `${USER_API}/api/users/messages/new/`;
      const body = isLocale
        ? { title: newMessage.title, content: newMessage.content, categ: 'presse-locale', siteKey: process.env.REACT_APP_PRESSE_LOCALE_SITE_KEY || 'ppacilyoncentre' }
        : { title: newMessage.title, content: newMessage.content, categ: 'presse' };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`❌ Erreur HTTP ${response.status}`);
      }

      setNewMessage({ title: '', content: '' });
      setErrorMessage('');
      setSuccessMessage('✅ Article publié avec succès !');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi:", error);
      setErrorMessage("⚠️ Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={newMessage.title}
        onChange={handleInputChange}
        placeholder="Titre"
        required
      />
      <textarea
        name="content"
        value={newMessage.content}
        onChange={handleInputChange}
        placeholder="Contenu"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '⏳ Envoi en cours...' : '🚀 Envoyer'}
      </button>
      {isLoading && (
        <div className="spinner" style={{ marginTop: '10px', color: '#666' }}>
          <p>📤 Publication en cours...</p>
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}><strong>{errorMessage}</strong></p>}
      {successMessage && (
        <p
          style={{
            color: 'green',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            padding: '12px',
            borderRadius: '4px',
            marginTop: '15px',
          }}
        >
          <strong>{successMessage}</strong>
        </p>
      )}
    </form>
  );
};

export default FormArticle;
