// File: stack-zoom/frontend/src/components/pageContent/PageContent.jsx

import React from 'react';
import Auth from '../auth/Auth';
import Register from '../register/Register';
import '../pageContent/PageContent.css';
import Home from '../home/Home';
import ContactForm from '../contactForm/ContactForm';
import Login from '../login/Login';
import MessageList from '../messagelist/MessageList';
import PresseGeneraleConsulter from '../presseGenerale/PresseGeneraleConsulter';
import Presse from '../admin/presse/Presse';
import PresseGeneraleManager from '../presseGenerale/PresseGeneraleManager';
import PresseLocaleManager from '../presseLocale/PresseLocaleManager';
import ProfilePage from '../profilepage/ProfilePage';

const PageContent = ({ activePage }) => {
  return (
    <div className="content" key={activePage}>
      {activePage === 'home' && <Home />}
      {activePage === 'auth' && <Auth />}
      {activePage === 'register' && <Register />}
      {activePage === 'contact' && <ContactForm />}
      {activePage === 'login' && <Login />}

      {/* Presse générale / locale - liste (Consulter + vue publique) */}
      {activePage === 'messagelist' && <MessageList categ="presse" />}
      {activePage === 'newpresse' && <PresseGeneraleConsulter />}
      {activePage === 'newpresse-locale' && (
        <div className="presse-page">
          <div className="presse">
            <div className="presse__container">
              <div className="presse__container__title">📍 Presse Locale</div>
              <div className="presse__container__messagelist">
                <MessageList categ="presse-locale" embed />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gérer presse générale / locale → vues dédiées */}
      {activePage === 'presse-generale' && <PresseGeneraleManager />}
      {activePage === 'presse-locale' && <PresseLocaleManager />}

      {/* Créer presse générale / locale → formulaire de création */}
      {(activePage === 'presse' ||
        activePage === 'admin-presse-generale' ||
        activePage === 'admin-presse-locale') && (
        <Presse categ={activePage === 'admin-presse-locale' ? 'presse-locale' : 'presse'} />
      )}
      {activePage === 'profilepage' && <ProfilePage userId={1} />} 
    </div>
  );
};

export default PageContent;
