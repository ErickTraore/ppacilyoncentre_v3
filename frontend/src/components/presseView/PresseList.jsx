import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../actions/messageActions';
import PresseTextOnly from './types/PresseTextOnly';
import '../../styles/pages/MessagesList.scss';

export default function PresseList() {
  const dispatch = useDispatch();
  const presses = useSelector((s) => s.messages.messagesByCateg?.presse ?? []);

  const [activeId, setActiveId] = useState(null);
  const toggle = (id) => setActiveId((prev) => (prev === id ? null : id));
  const isActive = (id) => activeId === id;

  useEffect(() => {
    dispatch(fetchMessages('presse'));
  }, [dispatch]);

  return (
    <div className="presse">
      <div className="presse__container">
        <div className="presse__container__title">Presse PPA-CI</div>

        <div className="presse__container__messagelist">
          {!Array.isArray(presses) ? (
            <p className="presse__container__messagelist__error">
              Erreur : données non disponibles.
            </p>
          ) : presses.length === 0 ? (
            <div className="presse__container__messagelist__empty">
              <h3 className="presse__container__messagelist__empty__nothing">
                Aucun message
              </h3>
              <p className="presse__container__messagelist__empty__add">
                Connectez-vous pour publier le premier message.
              </p>
            </div>
          ) : (
            presses.map((p) => (
              <PresseTextOnly
                key={p.id}
                presse={p}
                isActive={isActive}
                toggle={toggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
