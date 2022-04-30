import React, { createContext, useReducer } from "react";
import auth from "./reducers/auth";
import authInitialState from "./initialStates/auth";

export const GlobalContext = createContext({});

const GlobalProvider = ({ children }) => {
  const [authState, authDispath] = useReducer(auth, authInitialState);
  return (
    <GlobalContext.Provider value={{ authState, authDispath }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
