import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

function checkAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) return next();
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${appSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/ping', checkAuth, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // API Route for Gemini
  app.post('/api/gemini', checkAuth, async (req, res) => {
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
        config: {
          temperature: 0.6,
        }
      });

      const text = response.text || '';
      // Clean up markdown code blocks if any
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
