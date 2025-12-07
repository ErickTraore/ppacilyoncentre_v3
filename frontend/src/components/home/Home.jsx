// File: frontend/src/components/pageContent/Home.jsx

import React, { useEffect, useState } from 'react';
import './Home.css';
import MessageList from '../messagelist/MessageList';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <div> 
      <MessageList />
    </div>
  );
};

export default Home;
