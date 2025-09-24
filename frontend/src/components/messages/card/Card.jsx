import React, { useEffect } from 'react';
import Image1 from '../../assets/gbagbonoel.jpeg'
import Image2 from '../../assets/Abobi.jpeg'
import Icon1 from '../../assets/play.png' 
import './Card.css';


const Card = () => {
   useEffect(() => { 
    const cards = document.querySelectorAll('.card-item'); 
    // const btns = document.querySelectorAll('.button-item');
    // console.log(btns);
    
    cards.forEach(card => { card.addEventListener('click', function() { 
      // Supprimer la classe active de toutes les cartes cards.
      cards.forEach(c => c.classList.remove('active')); 
      // Ajouter la classe active à la carte cliquée 
      this.classList.add('active'); 
        }); 
      }
    ); 

  //  btns.forEach(btn => { btn.addEventListener('click', function() { 
  //     // Supprimer la classe active de toutes les cartes cards.
  //     btns.forEach(c => c.classList.remove('active')); 
  //     // Ajouter la classe active à la carte cliquée 
  //     this.classList.add('active'); 
  //       }); 
  //     }
  //   );

    // Cleanup function to remove event listeners when component unmounts 
    return () => { 
      cards.forEach(card => { 
        card.removeEventListener('click', function() { 
          this.classList.remove('active'); 
          }); 
        }); 
        // btns.forEach(btn => { 
        //   btn.removeEventListener('click', function() { 
        //     this.classList.remove('active'); 
        //     }); 
        //   }); 
      }; 
  }, []);
  
  return (
      <div className='card-container'>
        <div className='card-global'>
          <figure className='card-item'>
            
            <img src={ Image1 } className="menu-image" alt="logo" />
            <button className='button-item'>
              <img src={ Icon1 } />
            </button>
            <figcaption className='overlay'>
            <div>Joyeux Noêl 2025.</div>
            <div>Laurent GBAGBO.</div>
            </figcaption>
          </figure>
          <figure className='card-item'>
            
            <img src={ Image2 } className="menu-image" alt="logo" />
            <button className='button-item'>
              <img src={ Icon1 } />
            </button>
            <figcaption className='overlay'>
            <div>Joyeux Noêl 2025.</div>
            <div>Ghislain ABOBI.</div>
            </figcaption>
          </figure>
     
        </div>
      </div>
  );
};

export default Card;