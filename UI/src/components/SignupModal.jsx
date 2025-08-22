import React, { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, useToast
} from "@chakra-ui/react";
import { authSignup } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function SignupModal({ isOpen, onClose }) {
  const toast = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getApiError = (e) => {
    if (e?.userMessage) return e.userMessage;
    const d = e?.response?.data?.detail;
    if (Array.isArray(d) && d.length) return d.map((x) => x.msg || JSON.stringify(x)).join(" • ");
    if (typeof d === "string" && d.trim()) return d.trim();
    return e?.response?.data?.msg || e.message || "Error desconocido";
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await authSignup({ email, password, name });
      await login({ email, password });
      toast({ title: "Cuenta creada e iniciada", status: "success" });
      resetForm();
      onClose();
    } catch (e) {
      toast({ title: "No se pudo registrar", description: getApiError(e), status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crear cuenta</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Nombre</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleClose} variant="ghost">Cancelar</Button>
          <Button colorScheme="purple" onClick={handleSignup} isLoading={loading}>Crear</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
