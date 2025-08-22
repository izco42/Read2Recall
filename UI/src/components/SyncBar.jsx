import React, { useState } from 'react';
import { HStack, Button, useToast, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { syncUpload, syncDownload } from '../api/auth';
import LoginModal from './LoginModal';

//barra de acciones para subir y descargar mazos, aqui se verifica si el usuario esta logueado para permitirle realizar esas acciones 

export default function SyncBar() {
  const toast = useToast();
  const { isLogged, secret } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loadingU, setLoadingU] = useState(false);
  const [loadingD, setLoadingD] = useState(false);

  const ensureLogin = () => {
    if (!isLogged) { onOpen(); return false; }
    return true;
  };

  const doUpload = async () => {
    if (!ensureLogin()) return;
    setLoadingU(true);
    try {
      const res = await syncUpload(secret);
      toast({ title: 'Sync subida completada', description: JSON.stringify(res), status: 'success' });
    } catch (e) {
      toast({ title: 'Error al subir', description: e?.response?.data?.msg || e.message, status: 'error' });
    } finally { setLoadingU(false); }
  };

  const doDownload = async () => {
    if (!ensureLogin()) return;
    setLoadingD(true);
    try {
      const res = await syncDownload(secret);
      toast({ title: 'Sync descarga completada', description: JSON.stringify(res), status: 'success' });
     
    } catch (e) {
      toast({ title: 'Error al descargar', description: e?.response?.data?.msg || e.message, status: 'error' });
    } finally { setLoadingD(false); }
  };

  return (
    <>
      <HStack>
        <Button onClick={doUpload} isLoading={loadingU} colorScheme="purple" variant="solid">Subir</Button>
        <Button onClick={doDownload} isLoading={loadingD} variant="outline">Descargar</Button>
      </HStack>
      <LoginModal isOpen={isOpen} onClose={onClose}/>
    </>
  );
}
