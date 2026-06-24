import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appSecret = process.env.APP_SECRET;
  if (appSecret) {
    const authHeader = req.headers.authorization as string | undefined;
    if (authHeader !== `Bearer ${appSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const { tarea, contexto } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la API Key de Gemini' });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.6 },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json|```/gi, '').trim();
    const subtasks = JSON.parse(cleanJson);
    res.json({ subtasks });
  } catch (error: any) {
    console.error('Error in AI split-task:', error);
    let errorMessage = error.message || 'Error processing request';
    if (error.status === 429 || errorMessage.includes('429')) {
      errorMessage = 'Límite de cuota de API excedido. Por favor, inténtalo de nuevo más tarde.';
    }
    res.status(500).json({ error: errorMessage });
  }
}
