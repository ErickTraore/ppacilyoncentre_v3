// File: user-backend/routes/infoProfileCtrl.js

const { Profile, User } = require('../models');

// 🔍 Lire un profil par ID (création auto si absent)
exports.getInfoProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token invalide ou userId absent' });
    }
    let profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
      profile = await Profile.create({
        userId,
        email: user.email || `user-${userId}@ppacilyoncentre.com`,
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        phone3: '',
        address: ''
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('❌ Erreur lecture profil utilisateur :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
  }
};




// ✏️ Mettre à jour un profilInfo
exports.updateInfoProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Profile.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: 'Profil non trouvé ou non modifié.' });
    }
    const profile = await Profile.findByPk(id);
    res.status(200).json(profile);
  } catch (error) {
    console.error('❌ Erreur mise à jour profil :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


// 🆕 Créer un nouveau profil
exports.createInfoProfile = async (req, res) => {
  try {
    const profile = await Profile.create(req.body);
    res.status(201).json(profile);
  } catch (error) {
    console.error('❌ Erreur création profil :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 🗑️ Supprimer un profil
exports.deleteInfoProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Profile.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Profil introuvable.' });
    }
    res.status(200).json({ message: 'Profil supprimé avec succès.' });
  } catch (error) {
    console.error('❌ Erreur suppression profil :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
