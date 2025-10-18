// Deck.jsx - Versión sin process.env
import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Badge,
  Flex,
  Divider,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import {
  SettingsIcon,
  DeleteIcon,
  CopyIcon,
  ChevronRightIcon,
  StarIcon
} from '@chakra-ui/icons';

function Deck({ deck, onPlay, onEdit, onDelete, onViewCards, onDuplicate }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('purple.400', 'purple.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');

  // Flag para modo debug (cambia a false en producción)
  const isDevelopment = true; // Cambia esto manualmente

  // Validación de props
  if (!deck) {
    return (
      <Card variant="outline" borderColor="red.200" bg={cardBg}>
        <CardBody>
          <VStack spacing={2} align="center" py={4}>
            <Text color="red.500" fontWeight="medium">
              Error: Datos del mazo no disponibles
            </Text>
            <Text fontSize="sm" color="gray.500">
              Intenta recargar la página
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // Normalizar propiedades para consistencia
  const deckId = deck.id || deck.deck_id;
  const deckName = deck.name || deck.deck_name || 'Mazo sin nombre';
  const filePath = deck.file_path || 'No especificado';
  const templateName = deck.template_name || 'Template por defecto';
  const templateId = deck.template_id || 'N/A';
  const cardCount = deck.cards ? deck.cards.length : (deck.cardCount || 0);
  const lastStudied = deck.lastStudied;
  const createdAt = deck.createdAt;

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };


  const handleCardClick = (e) => {
    // Prevenir que el click se propague si viene de elementos del menú
    if (
      e.target.closest('[data-menu-trigger]') ||
      e.target.closest('[role="menuitem"]') ||
      e.target.closest('[data-menu]') ||
      e.target.closest('button')
    ) {
      return;
    }
    onOpen();
  };

  const handleMenuAction = (action, ...args) => {
    // Validar que la función existe antes de llamarla
    if (typeof action === 'function') {
      try {
        action(...args);
      } catch (error) {
        console.error('Error ejecutando acción:', error);
      }
    } else {
      console.warn('Acción no disponible:', action);
    }
  };

  return (
    <>
      <Card
        variant="outline"
        borderWidth="2px"
        borderColor={borderColor}
        bg={cardBg}
        _hover={{
          borderColor: hoverBorderColor,
          boxShadow: 'lg',
          transform: 'translateY(-4px)',
        }}
        transition="all 0.3s ease"
        cursor="pointer"
        onClick={handleCardClick}
        position="relative"
        overflow="hidden"
      >
      
        <CardHeader pb={2} position="relative">
          {/* Botón de menú en esquina superior derecha */}
          <Box position="absolute" top={2} right={2} zIndex={1}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                aria-label="Opciones del mazo"
                data-menu-trigger="true"
                data-menu="true"
                onClick={(e) => e.stopPropagation()}
                _hover={{ bg: 'gray.100' }}
                borderRadius="full"
              />
              <MenuList data-menu="true" boxShadow="xl">
                <MenuItem 
                  icon={<ChevronRightIcon color="purple.500" />} 
                  onClick={() => handleMenuAction(onPlay, deckId)}
                  _hover={{ bg: 'purple.50' }}
                  isDisabled={cardCount === 0}
                >
                  <VStack align="start" spacing={0}>
                    
                  </VStack>
                </MenuItem>
                
                <Divider />
                
                <MenuItem 
                  icon={<CopyIcon color="green.500" />} 
                  onClick={() => handleMenuAction(onDuplicate, deckId)}
                  _hover={{ bg: 'green.50' }}
                >
                  Duplicar mazo
                </MenuItem>
                
                <Divider />
                
                <MenuItem 
                  icon={<DeleteIcon color="red.500" />} 
                  onClick={() => handleMenuAction(onDelete, deckId)} 
                  color="red.500"
                  _hover={{ bg: 'red.50' }}
                >
                  Eliminar mazo
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>

          {/* Contenido del header */}
          <VStack align="start" spacing={2} pr={10}>
            <Heading size="md" color={textColor} noOfLines={2} lineHeight="1.3">
              {deckName}
            </Heading>
            
            <HStack spacing={2} wrap="wrap">
              {lastStudied && (
                <Badge colorScheme={studyStatus.color} variant="outline" fontSize="xs">
                  {studyStatus.text}
                </Badge>
              )}
              
              {templateName !== 'Template por defecto' && (
                <Badge colorScheme="cyan" variant="subtle" fontSize="xs">
                  {templateName}
                </Badge>
              )}
            </HStack>
          </VStack>
        </CardHeader>

        <CardBody pt={0}>
          <VStack align="start" spacing={3}>
            {/* Información del archivo */}
            <Box w="100%">
              <Text fontSize="xs" color={subtextColor} fontWeight="medium" mb={1}>
                ARCHIVO
              </Text>
              <Tooltip label={filePath} placement="top">
                <Text 
                  fontSize="sm" 
                  color={textColor} 
                  noOfLines={1}
                  bg="gray.50"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontFamily="mono"
                >
                  {filePath.split('/').pop() || filePath}
                </Text>
              </Tooltip>
            </Box>

            {/* Botones de acción rápida */}
            <HStack spacing={2} w="100%" pt={2}>
           
           
            </HStack>

            {/* ID solo visible en modo debug */}
            {isDevelopment && (
              <Text fontSize="xs" color="gray.400" fontFamily="mono">
                ID: {deckId}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Modal con detalles completos del mazo */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Flex align="center" gap={3}>
                <Heading size="lg" color={textColor}>
                  {deckName}
                </Heading>
                <StarIcon color="yellow.400" />
              </Flex>
              
              <HStack spacing={2} wrap="wrap">
                {lastStudied && (
                  <Badge colorScheme={studyStatus.color} variant="outline">
                    {studyStatus.text}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack align="start" spacing={4}>
              {/* Información del archivo */}
              <Box w="100%">
                <Text fontSize="sm" color={subtextColor} mb={2} fontWeight="medium">
                  📁 Información del archivo
                </Text>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium" fontFamily="mono" fontSize="sm">
                      {filePath}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                      <Text as="span" fontWeight="medium">Template:</Text> {templateName}
                    </Text>
                  </VStack>
                </Box>
              </Box>
              
             
              
              {/* Fechas y metadatos */}
              {(lastStudied || createdAt) && (
                <Box w="100%">
                  <Text fontSize="sm" color={subtextColor} mb={2} fontWeight="medium">
                    📅 Fechas importantes
                  </Text>
                  <VStack align="start" spacing={2}>
                    {createdAt && (
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="sm" color={subtextColor}>Fecha de creación:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatDateTime(createdAt)}
                        </Text>
                      </HStack>
                    )}
                    
                    {lastStudied && (
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="sm" color={subtextColor}>Último estudio:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatDateTime(lastStudied)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}
              
              
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3} w="100%">
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Deck;