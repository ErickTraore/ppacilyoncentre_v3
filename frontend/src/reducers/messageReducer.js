import { FETCH_MESSAGES, ADD_MESSAGE } from '../actions/types';

const initialState = {
  messages: [],
  messagesByCateg: { presse: [], 'presse-locale': [] },
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MESSAGES:
      if (action.payload && typeof action.payload.categ !== 'undefined' && Array.isArray(action.payload.messages)) {
        return {
          ...state,
          messagesByCateg: {
            ...state.messagesByCateg,
            [action.payload.categ]: action.payload.messages,
          },
          messages: action.payload.messages,
        };
      }
      return { ...state, messages: action.payload || [] };
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
};

export default messageReducer;
