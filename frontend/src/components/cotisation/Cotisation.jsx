import React, { useState } from 'react';
import './Cotisation.css';
import Adhesion  from '../adhesion/Adhesion';
import Attestation from '../attestation/Attestation';
import Paiement from '../paiement/Paiement';


const Cotisation = () => {
  const [activeSubPage, setActiveSubPage] = useState('benevoles');

  const navigateToSubPage = (subPage) => {
    setActiveSubPage(subPage);
  };

  return (
    <div className="contact-form">
      <ul className="sub-menu">
        <li onClick={() => navigateToSubPage('adhesion')}>Adhésion au PPA-CI</li>
        <li onClick={() => navigateToSubPage('paiement')}>Paiement</li>
        <li onClick={() => navigateToSubPage('attestation')}>Attestation d'adhésion</li>
      </ul>
      <div className="sub-page-content">
        {activeSubPage === 'adhesion' && <Adhesion />}
        {activeSubPage === 'paiement' && <Paiement />}
        {activeSubPage === 'attestation' && <Attestation />}
      </div>
    </div>
  );
};

export default Cotisation;