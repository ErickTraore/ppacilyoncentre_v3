import React from 'react';
import '../../styles/pages/MessagesList.scss';

export default function PresseHeader({ presse }) {
  const author = presse.User?.Profile
    ? `${presse.User.Profile.firstName || ''} ${presse.User.Profile.lastName || ''}`.trim()
    : presse.User?.email || '';
  return (
    <>
      <p className="presse__message__header__title">
        {presse.title || presse.tittle}
      </p>
      <p className="presse__message__header__author">
        {author}
        <span className="presse__message__header__author__date">
          ({new Date(presse.createdAt).toLocaleString()})
        </span>
      </p>
    </>
  );
}
