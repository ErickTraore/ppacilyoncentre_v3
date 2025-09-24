import React, { useEffect } from 'react';
import Image1 from '../../assets/gbagbonoel.jpeg';
import Image2 from '../../assets/Abobi.jpeg';
import Icon1 from '../../assets/play.png';
import './Card.scss';

const Card = () => {
  useEffect(() => { 
    const cards = document.querySelectorAll('.card__container__global__item');

    cards.forEach(card => { 
      card.addEventListener('click', function() { 
        cards.forEach(c => c.classList.remove('active')); 
        this.classList.add('active'); 
      });
    });

    return () => { 
      cards.forEach(card => { 
        card.removeEventListener('click', function() { 
          this.classList.remove('active'); 
        });
      });
    };
  }, []);
  
  return (
    <div className='card__container'>
      <div className='card__container__global'>
        <figure className='card__container__global__item'>
          <div className="card__container__global__item__image-wrapper">
            <img src={Image1} className="menu-image" alt="logo" />
          </div>
          <button className='button__item'>
            <img src={Icon1} alt="play" />
          </button>
          <figcaption className='overlay'>
            <div>Joyeux Noël 2025.</div>
            <div>Laurent GBAGBO.</div>
          </figcaption>
        </figure>
        <figure className='card__container__global__item'>
          <div className="card__container__global__item__image-wrapper">
            <img src={Image2} className="menu-image" alt="logo" />
          </div>
          <button className='button__item'>
            <img src={Icon1} alt="play" />
          </button>
          <figcaption className='overlay'>
            <div>Joyeux Noël 2025.</div>
            <div>Ghislain ABOBI.</div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

export default Card;