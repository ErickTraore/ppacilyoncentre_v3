// File: frontend/src/components/admin/presse/FormArticlePhoto.jsx

import React, { useState, useRef } from 'react';

const USER_API = process.env.REACT_APP_USER_API || '';
const MEDIA_API = process.env.REACT_APP_MEDIA_API || '';

const FormArticlePhoto = ({ onReset }) => {
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    image: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('✅ Image sélectionnée :', file);
      setNewMessage((prevState) => ({ ...prevState, image: file }));
    } else {
      console.error('❌ Aucune image sélectionnée.');
    }
  };

  const uploadImage = async (file, messageId) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('messageId', messageId);

    try {
      const response = await fetch(`${MEDIA_API}/uploadImage/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`❌ Erreur upload image: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Image envoyée avec succès:', data);
      
      // Retourner le nom du fichier uploadé
      return data.filename || file.name;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called', { title: newMessage.title, hasContent: !!newMessage.content, hasImage: !!newMessage.image });

    if (!newMessage.title || !newMessage.content || !newMessage.image) {
      console.log('❌ Validation failed', { title: !!newMessage.title, content: !!newMessage.content, image: !!newMessage.image });
      setErrorMessage('⚠️ Titre, contenu et image sont obligatoires.');
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
      const base = (USER_API || '').replace(/\/$/, '');
      const messageResponse = await fetch(`${base}/api/users/messages/new`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMessage.title,
          content: newMessage.content,
          categ: 'presse'
        }),
      });

      console.log('📊 Response status:', messageResponse.status, messageResponse.ok);

      if (!messageResponse.ok) {
        throw new Error(`❌ Erreur HTTP ${messageResponse.status}`);
      }

      const { id: newMessageId } = await messageResponse.json();
      console.log('✅ Message créé avec ID:', newMessageId);

      // Uploader l'image
      let uploadedFilename = null;
      try {
        uploadedFilename = await uploadImage(newMessage.image, newMessageId);
        console.log('✅ Image uploadée:', uploadedFilename);
      } catch (error) {
        console.error('⚠️ Erreur lors de l\'upload de l\'image:', error);
      }

      // Mettre à jour l'article avec le nom de l'image si l'upload a réussi
      if (uploadedFilename) {
        try {
          const updateResponse = await fetch(`${(USER_API || '').replace(/\/$/, '')}/api/users/messages/${newMessageId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              attachment: uploadedFilename
            }),
          });

          if (!updateResponse.ok) {
            console.warn('⚠️ Impossible de mettre à jour l\'attachment');
          } else {
            const updateData = await updateResponse.json();
            console.log('✅ Article mis à jour avec l\'image:', uploadedFilename, updateData);
          }
        } catch (error) {
          console.error('⚠️ Erreur lors de la mise à jour:', error);
        }
      }

      // Garder le spinner au minimum 4 secondes pour l'UX
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Réinitialiser le formulaire
      setNewMessage({ title: '', content: '', image: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setErrorMessage('');
      
      // Arrêter le spinner
      setIsLoading(false);
      
      // Afficher le message de succès
      setSuccessMessage('✅ Article publié avec succès !');
      console.log('✅ SUCCESS MESSAGE SET');
      
      setTimeout(() => { setSuccessMessage(''); if (typeof onReset === 'function') onReset(); }, 5000);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      console.error('Error details:', { message: error.message, stack: error.stack });
      setErrorMessage('⚠️ Une erreur est survenue lors de l\'envoi.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
      `}</style>
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

      {/* Champ natif masqué */}
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {/* Bouton personnalisé */}
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        📁 Sélectionner une photo
      </button>

      {newMessage.image && !isLoading && (
        <div style={{ marginTop: '10px' }}>
          <p>📷 Aperçu de l'image :</p>
          <img
            src={URL.createObjectURL(newMessage.image)}
            alt="Aperçu"
            style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #ccc' }}
          />
        </div>
      )}

      {isLoading && (
        <div style={{ 
          marginTop: '10px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px'
        }}>
          <span className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            borderWidth: '4px' 
          }}></span>
          <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            Upload de l'image en cours...
          </p>
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Envoi en cours...' : '📸 Publier'}
      </button>

      {errorMessage && (
        <p style={{ color: 'red' }}>
          <strong>{errorMessage}</strong>
        </p>
      )}
      
      {successMessage && (
        <p style={{ 
          color: 'green', 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '12px',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <strong>{successMessage}</strong>
        </p>
      )}
    </form>
  );
};

export default FormArticlePhoto;
