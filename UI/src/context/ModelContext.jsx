import React, { createContext, useContext, useState } from 'react';

//aqui se define un contexto global en React para manejar el estado relacionado con el modelo cargado y el estado del servidor
const ModelContext = createContext();

export function ModelProvider({ children }) {
  const [modeloCargado, setModeloCargado] = useState(null);
  const [serverEncendido, setServerEncendido] = useState(false);

  return (
    <ModelContext.Provider
      value={{
        modeloCargado,
        setModeloCargado,
        serverEncendido,
        setServerEncendido
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
