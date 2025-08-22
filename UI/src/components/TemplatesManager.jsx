import React, { useEffect, useState } from "react";
import {
    Box, VStack, HStack, Text, Input, Button, useToast,
    List, ListItem, Badge, Divider
} from "@chakra-ui/react";
import api from "../../api";

//pequeño crud para la administracion de plantillas

export default function TemplatesManager() {
    const toast = useToast();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [front, setFront] = useState("Pregunta");
    const [back, setBack] = useState("Respuesta");

    //aqui se cargan las plantillas
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/templates/list/");
            setTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            toast({ title: "No se pudieron cargar las plantillas", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const handleCreate = async () => {
        const nameTrim = name.trim();
        const frontTrim = front.trim();
        const backTrim = back.trim();

        if (!nameTrim) {
            toast({ title: "Pon un nombre a la plantilla", status: "warning" });
            return;
        }
        if (!frontTrim || !backTrim) {
            toast({ title: "Define al menos un campo para front y back", status: "warning" });
            return;
        }

        const exists = templates.some(t => (t.template_name ?? t.name)?.toLowerCase() === nameTrim.toLowerCase());
        if (exists) {
            toast({ title: "Ese nombre de plantilla ya existe", status: "info" });
            return;
        }

        try {
            await api.post("/templates/create/", {
                template_name: nameTrim,
                front: [frontTrim],   
                back: [backTrim],
            });
            toast({ title: "Plantilla creada", status: "success" });
            setName("");
            setFront("Pregunta");
            setBack("Respuesta");
            fetchTemplates();      
        } catch (err) {
            toast({ title: "No se pudo crear", status: "error" });
        }
    };


    const handleDelete = async (templateId) => {
        const ok = window.confirm("¿Seguro que quieres eliminar este template?");
        if (!ok) return;
        try {
            await api.delete("/templates/delete/", { data: { template_id: templateId } });
            toast({ title: "Plantilla eliminada", status: "success" });
            setTemplates(prev => prev.filter(t => (t.template_id ?? t.id) !== templateId));
        } catch (err) {
            toast({ title: "No se pudo eliminar", status: "error" });
        }
    };

    return (
        <Box p={4}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Administrar plantillas</Text>

            <VStack align="stretch" spacing={3} mb={6}>
                <Text fontWeight="semibold">Crear nueva</Text>
                <HStack>
                    <Input placeholder="Nombre (p. ej. Básica Q/A)" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="Front" value={front} onChange={e => setFront(e.target.value)} />
                    <Input placeholder="Back" value={back} onChange={e => setBack(e.target.value)} />
                    <Button colorScheme="purple" onClick={handleCreate}>Crear</Button>
                </HStack>
            </VStack>

            <Divider mb={4} />

            <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Plantillas ({templates.length})</Text>
                <Button size="sm" onClick={fetchTemplates} isLoading={loading}>Actualizar</Button>
            </HStack>

            <List spacing={2}>
                {templates.map((t) => {
                    const id = t.template_id ?? t.id;
                    const nombre = t.template_name ?? t.name;
                    return (
                        <ListItem key={id}>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text>{nombre}</Text>
                                    <HStack fontSize="sm" color="gray.600">
                                        <Badge>{(t.front || []).join(" | ") || "front vacía"}</Badge>
                                        <Badge>{(t.back || []).join(" | ") || "back vacía"}</Badge>
                                    </HStack>
                                </VStack>
                                <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDelete(id)}>
                                    Eliminar
                                </Button>
                            </HStack>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
}
