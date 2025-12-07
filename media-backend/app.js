// File: media-backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware pour parser les fichiers multipart/form-data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔐 CORS pour domaine public uniquement
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: function (origin, callback) {
    if (isDev || !origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// 🔓 Servir les fichiers statiques uploadés (identique à l’existant)
app.use('/api/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/api/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));
app.use('/imagesprofile', express.static(path.join(__dirname, 'uploads/imagesprofile')));

// 🔹 Sert les images par défaut (identique à l’existant)
app.use('/mediaprofile', express.static(path.join(__dirname, 'public/mediaprofile')));
// ✅ Alias supplémentaire pour compatibilité avec le frontend
app.use('/api/media/mediaprofile', express.static(path.join(__dirname, 'public/mediaprofile')));
app.use('/imagesprofile', express.static(path.join(__dirname, 'uploads/imagesprofile')));

// Routes API (identique à l’existant)
const apiRouter = require('./apiRouter').router;
app.use('/api/media/', apiRouter);

module.exports = app;
