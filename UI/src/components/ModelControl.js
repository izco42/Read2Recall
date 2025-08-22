import React, { useEffect, useRef, useState } from 'react'
import {
  Box, VStack, Text, Select, Button, FormControl, FormLabel,
  FormHelperText, useToast, Spinner, Badge
} from '@chakra-ui/react';
import { useModel } from '../context/ModelContext';
import { lms } from '../../api';

export default function ModelControl() {
  const [modelos, setModelos] = useState([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { modeloCargado, setModeloCargado, serverEncendido, setServerEncendido } = useModel();

  //evita llamadas duplicadas a stop
  const isStoppingRef = useRef(false);

  const BACKEND_URL =
    (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL)
      ? process.env.REACT_APP_BACKEND_URL
      : 'http://localhost:5678';

  useEffect(() => {
    console.log('Backend URL:', BACKEND_URL);
    obtenerModelos();
    obtenerModeloCargado();
    startServer();

    //detiene servidor al refrescar o cerrar la pestaña
    const handleBeforeUnload = () => stopServer('beforeunload');
    window.addEventListener('beforeunload', handleBeforeUnload);

    // detiene el servidor cuando vuelve a otra ventana
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopServer('unmount');
    };
  }, []);

  // enciende el servidor
  const startServer = async () => {
    try {
      console.log('Encendiendo servidor...');
      await lms.post('/lms/start');
      setServerEncendido(true);
      toast({ title: 'Servidor encendido', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Error al encender servidor:', error);
      toast({ title: 'Error al encender servidor', status: 'error', duration: 3000, isClosable: true });
    }
  };

  //apaga el servidor
  const stopServer = async (reason = 'auto') => {
    if (isStoppingRef.current || !serverEncendido) return;
    isStoppingRef.current = true;

    try {
      const url = '/lms/stop';
      const body = JSON.stringify({ reason });

      if (navigator.sendBeacon && (reason === 'beforeunload')) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(lms.defaults.baseURL + url, blob);
      } else {
        await fetch(lms.defaults.baseURL + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      }
    } catch (e) {
      
    } finally {
      setServerEncendido(false);
      setModeloCargado(null);
      isStoppingRef.current = false;
    }
  };

  // carga los modelos
  const obtenerModelos = async () => {
    try {
      const res = await lms.get('/lms/list');
      const modelosLLM = res.data.filter((modelo) => modelo.type === 'llm');
      setModelos(modelosLLM);
    } catch (error) {
      console.error('Error al obtener modelos:', error);
    }
  };

  const obtenerModeloCargado = async () => {
    try {
      const res = await lms.get('/lms/loaded');
      const modelo = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
      setModeloCargado(modelo);
    } catch (error) {
      console.error('Error al obtener el modelo cargado:', error);
      setModeloCargado(null);
    }
  };

 
  const handleChange = async (event) => {
    const nuevoModeloKey = event.target.value;
    setModeloSeleccionado(nuevoModeloKey);

    if (!nuevoModeloKey || !serverEncendido) {
      toast({ title: 'Encienda el servidor', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    const modeloNuevo = modelos.find((m) => m.modelKey === nuevoModeloKey);
    if (!modeloNuevo) {
      toast({ title: 'Modelo no encontrado', status: 'error', duration: 3000, isClosable: true });
      return;
    }

    setLoading(true);
    try {
      const { data: modelosCargados } = await lms.get('/lms/loaded');
      const modeloAnterior =
        Array.isArray(modelosCargados) && modelosCargados.length > 0 ? modelosCargados[0] : null;

      await lms.post('/lms/unload');
      if (modeloAnterior) {
        toast({
          title: `Modelo descargado: ${modeloAnterior.displayName || modeloAnterior.modelKey}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      await lms.post('/lms/load', { modelkey: modeloNuevo.modelKey });
      toast({
        title: `Modelo "${modeloNuevo.displayName}" cargado correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setModeloCargado({ modelKey: modeloNuevo.modelKey, displayName: modeloNuevo.displayName });
    } catch (error) {
      console.error('Error al cargar modelo:', error);
      toast({ title: 'Error al cargar modelo', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="blue.50" p={6} borderRadius="lg" border="1px solid" borderColor="blue.200" maxH="500px">
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold" textAlign="center" color="blue.800">
          Control de Modelos
        </Text>

        <FormControl>
          <FormLabel fontSize="md" fontWeight="semibold">
            Modelo:
          </FormLabel>
          <Select
            value={modeloSeleccionado}
            onChange={handleChange}
            placeholder="Selecciona un modelo"
            isDisabled={!serverEncendido || loading}
            bg="white"
          >
            {modelos.map((modelo) => (
              <option key={modelo.modelKey} value={modelo.modelKey}>
                {modelo.displayName}
              </option>
            ))}
          </Select>
          <FormHelperText>Selecciona un modelo para cargar</FormHelperText>
        </FormControl>

        <VStack spacing={3}>
          

          <Box textAlign="center">
            <Badge
              colorScheme={serverEncendido ? 'green' : 'red'}
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="md"
            >
              Servidor: {serverEncendido ? 'Encendido' : 'Apagado'}
            </Badge>
          </Box>

          {modeloCargado && (
            <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200" width="full">
              <Text fontSize="sm" color="green.700" textAlign="center" fontWeight="medium">
                Modelo cargado:{' '}
                {Array.isArray(modeloCargado)
                  ? modeloCargado[0]?.displayName || 'N/A'
                  : modeloCargado.displayName || 'N/A'}
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
