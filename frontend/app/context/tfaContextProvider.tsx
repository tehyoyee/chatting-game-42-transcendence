"use client";

import { createContext, useContext, useState } from "react";

const TfaContext = createContext({});

export const TfaContextProvider = ({ children }: { children: any}) => {
  const [tfaOk, setTfa] = useState(false);

  return (
    <>
      <TfaContext.Provider value={{ tfaOk, setTfa }}>
        {children}
      </TfaContext.Provider>
    </>
  );
};

export const useTfaContext = () => useContext(TfaContext);
