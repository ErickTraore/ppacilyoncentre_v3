// File: frontend/src/components/presseLocale/PresseLocaleManager.jsx
// Vue "Gérer" pour la presse locale (ppacilyoncentre)

import React from 'react';
import MessageList from '../messagelist/MessageList';

const PresseLocaleManager = () => {
  return (
    <div className="admin-presse-manager">
      <h1 className="admin-title">🔧 Gestion Presse Locale</h1>
      <MessageList categ="presse-locale" />
    </div>
  );
};

export default PresseLocaleManager;

