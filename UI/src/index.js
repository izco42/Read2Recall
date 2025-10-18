import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { ModelProvider } from './context/ModelContext';
import { AuthProvider } from './context/AuthContext';



const theme = extendTheme({
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