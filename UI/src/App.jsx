import React from 'react'
import { Box } from '@chakra-ui/react'
import Header from './components/Header'
import CardsPage from './CardsPage'
import Footer from './components/Footer'

function App() {
  return (
    <Box>
      <Header />
      <CardsPage />
      <Footer />
    </Box>
  )
}

export default App
