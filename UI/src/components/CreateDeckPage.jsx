import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, VStack, HStack, Text, Select, Button, Input, Textarea,
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    FormHelperText, useToast, Card, CardBody, Divider, Alert, AlertIcon, Flex, Editable, EditablePreview, EditableTextarea
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
            <line x1="7" y1="11" x2="17" y2="11" stroke={color} strokeWidth="1" opacity="0.3" />
            <line x1="7" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1" opacity="0.3" />
            <line x1="7" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1" opacity="0.3" />
            <rect x="5" y="16.5" width="14" height="4" rx="1" fill="red" />
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

//funcion que recibe 2 parametros, arr que son los datos crudos de la tarjeta y len(numero de campos que exige la plantilla tanto en front y back)
//normalizeTolen asegura que cada tarjeta creada coincida con la cantidad de campos que definimos en nuestra plantilla, ya sea rellenando o recortando segun sea el caso

const normalizeToLen = (arr = [], len) =>
    Array.from({ length: len }, (_, i) => arr[i] ?? "");//se crea un arreglo nuevo de tamaño len, el calback se ejecuta una vez por cada indice, si el arreglo existe se copia y si no de pone ""

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
        let cancelled = false;
        (async () => {
            try {
                const { data } = await api.get("/templates/list/", { timeout: 60000 });
                if (cancelled) return;

                // normaliza forma de cada plantilla
                const list = (Array.isArray(data) ? data : []).map(t => ({
                    template_id: t.template_id ?? t.id,
                    template_name: t.template_name ?? t.name ?? "Sin nombre",
                    front: Array.isArray(t.front) ? t.front : [],
                    back: Array.isArray(t.back) ? t.back : [],
                }));

                setTemplates(list);

                // auto-selecciona si solo hay una
                if (!templateId && list.length === 1) {
                    setTemplateId(String(list[0].template_id));
                }
            } catch (err) {
                const reason = err.code === "ECONNABORTED"
                    ? "Tiempo de espera agotado"
                    : (err.response?.status ? `HTTP ${err.response.status}` : err.message);
                toast({ title: "No se pudieron cargar las plantillas", description: reason, status: "error" });
            }
        })();
        return () => { cancelled = true }; // evita setState tras unmount

    }, []); //se carga una vez

    //validaciones, verifica que haya un modelo cargado 
    const ensureModel = () => {
        if (!modeloCargado) {
            toast({ title: 'Carga un modelo en la sección Modelos', status: 'warning' });
            return false;
        }
        return true;
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
            frontFields:
                Array.isArray(c.campos_anverso) ? c.campos_anverso :
                    Array.isArray(c.campos_front) ? c.campos_front :
                        Array.isArray(c.front) ? c.front :
                            (typeof c.question === 'string' ? [c.question] : []),

            backFields:
                Array.isArray(c.campo_reverso) ? c.campo_reverso :
                    Array.isArray(c.campos_reverso) ? c.campos_reverso :
                        Array.isArray(c.back) ? c.back :

                            (typeof c.answer === 'string' ? [c.answer] : []),
        }));
    };

    //aqui se crea el borrador a partir de un archivo creado
    const handleCreateFromPdf = async () => {
        if (!ensureModel()) return;
        if (!templateId || !pdfFile) {
            toast({ title: 'Selecciona plantilla y PDF', status: 'warning' });
            return;
        }
        const t = selectedTemplate;
        if (!t || t.front.length === 0 || t.back.length === 0) {
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
                template: t,
            };

            //arma el FormData con AMBAS partes
            const form = new FormData();
            form.append('pdf_file', pdfFile, pdfFile.name);
            form.append('Create_Deck_Request', JSON.stringify(reqJson));

        
            const { data } = await api.post('/decks/create/', form, { timeout: 0 });

            const raw = toEditorCards(data);

            //raw es el arreglo de tarjetas crudas que devuelve el back.
            // map recorre cada tarjeta cruda (cada elemento se llama c)
            //(...) spread operator copia todas las propiedades de la tarjeta cruda "c"
            // (...c aqui se copia todo el contenido original y despues sobrescribe frontFields y bakFields con los resultados de normalizeTolen

            //c.frontFields es el arreglo con los valores que vinieron para el anverso de la tarjeta(arr: son los datos crudos)
            //t.front.length es el numero de campos que la plantilla exige que debe haber en el anverso(len en normalizTolen)
            const cards = raw.map(c => ({
                ...c,
                frontFields: normalizeToLen(c.frontFields, t.front.length),
                backFields: normalizeToLen(c.backFields, t.back.length),
            }));


            setEditedCards(cards);


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
        const t = selectedTemplate;
        if (!t || t.front.length === 0 || t.back.length === 0) {
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
                template: t,
            };
            const { data } = await api.post('/decks/create-from-topic/', payload, { timeout: 0 });
            
            const raw = toEditorCards(data);

            //c.frontFields es el arreglo con los valores que vinieron para el anverso de la tarjeta(arr: son los datos crudos)
            //t.front.length es el tamaño de campos que la plantilla dice que debe haber en el anverso
            const cards = raw.map(c => ({
                ...c,
                frontFields: normalizeToLen(c.frontFields, t.front.length),
                backFields: normalizeToLen(c.backFields, t.back.length),
            }));
            setEditedCards(cards);

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

const selectedTemplate = useMemo(() => {
    const t = templates.find(x => String(x.template_id ?? x.id) === String(templateId));
    if (!t) return null;
    return {
        template_id: t.template_id ?? t.id,
        template_name: t.name ?? t.template_name,
        front: t.front ?? [],
        back: t.back ?? [],
    };
}, [templates, templateId]);



// se genera el archivo .apkg
const handleConfirm = async () => {
    if (!draft?.deckId) {
        toast({ title: 'No hay borrador para confirmar', status: 'warning' });
        return;
    }
    const t = selectedTemplate;
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
                campos_anverso: (c.frontFields || []).map(s => s.trim()).filter(Boolean),
                campo_reverso: (c.backFields || []).map(s => s.trim()).filter(Boolean),
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


        <DraftEditor
            draft={draft}
            deckName={deckName}
            setDeckName={setDeckName}
            editedCards={editedCards}
            setEditedCards={setEditedCards}
            loading={loading}
            handleConfirm={handleConfirm}
            setDraft={setDraft}
            template={selectedTemplate}
        />
    </Box>
);
}

