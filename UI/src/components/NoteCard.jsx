import React, { useState } from 'react'
import {Card,CardBody,CardHeader,CardFooter,Text,Badge,Heading,Flex,VStack,HStack,
  Box,IconButton, Menu,MenuButton,MenuList,MenuItem,Divider,Modal,ModalOverlay,ModalContent,ModalHeader,
  ModalFooter,ModalBody,ModalCloseButton,Button, useDisclosure,Collapse,} from '@chakra-ui/react'
import {  EditIcon, DeleteIcon, SettingsIcon, ViewIcon,  ChevronDownIcon,ChevronUpIcon,RepeatIcon } from '@chakra-ui/icons'

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

function NoteCard({ note, onEdit, onDelete }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Usar directamente los campos question y answer de la nota
  const question = note.question || note.content || "Sin pregunta"
  const answer = note.answer || ""

  const handleCardClick = (e) => {
    if (e.target.closest('[data-menu-trigger]') || e.target.closest('[role="menuitem"]')) return
    
    if (!showAnswer && answer) {
      setShowAnswer(true)
    } else {
      onOpen()
    }
  }

  const handleFlip = (e) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const resetCard = (e) => {
    e.stopPropagation()
    setShowAnswer(false)
    setIsFlipped(false)
  }

  return (
    <>
      <Card 
        variant="outline"
        size="md"
        _hover={{ 
          borderColor: showAnswer ? "green.300" : "blue.300",
          boxShadow: "lg",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s ease"
        position="relative"
        cursor="pointer"
        onClick={handleCardClick}
        bg={showAnswer ? "green.50" : "white"}
        borderColor={showAnswer ? "green.200" : "gray.200"}
        borderWidth="2px"
      >
        <CardHeader pb={2}>
          <Flex justify="space-between" align="flex-start">
            <VStack align="start" spacing={2} flex="1">
              <Flex align="center" w="100%" justify="space-between">
                <Heading size="sm" color="gray.800" flex="1" mr={2}>
                  {note.title}
                </Heading>
                <HStack spacing={2}>
                  <Badge 
                    colorScheme={difficultyColors[note.difficulty] || "gray"}
                    variant="subtle"
                    size="sm">
                    {note.difficulty}
                  </Badge>
                  {showAnswer && (
                    <Badge colorScheme="green" variant="solid" size="sm">
                      Revelado
                    </Badge>
                  )}
                </HStack>
              </Flex>
              
              <HStack spacing={2} w="100%">
                <Badge 
                  colorScheme={subjectColors[note.subject] || "gray"}
                  variant="outline"
                  size="sm"
                >
                  {note.subject}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(note.date)}
                </Text>
              </HStack>

              {note.tags && (
                <HStack spacing={1} flexWrap="wrap" w="100%">
                  {note.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      size="sm" 
                      colorScheme="gray" 
                      variant="solid"
                      fontSize="xs">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>

            <Menu 
              placement="left" 
              onOpen={() => setIsMenuOpen(true)} 
              onClose={() => setIsMenuOpen(false)}>
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                aria-label="Opciones"
                ml={2}
                data-menu-trigger="true"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList 
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="xl"
                minW="150px"
                zIndex={1000}
              >
                <MenuItem 
                  icon={<ViewIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen()
                  }}
                  _hover={{ bg: "blue.50" }}
                >
                  Ver completa
                </MenuItem>
                <MenuItem 
                  icon={<RepeatIcon />}
                  onClick={resetCard}
                  _hover={{ bg: "gray.50" }}
                >
                  Reiniciar
                </MenuItem>
                <MenuItem 
                  icon={<EditIcon />} 
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(note.id)
                  }}
                  _hover={{ bg: "blue.50" }}
                >
                  Editar
                </MenuItem>
                <Divider />
                <MenuItem 
                  icon={<DeleteIcon />} 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(note.id)
                  }}
                  color="red.500"
                  _hover={{ bg: "red.50" }}
                >
                  Eliminar
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </CardHeader>
        
        <CardBody pt={0} pb={2}>
          {/* Lado frontal - Pregunta */}
          <Box
            bg={showAnswer ? "blue.50" : "gray.50"}
            p={4}
            borderRadius="md"
            mb={3}
            border="1px solid"
            borderColor={showAnswer ? "blue.200" : "gray.200"}
            minH="80px"
            display="flex"
            alignItems="center"
          >
            <VStack spacing={2} w="100%">
              <Text fontSize="xs" color="gray.500" fontWeight="bold" alignSelf="start">
                PREGUNTA
              </Text>
              <Text 
                fontSize="sm" 
                color="gray.700"
                lineHeight="1.5"
                textAlign="center"
                fontWeight="medium"
              >
                {question}
              </Text>
            </VStack>
          </Box>

          {/* Lado posterior - Respuesta */}
          <Collapse in={showAnswer} animateOpacity>
            <Box
              bg="green.50"
              p={4}
              borderRadius="md"
              border="1px solid"
              borderColor="green.200"
              minH="80px"
            >
              <VStack spacing={2} w="100%">
                <Text fontSize="xs" color="green.600" fontWeight="bold" alignSelf="start">
                  RESPUESTA
                </Text>
                <Text 
                  fontSize="sm" 
                  color="gray.700"
                  lineHeight="1.5"
                  whiteSpace="pre-wrap"
                >
                  {answer || "No hay respuesta disponible"}
                </Text>
              </VStack>
            </Box>
          </Collapse>
        </CardBody>

        <CardFooter pt={0}>
          <Flex justify="space-between" align="center" w="100%">
            <Text 
              fontSize="xs" 
              color={showAnswer ? "green.500" : "blue.500"}
              fontWeight="medium"
            >
              {showAnswer 
                ? "Click para ver completa →" 
                : answer 
                  ? "Click para ver respuesta →" 
                  : "Click para expandir →"
              }
            </Text>
            
            {answer && (
              <HStack spacing={2}>
                <IconButton
                  icon={showAnswer ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme={showAnswer ? "green" : "blue"}
                  onClick={handleFlip}
                  aria-label={showAnswer ? "Ocultar respuesta" : "Mostrar respuesta"}
                />
                {showAnswer}
              </HStack>
            )}
          </Flex>
        </CardFooter>
      </Card>

      {/* Modal de pantalla completa */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          onClose()
          setShowAnswer(false)
          setIsFlipped(false)
        }} 
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent 
          bg="white" 
          m={0}
          borderRadius={0}
          maxH="100vh"
        >
          <ModalHeader 
            bg="gray.50" 
            borderBottom="1px solid" 
            borderColor="gray.200"
            py={6}
          >
            <VStack align="start" spacing={3}>
              <Flex align="center" w="100%" justify="space-between">
                <Heading size="lg" color="gray.800">
                  {note.title}
                </Heading>
                <HStack spacing={3}>
                  <Badge 
                    colorScheme={difficultyColors[note.difficulty] || "gray"}
                    variant="subtle"
                    size="lg"
                    px={3}
                    py={1}
                    fontSize="sm"
                  >
                    {note.difficulty}
                  </Badge>
                </HStack>
              </Flex>
              
              <HStack spacing={4} w="100%">
                <Badge 
                  colorScheme={subjectColors[note.subject] || "gray"}
                  variant="outline"
                  size="md"
                  px={3}
                  py={1}
                >
                  {note.subject}
                </Badge>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {formatDate(note.date)}
                </Text>
              </HStack>

              {note.tags && (
                <HStack spacing={2} flexWrap="wrap" w="100%">
                  {note.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      size="md" 
                      colorScheme="gray" 
                      variant="solid"
                      px={2}
                      py={1}
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>
          </ModalHeader>
          
          <ModalCloseButton size="lg" />
          
          <ModalBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Pregunta en modal */}
              <Box 
                bg="blue.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="blue.200"
                p={6}
              >
                <Text fontSize="sm" color="blue.600" fontWeight="bold" mb={3}>
                  PREGUNTA
                </Text>
                <Text 
                  fontSize="lg" 
                  color="gray.700"
                  lineHeight="1.8"
                  fontWeight="medium"
                >
                  {question}
                </Text>
              </Box>

              {/* Respuesta en modal */}
              {answer && (
                <Box 
                  bg="green.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="green.200"
                  p={6}
                >
                  <Text fontSize="sm" color="green.600" fontWeight="bold" mb={3}>
                    RESPUESTA
                  </Text>
                  <Text 
                    fontSize="md" 
                    color="gray.700"
                    lineHeight="1.8"
                    whiteSpace="pre-wrap"
                  >
                    {answer}
                  </Text>
                </Box>
              )}

              {/* Contenido completo si no hay pregunta y respuesta separadas */}
              {!note.question && !note.answer && note.content && (
                <Box 
                  bg="white"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                  p={6}
                >
                  <Text fontSize="sm" color="gray.600" fontWeight="bold" mb={3}>
                    CONTENIDO
                  </Text>
                  <Text 
                    fontSize="md" 
                    color="gray.700"
                    lineHeight="1.8"
                    whiteSpace="pre-wrap"
                  >
                    {note.content}
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={3}>
              <Button 
                leftIcon={<EditIcon />}
                colorScheme="blue" 
                variant="outline"
                onClick={() => {
                  onClose()
                  setShowAnswer(false)
                  setIsFlipped(false)
                  onEdit(note.id)
                }}
              >
                Editar
              </Button>
              <Button 
                colorScheme="gray" 
                onClick={() => {
                  onClose()
                  setShowAnswer(false)
                  setIsFlipped(false)
                }}
              >
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default NoteCard