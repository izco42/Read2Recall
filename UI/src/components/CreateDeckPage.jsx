import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, VStack, HStack, Text, Select, Button, Input, Textarea,
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    FormHelperText, useToast, Card, CardBody, Divider, Alert, AlertIcon, Flex
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { keyframes } from '@emotion/react';
import { useModel } from '../context/ModelContext';
import api from '../../api';
import ModelControl from './ModelControl';

// Animación de pulsaciones del centro hacia afuera
const lightAnimation = keyframes`
  0% {
    box-shadow: 
      0 0 2px #ffffff,
      0 0 4px #0080ff,
      0 0 6px #0066cc,
      0 0 8px #004499,
      inset 0 0 5px #0080ff44;
  }
  25% {
    box-shadow: 
      0 0 6px #ffffff,
      0 0 12px #0080ff,
      0 0 18px #0066cc,
      0 0 24px #004499,
      inset 0 0 8px #0080ff66;
  }
  50% {
    box-shadow: 
      0 0 10px #ffffff,
      0 0 20px #0080ff,
      0 0 30px #0066cc,
      0 0 40px #004499,
      inset 0 0 12px #0080ff88;
  }
  75% {
    box-shadow: 
      0 0 6px #ffffff,
      0 0 12px #0080ff,
      0 0 18px #0066cc,
      0 0 24px #004499,
      inset 0 0 8px #0080ff66;
  }
  100% {
    box-shadow: 
      0 0 2px #ffffff,
      0 0 4px #0080ff,
      0 0 6px #0066cc,
      0 0 8px #004499,
      inset 0 0 5px #0080ff44;
  }
`;

const PdfIcon = ({ size = 24, color = "#070707ff" }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" 
                fill="#fff"
                stroke={color}
                strokeWidth="1"
            />
            <path 
                d="M14 2v6h6" 
                stroke={color}
                strokeWidth="1"
                fill="none"
            />
            <line x1="7" y1="11" x2="17" y2="11" stroke={color} strokeWidth="1" opacity="0.3"/>
            <line x1="7" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1" opacity="0.3"/>
            <line x1="7" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1" opacity="0.3"/>
            <rect x="5" y="16.5" width="14" height="4" rx="1" fill="red"/>
            <text 
                x="12" 
                y="20" 
                textAnchor="middle" 
                fontSize="3" 
                fontWeight="bold" 
                fill="white"
            >
                PDF
            </text>
        </svg>
    )
}

// Componente PdfUpload integrado
function PdfUpload({ templateId, onFileSelected, currentFile = null }) {
    const toast = useToast()

    const onDrop = useCallback((acceptedFiles) => {
        // Verificar si hay una plantilla seleccionada
        if (!templateId) {
            toast({
                title: 'Selecciona una plantilla',
                description: 'Debes elegir una plantilla antes de subir un PDF.',
                status: 'warning',
            });
            return;
        }

        const pdfFile = acceptedFiles[0]
        if (pdfFile && pdfFile.type === 'application/pdf') {
            // Llamar a la función callback para actualizar el estado padre
            if (onFileSelected) {
                onFileSelected(pdfFile)
            }
        } else {
            toast({
                title: 'Archivo no válido',
                description: 'Solo se permiten archivos PDF.',
                status: 'error',
            });
        }
    }, [templateId, onFileSelected, toast])

    const onDropRejected = useCallback((rejectedFiles) => {
        toast({
            title: 'Archivo rechazado',
            description: 'Solo se permiten archivos PDF.',
            status: 'error',
        });
    }, [toast])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: false,
        disabled: !templateId,
    })

    return (
        <Box>
            <Box 
                h="150px"
                {...getRootProps()}
                border="2px dashed"
                borderColor={
                    !templateId ? 'gray.300' : 
                    isDragActive ? 'teal.500' : 'blue.300'
                }
                p={4}
                rounded="md"
                textAlign="center"
                bg={
                    !templateId ? 'gray.100' :
                    isDragActive ? 'teal.50' : 'gray.50'
                }
                cursor={!templateId ? 'not-allowed' : 'pointer'}
                opacity={!templateId ? 0.6 : 1}
                _hover={templateId ? {
                    animation: `${lightAnimation} 2s ease-in-out infinite`,
                    borderColor: "blue.500"
                } : {}}
                transition="all 0.3s"
            >
                <input {...getInputProps()} />
                
                <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    h="full" 
                    gap={3}
                >
                    {!templateId ? (
                        <>
                            <PdfIcon size={40} color="#a0a0a0" />
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                Primero selecciona una plantilla
                            </Text>
                        </>
                    ) : isDragActive ? (
                        <Text fontSize="lg" color="teal.600" fontWeight="bold">
                            ¡Suelta el archivo aquí!
                        </Text>
                    ) : (
                        <>
                            <PdfIcon size={40} />
                            <VStack spacing={1}>
                                <Text fontSize="md" fontWeight="bold" color="gray.700">
                                    Arrastra tu PDF aquí
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    o haz clic para seleccionar
                                </Text>
                            </VStack>
                        </>
                    )}
                </Flex>
            </Box>

            {currentFile && (
                <Box 
                    mt={3}
                    p={3} 
                    bg="green.50" 
                    rounded="md" 
                    border="1px solid" 
                    borderColor="green.200"
                >
                    <Flex align="center" gap={2}>
                        <PdfIcon size={16} color="#2e7d32" />
                        <Text color="green.700" fontWeight="medium" fontSize="sm">
                            {currentFile.name}
                        </Text>
                    </Flex>
                </Box>
            )}
        </Box>
    )
}

