import React, { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, useToast
} from "@chakra-ui/react";
//funcion para autenticar desde authcontext
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //getApiError sirve para interpretar y formatear el mensaje de error que venga de la api
  const getApiError = (e) => {
    if (e?.userMessage) return e.userMessage;
    const d = e?.response?.data?.detail;
    if (Array.isArray(d) && d.length) return d.map((x) => x.msg || JSON.stringify(x)).join(" • ");
    if (typeof d === "string" && d.trim()) return d.trim();
    return e?.response?.data?.msg || e.message || "Error desconocido";
  };

  //limpia los campos del formulario
  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast({ title: "Sesión iniciada", status: "success" });
      resetForm();
      onClose();
    } catch (e) {
      toast({ title: "Error al iniciar sesión", description: getApiError(e), status: "error" });
    } finally {
      setLoading(false);
    }
  };

  //limia los campos del formulario cuando se cierra el modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />

      <form onSubmit={handleLogin}>
        <ModalContent>

          <ModalHeader>Iniciar sesión</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}

                autoComplete="email"
                autoFocus
                isDisabled={loading}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                isDisabled={loading} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={handleClose} variant="ghost">Cancelar</Button>
            <Button type="submit" colorScheme="purple" isLoading={loading}>
              Entrar
            </Button>
          </ModalFooter>
        </ModalContent>

      </form>

    </Modal>
  );
}
