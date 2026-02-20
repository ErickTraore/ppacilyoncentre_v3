const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
dotenv.config({ path: path.join(__dirname, '.env.production') });
const { router } = require('./apiRouter');
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/', (_, r) => r.status(200).send('Presse Locale Backend ppacilyoncentre'));
// Même montage que cppeurope : nginx envoie /api/presse-locale/* → :7105/api/*, donc on monte sous /api
app.use('/api', router);
module.exports = app;
