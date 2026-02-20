import React from 'react';
import './Spinner.scss';

const Spinner = ({ size = 'medium', text = '', inline = false }) => (
  <div className={`spinner-container ${inline ? 'spinner-inline' : 'spinner-block'}`}>
    <i className={`fas fa-spinner fa-spin spinner-${size}`}></i>
    {text && <span className="spinner-text">{text}</span>}
  </div>
);

export default Spinner;
