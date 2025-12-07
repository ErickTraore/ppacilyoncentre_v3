// File: user-backend/app.js

const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');
const cors = require('cors');
const { getSignature } = require('./routes/zoomCtrl');
const apiRouter = require('./apiRouter').router;

const app = express();

// 🔐 CORS
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(o => o.length > 0);

app.use(cors({
  origin: function (origin, callback) {
    // 1️⃣ Précondition : traquer systématiquement l'origin
  if (!origin) {
      console.log("⚠️ Requête sans origin → acceptée (requête serveur ou interne)");
      return callback(null, true); // ✅ Autoriser
    }

    console.log("🌍 Origin reçu :", origin);
    console.log("📜 Liste des origins autorisés :", allowedOrigins);

    // 2️⃣ Validation stricte
    if (isDev || allowedOrigins.includes(origin)) {
      console.log("✅ CORS autorisé pour :", origin);
      return callback(null, true);
    }

    // 3️⃣ Refus explicite
    console.log("❌ CORS refusé pour :", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors());

// 📦 Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔁 Routes
app.get('/', (req, res) => res.status(200).send('USER-BACKEND (prod) actif'));
app.get('/api/zoom/signature', getSignature);
app.use('/api/', apiRouter);

module.exports = app;
