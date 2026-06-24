import { GoogleGenAI } from '@google/genai';

function cleanJson(text: string): string {
  return text.replace(/```json|```/gi, '').trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey =
    (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: 'Falta la API Key de Gemini' });
  }

  try {
    const {
      tarea,
      contexto,
      tipo,
      titulo: tituloReq,
      motivoBloqueo,
      sprintData,
    } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    const generate = async (prompt: string, temperature = 0.6) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature },
      });
      return response.text || '';
    };

    if (tipo === 'autodesc') {
      const prompt = `
Actúas como un Project Manager experto en metodologías ágiles.
A partir del título de una tarea, genera una descripción breve y accionable, y estima su esfuerzo y prioridad.

Título: ${tituloReq}

Reglas estrictas:
- "descripcion": string (2-3 frases en español, qué hacer y por qué).
- "esfuerzo": uno de 'XS', 'S', 'M', 'L', 'XL'.
- "prioridad": uno de 'baja', 'media', 'alta'.
Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código ni texto extra:
{ "descripcion": "...", "esfuerzo": "...", "prioridad": "..." }
`;
      const text = await generate(prompt);
      const data = JSON.parse(cleanJson(text));
      return res.json(data);
    }

    if (tipo === 'unblock') {
      const prompt = `
Actúas como un Project Manager experto resolviendo bloqueos en proyectos ágiles.
Una tarea está bloqueada. Sugiere acciones concretas para desbloquearla.

Tarea: ${tituloReq}
Motivo del bloqueo: ${motivoBloqueo}

Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código ni texto extra:
{ "sugerencias": ["sugerencia accionable 1", "sugerencia accionable 2", "sugerencia accionable 3"] }
Cada sugerencia debe ser una frase corta y accionable en español.
`;
      const text = await generate(prompt);
      const data = JSON.parse(cleanJson(text));
      return res.json(data);
    }

    if (tipo === 'sprintplan') {
      const prompt = `
Actúas como un Project Manager experto en planificación de sprints.
Analiza las siguientes tareas del backlog y propón en qué orden deberían abordarse en el sprint, priorizando por prioridad, esfuerzo y dependencias lógicas.

Tareas del backlog:
${JSON.stringify(sprintData?.tareas || [], null, 2)}

Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código ni texto extra:
{ "plan": [ { "id": "id-de-la-tarea", "razon": "razón breve en español" } ] }
Incluye solo las tareas que recomiendas para el sprint, ordenadas de la primera a la última. Usa los IDs exactos provistos.
`;
      const text = await generate(prompt);
      const data = JSON.parse(cleanJson(text));
      return res.json(data);
    }

    if (tipo === 'weeklyreview') {
      const prompt = `
Actúas como un Scrum Master generando un resumen de sprint estilo standup.
Analiza los datos del sprint y genera un resumen estructurado.

Datos del sprint:
${JSON.stringify(sprintData || {}, null, 2)}

Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código ni texto extra:
{
  "completadas": "resumen en español de lo completado",
  "enCurso": "resumen en español de lo que está en curso",
  "bloqueadas": "resumen en español de lo bloqueado y por qué",
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
}
Sé conciso y profesional, todo en español.
`;
      const text = await generate(prompt);
      const data = JSON.parse(cleanJson(text));
      return res.json(data);
    }

    // Default: split task into subtasks
    const prompt = `
Actúas como un Project Manager experto en metodologías ágiles.
Tu objetivo es dividir la siguiente tarea en subtareas más pequeñas, accionables y lógicas, y devolver el resultado **únicamente** en formato JSON válido.

Tarea principal:
Título: ${tarea.titulo}
Descripción: ${tarea.descripcion || 'Sin descripción'}
Esfuerzo original: ${tarea.esfuerzo || 'No especificado'}

Contexto del tablero (columnas disponibles):
${contexto}

Reglas estrictas:
1. Divide la tarea en 2 a 5 subtareas.
2. Cada subtarea debe tener:
   - "titulo": string (corto, accionable).
   - "descripcion": string (breve explicación de qué hacer).
   - "esfuerzo": string (debe ser 'XS', 'S', 'M', 'L', o 'XL').
   - "prioridad": string (debe ser 'baja', 'media' o 'alta').
   - "columnaId": string (el ID de la columna sugerida donde debería empezar, usando el contexto provisto).
3. La salida DEBE ser un JSON con esta estructura exacta, y NADA MÁS. No incluyas bloques de código \`\`\`json ni texto explicativo:
[
  {
    "titulo": "...",
    "descripcion": "...",
    "esfuerzo": "...",
    "prioridad": "...",
    "columnaId": "..."
  }
]
`;

    const text = await generate(prompt);
    const subtasks = JSON.parse(cleanJson(text));
    res.json({ subtasks });
  } catch (error: any) {
    console.error('Error in AI handler:', error);
    let errorMessage = error.message || 'Error processing request';
    if (error.status === 429 || errorMessage.includes('429')) {
      errorMessage = 'Límite de cuota de API excedido. Por favor, inténtalo de nuevo más tarde.';
    }
    if (error.status === 400 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid')) {
      errorMessage = 'API Key inválida. Pulsa en tu nombre de usuario para cambiarla.';
    }
    res.status(500).json({ error: errorMessage });
  }
}
