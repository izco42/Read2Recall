import React from 'react';
import {
  Box, Flex, Heading, Spacer, Avatar, Text, Button, HStack,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure, IconButton
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

function Header({ userName = "Invitado" }) {
  const loginDisc = useDisclosure();
  const signupDisc = useDisclosure();
  const { isLogged, displayName, logout } = useAuth();

  return (
    <Box height="90px" bg="blue.400" px={6} py={4} boxShadow="md">
      <Flex align="center">
        <Heading size="2xl" color="white" fontFamily="cursive">
          Anki Cards
        </Heading>
        <Spacer />
        <HStack spacing={4}>
          {!isLogged ? (
            <>
              <Text color="white" fontWeight="semibold">Invitado</Text>
              <Button size="sm" onClick={loginDisc.onOpen} colorScheme="purple">
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={signupDisc.onOpen} variant="outline" colorScheme="whiteAlpha">
                Crear cuenta
              </Button>
            </>
          ) : (
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <HStack>
                  <Avatar size="sm" name={displayName} />
                  <Text>{displayName}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={logout}>Cerrar sesión</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        {/* Modales */}
        <LoginModal isOpen={loginDisc.isOpen} onClose={loginDisc.onClose} />
        <SignupModal isOpen={signupDisc.isOpen} onClose={signupDisc.onClose} />
      </Flex>
    </Box>
  );
}

export default Header;
