import React from 'react'
import { Box } from '@chakra-ui/react'
import Header from './components/Header'
import CardsPage from './CardsPage'

function App() {
  return (
    <Box>
      <Header />
      <CardsPage /* onBack ya no se usa; quítalo del componente si mostraba botón volver */ />
    </Box>
  )
}

export default App
