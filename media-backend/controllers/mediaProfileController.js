// File:ppacilyoncentre/media-backend/controllers/mediaProfileController.js

const { MediaProfile } = require('../models'); // Sequelize ou autre ORM

// ✅ POST /api/mediaProfile/
exports.createMediaProfile = async (req, res) => {
  try {
    const newMedia = await MediaProfile.create(req.body);
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ error: 'Erreur création média', details: error.message });
  }
};

// ✅ PUT /api/mediaProfile/:id/
exports.updateMediaProfile = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { url } = req.body;

  console.log('📥 Requête reçue pour updateMediaProfile :', id, url);

  try {
    const media = await MediaProfile.findByPk(id); // ✅ recherche par clé primaire
    if (!media) {
      console.log('❌ Média introuvable pour id :', id);
      return res.status(404).json({ error: 'Média introuvable' });
    }

    media.path = url;
    media.filename = url.split('/').pop();
    await media.save();

    console.log('✅ Média mis à jour :', {
      id: media.id,
      filename: media.filename,
      path: media.path,
    });

    res.json(media);
  } catch (err) {
    console.error('❌ Erreur updateMediaProfile :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// ✅ DELETE /api/mediaProfile/:id/
exports.deleteMediaProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await MediaProfile.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ error: 'Média introuvable' });
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression média', details: error.message });
  }
};

exports.getMediaByProfileId = async (req, res) => {
  const { profileId } = req.params;
  console.log('📥 Requête reçue pour getMediaByProfileId :', profileId);

  try {
    const mediaList = await MediaProfile.findAll({ where: { profileId } });
    console.log(`✅ ${mediaList.length} médias trouvés pour profileId ${profileId}`);
    res.status(200).json(mediaList);
  } catch (error) {
    console.error('❌ Erreur récupération médias :', error.message);
    res.status(500).json({ error: 'Erreur récupération médias', details: error.message });
  }
};