export default function CreateDeckPage({ onBack, onCreated }) {
    const toast = useToast();
    //extrae del ModelContext si hay algun modelo cargado
    const { modeloCargado } = useModel();

    const [templates, setTemplates] = useState([]);
    const [templateId, setTemplateId] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [deckName, setDeckName] = useState('Mi nuevo mazo');

    // modo pdf
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPrompt, setPdfPrompt] = useState('');

    // modo prompt topic
    const [topic, setTopic] = useState('');

    // Draft editor
    const [draft, setDraft] = useState(null);     // { deckId?: string }
    const [editedCards, setEditedCards] = useState([]); // [{id, question, answer}]
    const [loading, setLoading] = useState(false);

    //carga las plantillas, aqui se llaman al backend para obtener las plantillas existentes
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/templates/list/', { timeout: 60000 });
                setTemplates(Array.isArray(data) ? data : []);
            } catch (err) {
                const reason = err.code === 'ECONNABORTED'
                    ? 'Tiempo de espera agotado'
                    : (err.response?.status ? `HTTP ${err.response.status}` : err.message);
                toast({ title: 'No se pudieron cargar las plantillas', description: reason, status: 'error' });
            }
        })();
    }, [toast]);

    //validaciones, verifica que haya un modelo cargado 
    const ensureModel = () => {
        if (!modeloCargado) {
            toast({ title: 'Carga un modelo en la sección Modelos', status: 'warning' });
            return false;
        }
        return true;
    };

    const pickTemplate = () => {
        const t = templates.find(x => String(x.template_id ?? x.id) === String(templateId));
        if (!t) {
            toast({ title: 'Plantilla no encontrada', status: 'error' });
            return null;
        }
        return {
            template_id: t.template_id ?? t.id,
            template_name: t.name ?? t.template_name,
            front: t.front ?? [],
            back: t.back ?? [],
        };
    };

    const toEditorCards = (data) => {
        const arr =
            Array.isArray(data) ? data :
                Array.isArray(data?.draftCards) ? data.draftCards :
                    Array.isArray(data?.cards) ? data.cards :
                        Array.isArray(data?.items) ? data.items :
                            [];

        return arr.map((c, i) => ({
            id: c.id ?? c.uuid ?? `${Date.now()}-${i}`, // id estable
            question:
                Array.isArray(c.campos_anverso) ? c.campos_anverso.join('\n') :
                    Array.isArray(c.front) ? c.front.join('\n') :
                        (c.question ?? ''),
            answer:
                Array.isArray(c.campo_reverso) ? c.campo_reverso.join('\n') :
                    Array.isArray(c.campos_reverso) ? c.campos_reverso.join('\n') :
                        Array.isArray(c.back) ? c.back.join('\n') :
                            (c.answer ?? ''),
        }));
    };

    //aqui se crea el borrador a partir de un archivo creado
    const handleCreateFromPdf = async () => {
        if (!ensureModel()) return;
        if (!templateId || !pdfFile) {
            toast({ title: 'Selecciona plantilla y PDF', status: 'warning' });
            return;
        }
        const template = pickTemplate();
        if (!template) return;

        //esto evitara plantillas sin campos
        if (!Array.isArray(template.front) || template.front.length === 0 ||
            !Array.isArray(template.back) || template.back.length === 0) {
            toast({
                title: 'Plantilla inválida',
                description: 'La plantilla seleccionada no tiene campos "front" y "back".',
                status: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            //arma el JSON de instrucciones
            const reqJson = {
                prompt: { system_prompt: pdfPrompt || '', temperature, max_tokens: maxTokens },
                template,
            };

            //arma el FormData con AMBAS partes
            const form = new FormData();
            form.append('pdf_file', pdfFile, pdfFile.name);
            form.append('Create_Deck_Request', JSON.stringify(reqJson));

            const { data } = await api.post('/decks/create/', form, { timeout: 0 });

            setEditedCards(toEditorCards(data));

            setDraft({ deckId: data?.deckId ?? data?.id ?? 'tmp' });
            toast({ title: 'Borrador creado desde PDF', status: 'success' });
        } catch (err) {
            const reason = err.code === 'ECONNABORTED'
                ? 'Tiempo de espera agotado'
                : (err.response?.status ? `HTTP ${err.response.status}` : err.message);
            console.error('Create-from-PDF error:', err);
            toast({ title: 'Error creando mazo desde PDF', description: reason, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // crea el borrador a partir del tema, prompt
    const handleCreateFromPrompt = async () => {
        if (!ensureModel()) return;
        if (!templateId || !topic) {
            toast({ title: 'Selecciona plantilla y escribe un tema', status: 'warning' });
            return;
        }
        const template = pickTemplate();
        if (!template) return;
        if (!Array.isArray(template.front) || template.front.length === 0 ||
            !Array.isArray(template.back) || template.back.length === 0) {
            toast({
                title: 'Plantilla inválida',
                description: 'La plantilla seleccionada no tiene campos "front" y "back".',
                status: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                topic,
                prompt: { system_prompt: pdfPrompt || '', temperature, max_tokens: maxTokens },
                template
            };
            const { data } = await api.post('/decks/create-from-topic/', payload, { timeout: 0 });

            setEditedCards(toEditorCards(data));

            setDraft({ deckId: data?.deckId ?? data?.id ?? 'tmp' });
            toast({ title: 'Borrador creado desde Prompt', status: 'success' });
        } catch (err) {
            const reason = err.code === 'ECONNABORTED'
                ? 'Tiempo de espera agotado'
                : (err.response?.status ? `HTTP ${err.response.status}` : err.message);
            console.error('Create-from-topic error:', err);
            toast({ title: 'Error creando mazo desde Prompt', description: reason, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // se genera el archivo .apkg
    const handleConfirm = async () => {
        if (!draft?.deckId) {
            toast({ title: 'No hay borrador para confirmar', status: 'warning' });
            return;
        }
        const t = pickTemplate();
        if (!t) return;

        setLoading(true);
        try {
            const payload = {
                deckname: deckName,
                template: {
                    template_name: t.template_name,
                    template_id: t.template_id,
                    front: t.front ?? [],
                    back: t.back ?? []
                },
                flashc: editedCards.map(c => ({
                    campos_anverso: (c.question || '').split('\n').filter(Boolean),
                    campo_reverso: (c.answer || '').split('\n').filter(Boolean),
                }))
            };

            const { data } = await api.post('/decks/confirm/', payload, { timeout: 0 });

            toast({
                title: `Mazo creado: ${data?.deck_name || deckName}`,
                description: data?.file_path || 'Archivo .apkg generado',
                status: 'success',
                duration: 6000
            });
            // refresca en CardsPage
            onCreated?.();
            setDraft(null);
            setEditedCards([]);
        } catch (err) {
            const reason = err.code === 'ECONNABORTED'
                ? 'Tiempo de espera agotado'
                : (err.response?.status ? `HTTP ${err.response.status}` : err.message);
            console.error('Confirm error:', err);
            toast({ title: 'Error confirmando mazo', description: reason, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    //muestra previsualización + inputs editables para question/answer
    const DraftEditor = () => {
        if (!draft) return null;
        return (
            <Card mt={6}>
                <CardBody>
                    {/* PREVIEW de tarjetitas */}
                    {editedCards.length > 0 && (
                        <Card mt={2} variant="outline">
                            <CardBody>
                                <Text fontWeight="bold" mb={3}>Previsualización de tarjetas</Text>
                                <VStack align="stretch" spacing={3}>
                                    {editedCards.map((c, idx) => (
                                        <Box
                                            key={`preview-${c.id ?? idx}`}
                                            p={3}
                                            border="1px dashed"
                                            borderColor="gray.300"
                                            borderRadius="md"
                                        >
                                            <Text fontSize="xs" color="gray.500" mb={1}>PREGUNTA</Text>
                                            <Text whiteSpace="pre-wrap" mb={2}>{c.question || '—'}</Text>
                                            <Divider />
                                            <Text fontSize="xs" color="gray.500" mt={2} mb={1}>RESPUESTA</Text>
                                            <Text whiteSpace="pre-wrap">{c.answer || '—'}</Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    <Text fontWeight="bold" mb={2}>Borrador (Deck ID: {draft.deckId})</Text>
                    <Divider mb={4} />

                    <FormControl mb={4}>
                        <FormLabel>Nombre del mazo</FormLabel>
                        <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                    </FormControl>

                    <VStack align="stretch" spacing={3}>
                        {editedCards.map((c) => (
                            <Box key={c.id} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                                <FormControl mb={2}>
                                    <FormLabel>Pregunta</FormLabel>
                                    <Textarea
                                        value={c.question || ''}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setEditedCards(prev =>
                                                prev.map(it => it.id === c.id ? { ...it, question: v } : it)
                                            );
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Respuesta</FormLabel>
                                    <Textarea
                                        value={c.answer || ''}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setEditedCards(prev =>
                                                prev.map(it => it.id === c.id ? { ...it, answer: v } : it)
                                            );
                                        }}
                                    />
                                </FormControl>
                            </Box>
                        ))}

                    </VStack>

                    <HStack mt={4} spacing={3}>
                        <Button colorScheme="purple" onClick={handleConfirm} isLoading={loading}>
                            Confirmar y generar .apkg
                        </Button>
                        <Button variant="ghost" onClick={() => { setDraft(null); setEditedCards([]); }}>
                            Cancelar
                        </Button>
                    </HStack>
                </CardBody>
            </Card>
        );
    };

    return (
        <Box p={4}>
            <HStack mb={4} justify="space-between" align="start">
                <Text fontSize="xl" fontWeight="bold">Crear nuevo mazo</Text>
                <Button onClick={onBack} variant="ghost">Volver</Button>
            </HStack>

            <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                <Box>
                    <Text fontWeight="semibold">Aviso:</Text>
                    <Text fontSize="sm">
                        Generar un mazo puede tardar varios minutos según el tamaño del PDF, la plantilla y el modelo seleccionado.
                        No cierres la app durante el proceso.
                    </Text>
                </Box>
            </Alert>

            <VStack align="stretch" spacing={4} mb={4}>
                <FormControl>
                    <FormLabel>Plantilla</FormLabel>
                    <Select
                        placeholder="Selecciona plantilla"
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                    >
                        {templates.map(t => (
                            <option key={t.template_id || t.id} value={t.template_id || t.id}>
                                {t.name || t.template_name}
                            </option>
                        ))}
                    </Select>
                    <FormHelperText>Obligatoria para ambas formas de creación</FormHelperText>
                </FormControl>

                <HStack spacing={4}>
                    <FormControl>
                        <FormLabel>Temperatura</FormLabel>
                        <Input
                            type="number" step="0.1" min={0} max={2}
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                        />
                        <FormHelperText>0 = determinista, 2 = creativo</FormHelperText>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Máx. tokens</FormLabel>
                        <Input
                            type="number" min={64} max={4096}
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(Number(e.target.value))}
                        />
                        <FormHelperText>Límite de salida del modelo</FormHelperText>
                    </FormControl>
                </HStack>
            </VStack>

            <Tabs colorScheme="purple" variant="enclosed">
                <TabList>
                    <Tab>Desde PDF</Tab>
                    <Tab>Desde Prompt</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            <FormControl>
                                <FormLabel>Archivo PDF</FormLabel>
                                <PdfUpload 
                                    templateId={templateId}
                                    onFileSelected={(file) => setPdfFile(file)}
                                    currentFile={pdfFile}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Instrucciones (opcional)</FormLabel>
                                <Textarea value={pdfPrompt} onChange={(e) => setPdfPrompt(e.target.value)} />
                            </FormControl>
                            <Button
                                colorScheme="purple"
                                onClick={handleCreateFromPdf}
                                isLoading={loading}
                                isDisabled={!templateId || !pdfFile || !modeloCargado}
                            >
                                Generar borrador desde PDF
                            </Button>
                        </VStack>
                    </TabPanel>

                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            <FormControl>
                                <FormLabel>Tema / Prompt</FormLabel>
                                <Textarea
                                    value={topic}
                                    onChange={(e) => {
                                        if (!templateId) {
                                            toast({
                                                title: 'Selecciona una plantilla',
                                                description: 'Debes elegir una plantilla antes de escribir el prompt.',
                                                status: 'warning',
                                            });
                                            return;
                                        }
                                        setTopic(e.target.value);
                                    }}
                                    placeholder="p.ej., Introducción a React"
                                />
                            </FormControl>
                            <Button
                                colorScheme="purple"
                                onClick={handleCreateFromPrompt}
                                isLoading={loading}
                                isDisabled={!templateId || !topic || !modeloCargado}
                            >
                                Generar borrador desde Prompt
                            </Button>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Box mt={6}>
                <ModelControl />
            </Box>

            <DraftEditor />
        </Box>
    );
}