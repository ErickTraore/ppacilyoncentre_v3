// File: frontend/src/components/pageContent/Home.jsx

import React, { useEffect, useState } from 'react';
import './Home.css';
import MessageList from '../messagelist/MessageList';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <div>
      <div className='home'>
        <h1>Parti des Peuples Africains - Côte d'Ivoire</h1>
      </div>

      <MessageList />
    </div>
  );
};

export default Home;
