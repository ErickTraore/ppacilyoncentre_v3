// File: frontend/src/components/messages/Messages.jsx


import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';

const MEDIA_BACKEND_URL = 'http://localhost:3001/api/getMedia';

const Messages = () => {
  const [newMessage, setNewMessage] = useState({
    tittle: '',
    content: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages.messages);

  useEffect(() => {
    dispatch(fetchMessages());

    const fetchMediaForMessages = async () => {
      try {
        const enrichedMessages = await Promise.all(
          messages.map(async (message) => {
            if (!message.id) {
              console.warn("⚠️ Message sans ID détecté :", message);
              return { ...message, media: [] };
            }

            try {
              const response = await fetch(`${MEDIA_BACKEND_URL}/${message.id}`);

              if (!response.ok) {
                // On log juste si besoin, mais on ne bloque rien
                console.info(`ℹ️ Aucun média pour le message ${message.id} (status ${response.status})`);
                return { ...message, media: [] };
              }

              const mediaData = await response.json();
              return { ...message, media: mediaData || [] };
            } catch (error) {
              console.error(`❌ Erreur chargement médias pour message ${message.id}:`, error);
              return { ...message, media: [] };
            }
          })
        );
        dispatch({ type: 'UPDATE_MESSAGES', payload: enrichedMessages });
      } catch (error) {
        console.error("❌ Erreur lors du chargement des médias:", error);
      }
    };
    fetchMediaForMessages();
  }, [dispatch]
  );

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      console.log(`✅ Fichier sélectionné (${name}):`, file);
      setNewMessage((prevState) => ({
        ...prevState,
        [name]: file,
      }));
    } else {
      console.error(`❌ Aucune ${name} sélectionnée.`);
    }
  };

  const uploadFile = async (file, endpoint, messageId) => {
    console.log(`🚀 Uploading ${endpoint}...`);
    const formData = new FormData();
    formData.append(endpoint, file);
    formData.append('messageId', messageId);

    console.log(`🔍 Contenu détaillé de FormData (${endpoint}) avant envoi:`, [...formData.entries()]);

    try {
      const response = await fetch(`http://localhost:3001/api/upload${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`❌ Erreur lors de l’upload ${endpoint}: ${response.status}`);
      }

      console.log(`✅ ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} envoyée avec succès !`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'upload de ${endpoint}:`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.tittle || !newMessage.content) {
      setErrorMessage('⚠️ Un titre et un contenu sont obligatoires.');
      return;
    }
    if (newMessage.content.length > 50000) {
      setErrorMessage('⚠️ Le contenu est trop volumineux (max 50000 caractères).');
      return;
    }

    try {
      const messageResponse = await fetch('http://localhost:5000/api/users/messages/new', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tittle: newMessage.tittle, content: newMessage.content }),
      });

      if (!messageResponse.ok) {
        let errorMessage = `❌ Erreur HTTP ${messageResponse.status}`;
        try {
          const errorData = await messageResponse.json();
          if (errorData?.error) {
            errorMessage += `: ${errorData.error}`;
          }
        } catch (jsonError) {
          console.warn("⚠️ Impossible de lire le corps JSON de l'erreur :", jsonError);
        }
        throw new Error(errorMessage);
      }


      const { id: newMessageId } = await messageResponse.json();

      if (newMessage.image) {
        await uploadFile(newMessage.image, 'image', newMessageId);
      }
      if (newMessage.video) {
        await uploadFile(newMessage.video, 'video', newMessageId);
      }

      setNewMessage({ tittle: '', content: '', image: null, video: null });

      document.querySelector("input[name='image']").value = "";
      document.querySelector("input[name='video']").value = "";

      setErrorMessage('');
      dispatch(fetchMessages());
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi:", error);
      setErrorMessage("⚠️ Une erreur est survenue lors de l'envoi.");
    }
  };
  return (
    <div>
      <h1>📩 Article</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="tittle" value={newMessage.tittle} onChange={handleInputChange} placeholder="Titre" required />
        <textarea name="content" value={newMessage.content} onChange={handleInputChange} placeholder="Contenu" required />

        <label>🖼️ Entrez une image :</label>
        <input type="file" name="image" accept="image/*" onChange={handleFileChange} />

        <label>🎥 Entrez une vidéo :</label>
        <input type="file" name="video" accept="video/*" onChange={handleFileChange} />

        {errorMessage && <p style={{ color: 'red' }}><strong>{errorMessage}</strong></p>}
        <button type="submit">🚀 Envoyer</button>
      </form>

      <h2>📝 Liste des messages</h2>
      {messages.map((message) => (
        <div key={message.id}>
          <h3>{message.tittle}</h3>
          <p>{message.content}</p>
          <p>Expédié par: {message.User ? message.User.email : 'Utilisateur inconnu'}</p>

          {/* ✅ Affichage des médias associés */}
          {message.media && message.media.length > 0 && (
            <div>
              <h4>📷 Médias associés :</h4>
              {message.media.map((file) => (
                <div key={file.filename}>
                  {file.type === 'image' ? (
                    <img src={`http://localhost:3001/uploads/images/${file.filename}`} alt="Message media" width="200px" />
                  ) : (
                    <video width="200px" controls>
                      <source src={`http://localhost:3001/uploads/videos/${file.filename}`} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture des vidéos.
                    </video>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Messages;
