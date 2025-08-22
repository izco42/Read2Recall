import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  Text,
  Badge,
  Heading,
  Flex,
  VStack,
  HStack,
  Button,
  Progress,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Collapse,
  Divider,
  CircularProgress,
  CircularProgressLabel,
  useToast
} from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewIcon,
  RepeatIcon,
  CheckIcon,
  CloseIcon,
  StarIcon,
  ArrowBackIcon,
  SettingsIcon
} from '@chakra-ui/icons'

const difficultyColors = {
  "Fácil": "green",
  "Medio": "yellow", 
  "Difícil": "red"
}

const subjectColors = {
  "Programación Web": "blue",
  "React Avanzado": "purple",
  "Arquitectura Frontend": "orange"
}

function StudyMode({ deck, onExit, onUpdateProgress }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studiedCards, setStudiedCards] = useState(new Set())
  const [correctCards, setCorrectCards] = useState(new Set())
  const [incorrectCards, setIncorrectCards] = useState(new Set())
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  })
  const [studyComplete, setStudyComplete] = useState(false)
  
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure()
  const { isOpen: isExitOpen, onOpen: onExitOpen, onClose: onExitClose } = useDisclosure()
  
  const toast = useToast()

  const cards = deck.cards || []
  const currentCard = cards[currentCardIndex]

  useEffect(() => {
    // Verificar si todas las cartas han sido estudiadas
    if (studiedCards.size === cards.length && cards.length > 0) {
      setStudyComplete(true)
      onStatsOpen()
    }
  }, [studiedCards, cards.length, onStatsOpen])

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  const handleMarkCorrect = () => {
    const cardId = currentCard.id
    setStudiedCards(prev => new Set(prev).add(cardId))
    setCorrectCards(prev => new Set(prev).add(cardId))
    setIncorrectCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(cardId)
      return newSet
    })
    
    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + (studiedCards.has(cardId) ? 0 : 1),
      correctAnswers: prev.correctAnswers + (correctCards.has(cardId) ? 0 : 1),
      incorrectAnswers: incorrectCards.has(cardId) ? prev.incorrectAnswers - 1 : prev.incorrectAnswers
    }))

    toast({
      title: "¡Correcto!",
      status: "success",
      duration: 1000,
      isClosable: true
    })

    // Avanzar automáticamente a la siguiente carta
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        handleNextCard()
      }
    }, 500)
  }

  const handleMarkIncorrect = () => {
    const cardId = currentCard.id
    setStudiedCards(prev => new Set(prev).add(cardId))
    setIncorrectCards(prev => new Set(prev).add(cardId))
    setCorrectCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(cardId)
      return newSet
    })
    
    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + (studiedCards.has(cardId) ? 0 : 1),
      incorrectAnswers: prev.incorrectAnswers + (incorrectCards.has(cardId) ? 0 : 1),
      correctAnswers: correctCards.has(cardId) ? prev.correctAnswers - 1 : prev.correctAnswers
    }))

    toast({
      title: "Marcada para repaso",
      status: "warning",
      duration: 1000,
      isClosable: true
    })

    // Avanzar automáticamente a la siguiente carta
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        handleNextCard()
      }
    }, 500)
  }

  const handleResetCard = () => {
    setShowAnswer(false)
  }

  const handleRestartStudy = () => {
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setStudiedCards(new Set())
    setCorrectCards(new Set())
    setIncorrectCards(new Set())
    setSessionStats({
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    })
    setStudyComplete(false)
    onStatsClose()
  }

  const handleFinishStudy = () => {
    // Actualizar progreso del mazo
    if (onUpdateProgress) {
      onUpdateProgress(deck.id, {
        lastStudied: new Date().toISOString(),
        sessionStats: {
          ...sessionStats,
          endTime: new Date(),
          totalCards: cards.length,
          studiedCards: studiedCards.size,
          correctCards: correctCards.size,
          incorrectCards: incorrectCards.size
        }
      })
    }
    onExit()
  }

  const calculateAccuracy = () => {
    if (sessionStats.cardsStudied === 0) return 0
    return Math.round((sessionStats.correctAnswers / sessionStats.cardsStudied) * 100)
  }

  const getStudyDuration = () => {
    const duration = new Date() - sessionStats.startTime
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return cards.length > 0 ? (studiedCards.size / cards.length) * 100 : 0
  }

  if (!currentCard) {
    return (
      <Box p={6} textAlign="center">
        <Heading size="lg" color="gray.600" mb={4}>
          No hay cartas en este mazo
        </Heading>
        <Button onClick={onExit} leftIcon={<ArrowBackIcon />}>
          Volver a mazos
        </Button>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" p={4}>
      {/* Header con progreso */}
      <Card mb={6} bg="white" shadow="md">
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="md" color="gray.800">
                {deck.name}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Carta {currentCardIndex + 1} de {cards.length}
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.500">Tiempo</Text>
                <Text fontSize="sm" fontWeight="bold">{getStudyDuration()}</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.500">Precisión</Text>
                <Text fontSize="sm" fontWeight="bold">{calculateAccuracy()}%</Text>
              </VStack>
              <IconButton
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                onClick={onStatsOpen}
                aria-label="Ver estadísticas"
              />
              <IconButton
                icon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
                onClick={onExitOpen}
                aria-label="Salir"
              />
            </HStack>
          </Flex>

          <Progress 
            value={getProgressPercentage()} 
            colorScheme="purple" 
            size="lg" 
            borderRadius="full"
            bg="gray.200"
          />
          <Flex justify="space-between" mt={2}>
            <Text fontSize="xs" color="gray.500">
              {studiedCards.size} estudiadas
            </Text>
            <Text fontSize="xs" color="gray.500">
              {Math.round(getProgressPercentage())}% completado
            </Text>
          </Flex>
        </CardBody>
      </Card>

      {/* Carta principal */}
      <Card size="lg" shadow="xl" bg="white" maxW="800px" mx="auto">
        <CardBody p={8}>
          {/* Información de la carta */}
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Badge 
                colorScheme={difficultyColors[currentCard.difficulty] || "gray"}
                variant="subtle"
                size="md"
                px={3}
                py={1}
              >
                {currentCard.difficulty}
              </Badge>
              <Badge 
                colorScheme={subjectColors[currentCard.subject] || "gray"}
                variant="outline"
                size="md"
                px={3}
                py={1}
              >
                {currentCard.subject}
              </Badge>
            </HStack>

            <HStack spacing={2}>
              {studiedCards.has(currentCard.id) && (
                <>
                  {correctCards.has(currentCard.id) && (
                    <Badge colorScheme="green" variant="solid">
                      <CheckIcon boxSize={3} mr={1} />
                      Correcto
                    </Badge>
                  )}
                  {incorrectCards.has(currentCard.id) && (
                    <Badge colorScheme="red" variant="solid">
                      <CloseIcon boxSize={3} mr={1} />
                      Repaso
                    </Badge>
                  )}
                </>
              )}
            </HStack>
          </Flex>

          {/* Título de la carta */}
          <Heading size="lg" color="gray.800" mb={6} textAlign="center">
            {currentCard.title}
          </Heading>

          {/* Pregunta */}
          <Box
            bg="blue.50"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="blue.200"
            mb={4}
            minH="120px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack spacing={3} w="100%">
              <Text fontSize="sm" color="blue.600" fontWeight="bold">
                PREGUNTA
              </Text>
              <Text 
                fontSize="lg" 
                color="gray.700"
                lineHeight="1.8"
                textAlign="center"
                fontWeight="medium"
              >
                {currentCard.question || currentCard.content || "Sin pregunta"}
              </Text>
            </VStack>
          </Box>

          {/* Respuesta */}
          <Collapse in={showAnswer} animateOpacity>
            <Box
              bg="green.50"
              p={6}
              borderRadius="lg"
              border="1px solid"
              borderColor="green.200"
              minH="120px"
              mb={4}
            >
              <VStack spacing={3} w="100%">
                <Text fontSize="sm" color="green.600" fontWeight="bold">
                  RESPUESTA
                </Text>
                <Text 
                  fontSize="md" 
                  color="gray.700"
                  lineHeight="1.8"
                  whiteSpace="pre-wrap"
                  textAlign="center"
                >
                  {currentCard.answer || "No hay respuesta disponible"}
                </Text>
              </VStack>
            </Box>
          </Collapse>

          {/* Botones de acción */}
          <VStack spacing={4}>
            {!showAnswer ? (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleShowAnswer}
                w="full"
                maxW="300px"
              >
                Mostrar Respuesta
              </Button>
            ) : (
              <HStack spacing={4} justify="center">
                <Button
                  leftIcon={<CloseIcon />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleMarkIncorrect}
                  size="lg"
                >
                  Incorrecta
                </Button>
                <Button
                  leftIcon={<CheckIcon />}
                  colorScheme="green"
                  onClick={handleMarkCorrect}
                  size="lg"
                >
                  Correcta
                </Button>
              </HStack>
            )}

            <HStack spacing={2}>
              <IconButton
                icon={<RepeatIcon />}
                variant="ghost"
                size="sm"
                onClick={handleResetCard}
                aria-label="Reiniciar carta"
              />
            </HStack>
          </VStack>

          {/* Navegación */}
          <Flex justify="space-between" align="center" mt={8}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="ghost"
              onClick={handlePrevCard}
              isDisabled={currentCardIndex === 0}
            >
              Anterior
            </Button>
            
            <Text fontSize="sm" color="gray.500">
              {currentCardIndex + 1} / {cards.length}
            </Text>
            
            <Button
              rightIcon={<ChevronRightIcon />}
              variant="ghost"
              onClick={handleNextCard}
              isDisabled={currentCardIndex === cards.length - 1}
            >
              Siguiente
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Modal de estadísticas */}
      <Modal isOpen={isStatsOpen} onClose={onStatsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {studyComplete ? "¡Sesión Completada!" : "Estadísticas de la Sesión"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Progreso circular */}
              <CircularProgress 
                value={getProgressPercentage()} 
                size="120px" 
                color="purple.400"
                thickness="8px"
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  {Math.round(getProgressPercentage())}%
                </CircularProgressLabel>
              </CircularProgress>

              {/* Estadísticas principales */}
              <HStack spacing={8} justify="center">
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {sessionStats.correctAnswers}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Correctas</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {sessionStats.incorrectAnswers}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Incorrectas</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {studiedCards.size}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Estudiadas</Text>
                </VStack>
              </HStack>

              {/* Información adicional */}
              <VStack spacing={2} w="100%">
                <Flex justify="space-between" w="100%">
                  <Text color="gray.600">Tiempo de estudio:</Text>
                  <Text fontWeight="bold">{getStudyDuration()}</Text>
                </Flex>
                <Flex justify="space-between" w="100%">
                  <Text color="gray.600">Precisión:</Text>
                  <Text fontWeight="bold">{calculateAccuracy()}%</Text>
                </Flex>
                <Flex justify="space-between" w="100%">
                  <Text color="gray.600">Cartas restantes:</Text>
                  <Text fontWeight="bold">{cards.length - studiedCards.size}</Text>
                </Flex>
              </VStack>

              {studyComplete && (
                <Box p={4} bg="green.50" borderRadius="md" w="100%" textAlign="center">
                  <Text color="green.700" fontWeight="medium">
                    ¡Felicitaciones! Has completado todas las cartas del mazo.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            {studyComplete ? (
              <HStack spacing={3}>
                <Button variant="outline" onClick={handleRestartStudy}>
                  Estudiar de Nuevo
                </Button>
                <Button colorScheme="purple" onClick={handleFinishStudy}>
                  Finalizar
                </Button>
              </HStack>
            ) : (
              <Button onClick={onStatsClose}>
                Continuar Estudiando
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para salir */}
      <Modal isOpen={isExitOpen} onClose={onExitClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>¿Salir del modo estudio?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Estás seguro de que quieres salir del modo estudio?
            </Text>
            <Text mt={2} color="gray.600" fontSize="sm">
              Tu progreso se guardará automáticamente.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExitClose}>
              Continuar Estudiando
            </Button>
            <Button colorScheme="red" onClick={handleFinishStudy}>
              Salir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default StudyMode