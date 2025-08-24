import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  Heading,
  Flex,
  useToast,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  HStack
} from '@chakra-ui/react';
import {
  AddIcon,
  InfoIcon,
  WarningIcon
} from '@chakra-ui/icons';

import Deck from './components/Deck';
//import StudyMode from './components/StudyMode';
import NoteCard from './components/NoteCard';
import api from '../api';
import CreateDeckPage from './components/CreateDeckPage';
import TemplatesManager from './components/TemplatesManager';
import SyncBar from './components/SyncBar';

function CardsPage({ onBack }) {
  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState('decks'); // 'decks', 'study', 'cards'
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const toast = useToast();

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/decks/list/');

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      const fetchedDecks = response.data.map(deck => ({
        deck_id: deck.deck_id,
        deck_name: deck.deck_name,
        file_path: deck.file_path,
        template_name: deck.template_name,
        template_id: deck.template_id,

        id: deck.deck_id,
        name: deck.deck_name || deck.name || 'Mazo sin nombre',

        createdAt: deck.createdAt || new Date().toISOString(),
        lastStudied: deck.lastStudied || null,
        cardCount: deck.cardCount || 0
      }));

      setDecks(fetchedDecks);
      localStorage.setItem('study-decks', JSON.stringify(fetchedDecks));
    } catch (error) {
      console.error('Error al cargar mazos:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudieron cargar los mazos desde el servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });

      try {
        const saved = localStorage.getItem('study-decks');
        if (saved) {
          const parsedDecks = JSON.parse(saved);
          setDecks(Array.isArray(parsedDecks) ? parsedDecks : []);
        }
      } catch (storageError) {
        console.error('Error al cargar desde localStorage:', storageError);
        setDecks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchCardsForDeck = async (deckId) => {
    if (!deckId) return [];
    setCardsLoading(true);
    try {
      console.warn(`Función fetchCardsForDeck no implementada para deck: ${deckId}`);
      return [];
    } catch (error) {
      console.error('Error al cargar cartas:', error);
      toast({
        title: 'Error al cargar cartas',
        description: 'No se pudieron cargar las cartas del mazo.',
        status: 'error',
        duration: 3000
      });
      return [];
    } finally {
      setCardsLoading(false);
    }
  };

  const handlePlayDeck = async (deckId) => {
    if (!deckId) {
      toast({ title: 'ID de mazo inválido', status: 'error', duration: 3000 });
      return;
    }

    const deck = decks.find(d => d.id === deckId || d.deck_id === deckId);
    if (!deck) {
      toast({
        title: 'Mazo no encontrado',
        description: `No se encontró el mazo con ID: ${deckId}`,
        status: 'error',
        duration: 3000
      });
      return;
    }

    const cards = await fetchCardsForDeck(deckId);

    if (!cards || cards.length === 0) {
      toast({
        title: 'Mazo vacío',
        description: 'Este mazo no tiene cartas para estudiar',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    const enrichedDeck = { ...deck, cards };
    setSelectedDeck(enrichedDeck);
    setCurrentView('study');
  };

  const handleViewDeckCards = async (deckId) => {
    if (!deckId) {
      toast({ title: 'ID de mazo inválido', status: 'error', duration: 3000 });
      return;
    }

    const cards = await fetchCardsForDeck(deckId);
    setNotes(cards);
    setSelectedDeckId(deckId);
    setCurrentView('cards');
  };

  const handleUpdateProgress = (deckId, progressData) => {
    if (!deckId || !progressData) return;

    const updated = decks.map(d =>
      (d.id === deckId || d.deck_id === deckId) ? { ...d, ...progressData } : d
    );
    setDecks(updated);

    try {
      localStorage.setItem('study-decks', JSON.stringify(updated));
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };


  const handleDeleteNote = (noteId) => {
    if (!noteId) return;
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
    toast({
      title: 'Carta eliminada',
      description: 'La carta ha sido eliminada exitosamente',
      status: 'success',
      duration: 3000
    });
  };
  const handleDeleteDeck = async (deckId) => {
    if (!deckId) {
      toast({ title: 'ID de mazo inválido', status: 'error', duration: 3000 });
      return;
    }

    try {
      await api.delete('/decks/delete/', { data: { deck_id: deckId } }); //corregido

      const updatedDecks = decks.filter(d => d.id !== deckId && d.deck_id !== deckId);
      setDecks(updatedDecks);
      localStorage.setItem('study-decks', JSON.stringify(updatedDecks));

      toast({
        title: 'Mazo eliminado',
        description: 'El mazo ha sido eliminado exitosamente',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error al eliminar mazo:', error);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el mazo. Inténtalo de nuevo.',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDuplicateDeck = (deckId) => {
    const deckToDuplicate = decks.find(d => d.id === deckId || d.deck_id === deckId);
    if (!deckToDuplicate) {
      toast({ title: 'Mazo no encontrado', status: 'error', duration: 3000 });
      return;
    }

    const duplicatedDeck = {
      ...deckToDuplicate,
      id: `deck-${Date.now()}`,
      deck_id: `deck-${Date.now()}`,
      name: `${deckToDuplicate.name} (Copia)`,
      deck_name: `${deckToDuplicate.deck_name || deckToDuplicate.name} (Copia)`,
      createdAt: new Date().toISOString(),
      lastStudied: null
    };

    const updatedDecks = [...decks, duplicatedDeck];
    setDecks(updatedDecks);

    try {
      localStorage.setItem('study-decks', JSON.stringify(updatedDecks));
      toast({
        title: 'Mazo duplicado',
        description: 'Se ha creado una copia del mazo',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error al duplicar mazo:', error);
    }
  };

  const calculateGlobalStats = () => {
    const totalDecks = decks.length;
    const totalCards = notes.length;
    const studiedCards = notes.filter(n => n && n.studied).length;

    let totalAccuracy = 0;
    let cardsWithStats = 0;

    notes.forEach(note => {
      if (note && note.stats && note.stats.timesStudied > 0) {
        totalAccuracy += note.stats.correctAnswers / note.stats.timesStudied;
        cardsWithStats++;
      }
    });

    const accuracy = cardsWithStats > 0 ? Math.round((totalAccuracy / cardsWithStats) * 100) : 0;

    const cardsForToday = notes.filter(n =>
      n && n.stats && n.stats.nextReview && new Date(n.stats.nextReview) <= new Date()
    ).length;

    return { totalDecks, totalCards, studiedCards, accuracy, cardsForToday };
  };

  const stats = calculateGlobalStats();

  const renderCurrentView = () => {
    if (loading) {
      return (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">Cargando mazos...</Text>
          </VStack>
        </Center>
      );
    }

    switch (currentView) {
      case 'study':
        return (
          <StudyMode
            deck={selectedDeck}
            onExit={() => {
              setCurrentView('decks');
              setSelectedDeck(null);
            }}
            onUpdateProgress={handleUpdateProgress}
          />
        );

      case 'create':
        return (
          <CreateDeckPage
            onBack={() => setCurrentView('decks')}
            onCreated={async () => {
              await fetchDecks();       // refresca la lista
              setCurrentView('decks');  // vuelve a la vista de mazos
            }}
          />
        );

      case 'cards': {
        const deck = decks.find(d => d.id === selectedDeckId || d.deck_id === selectedDeckId);

        return (
          <Box>


            {cardsLoading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.600">Cargando cartas...</Text>
                </VStack>
              </Center>
            ) : notes.length > 0 ? (
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))"
                gap={6}
              >
                {notes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </Box>
            ) : (
              <Card variant="outline" textAlign="center" py={12}>
                <CardBody>
                  <VStack spacing={4}>
                    <WarningIcon boxSize={12} color="gray.400" />


                  </VStack>
                </CardBody>
              </Card>
            )}
          </Box>
        );
      }

      case 'decks':
      default:
        return (
          <Box>
            <Flex align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="purple.600">
                  Sistema de Estudio con Mazos
                </Heading>
                <HStack justify="space-between" mb={4}>
                  
                  <SyncBar />

                  <Button colorScheme="green" onClick={() => setCurrentView('create')}>
                Crear mazo
              </Button>
                </HStack>
                <Text color="gray.600">
                  Organiza tus flashcards en mazos temáticos
                </Text>
              </VStack>
              
            </Flex>

            <Tabs colorScheme="purple" variant="enclosed">
              <TabList>
                <Tab>
                  <InfoIcon mr={2} />
                  Mis Mazos ({decks.length})
                </Tab>
                <Tab>Plantillas</Tab> {/* ← añadido */}
              </TabList>

              <TabPanels>
                {/* Panel 1: Mazos */}
                <TabPanel px={0}>
                  {decks.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {decks.map(deck => (
                        <Deck
                          key={deck.id || deck.deck_id}
                          deck={deck}
                          onDelete={handleDeleteDeck}
                          onPlay={handlePlayDeck}
                          onDuplicate={handleDuplicateDeck}
                          onViewCards={handleViewDeckCards}
                        />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Card variant="outline" textAlign="center" py={12}>
                      <CardBody>
                        <VStack spacing={4}>
                          <InfoIcon boxSize={12} color="gray.400" />
                          <Text fontSize="lg" color="gray.600">
                            No hay mazos disponibles
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Los mazos se cargarán desde tu backend
                          </Text>
                          <Button colorScheme="purple" leftIcon={<AddIcon />} onClick={fetchDecks}>
                            Actualizar Lista
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>               

                {/* Panel 3: Plantillas */}
                <TabPanel px={0}>
                  <TemplatesManager />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        );
    }
  };

  return (
    <Box p={6} minH="100vh" bg="gray.50">
      {renderCurrentView()}
    </Box>
  );
}

export default CardsPage;
