import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { ModelProvider } from './context/ModelContext';
import { AuthProvider } from './context/AuthContext';



// Tema base de Chakra UI (opcional pero recomendado)
const theme = extendTheme({
  // Puedes personalizar tu tema aquí
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(

  <ChakraProvider theme={theme}>
    <ModelProvider>
      <AuthProvider>
        <App />
      </AuthProvider>


    </ModelProvider>

  </ChakraProvider>


);