//muestra previsualización + inputs editables para question/answer

function DraftEditor({

    draft,
    deckName,
    setDeckName,
    editedCards,
    setEditedCards,
    loading,
    handleConfirm,
    setDraft,
    template,
}) {
    if (!draft || !template) return null;

    return (
        <Card mt={6}>
            <CardBody>
                <Text fontWeight="bold" mb={2}>Mazo (Deck ID: {draft.deckId})</Text>
                <Divider mb={4} />

                <FormControl mb={4}>
                    <FormLabel>Nombre del mazo</FormLabel>
                    <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                </FormControl>

                {editedCards.length === 0 && (
                    <Text fontSize="sm" color="gray.500">No hay tarjetas en el borrador.</Text>
                )}

                <VStack align="stretch" spacing={3}>
                    {editedCards.map((c, idx) => (
                        <Box
                            key={c.id}
                            p={3}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            bg="white"
                        >
                            <Text fontSize="sm" color="gray.500" mb={2}>
                                Tarjeta #{idx + 1}
                            </Text>

                            {/* PREGUNTA */}
                         {/*dentro del map(editedCards)*/}
                            <Text fontSize="xs" color="gray.500" mb={1}>ANVERSO</Text>

                            {template.front.map((label, i) => (
                                <FormControl key={`front-${c.id}-${i}`} mb={2}>
                                    <FormLabel fontSize="xs" color="gray.500">
                                        {label || `Front #${i + 1}`}
                                    </FormLabel>

                                    <Editable
                                        value={c.frontFields?.[i] ?? ""}
                                        onChange={(v) => {
                                            setEditedCards(prev => prev.map(it => {
                                                if (it.id !== c.id) return it;
                                                const next = normalizeToLen(it.frontFields, template.front.length);
                                                next[i] = v;
                                                return { ...it, frontFields: next };
                                            }));
                                        }}
                                        submitOnBlur
                                        isPreviewFocusable
                                        placeholder="—"
                                    >
                                        <EditablePreview whiteSpace="pre-wrap" px={2} py={2} border="1px dashed" borderColor="gray.300" borderRadius="md" />
                                        <EditableTextarea whiteSpace="pre-wrap" px={2} py={2} minH="80px" resize="vertical"
                                            border="1px solid" borderColor="purple.300" borderRadius="md"
                                            _focusVisible={{ outline: 'none', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }} />
                                    </Editable>
                                </FormControl>
                            ))}

                            <Divider my={2} />
                            <Text fontSize="xs" color="gray.500" mb={1}>REVERSO</Text>

                            {template.back.map((label, i) => (
                                <FormControl key={`back-${c.id}-${i}`} mb={2}>
                                    <FormLabel fontSize="xs" color="gray.500">
                                        {label || `Back #${i + 1}`}
                                    </FormLabel>

                                    <Editable
                                        value={c.backFields?.[i] ?? ""}
                                        onChange={(v) => {
                                            setEditedCards(prev => prev.map(it => {
                                                if (it.id !== c.id) return it;
                                                const next = normalizeToLen(it.backFields, template.back.length);
                                                next[i] = v;
                                                return { ...it, backFields: next };
                                            }));
                                        }}
                                        submitOnBlur
                                        isPreviewFocusable
                                        placeholder="—"
                                    >
                                        <EditablePreview whiteSpace="pre-wrap" px={2} py={2} border="1px dashed" borderColor="gray.300" borderRadius="md" />
                                        <EditableTextarea whiteSpace="pre-wrap" px={2} py={2} minH="80px" resize="vertical"
                                            border="1px solid" borderColor="purple.300" borderRadius="md"
                                            _focusVisible={{ outline: 'none', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }} />
                                    </Editable>
                                </FormControl>
                            ))}

                        </Box>
                    ))}
                </VStack>

                <HStack mt={4} spacing={3}>
                    <Button
                        colorScheme="purple"
                        onClick={handleConfirm}
                        isLoading={loading}
                        isDisabled={loading || editedCards.length === 0}
                    >
                        Confirmar y generar .apkg
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => { setDraft(null); setEditedCards([]); }}
                    >
                        Cancelar
                    </Button>
                </HStack>
            </CardBody>
        </Card>
    );
};




