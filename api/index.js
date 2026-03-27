import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/image', async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).send('Prompt is required');
  if (!process.env.POLLINATIONS_API_KEY) return res.status(500).send('API key missing');

  try {
    // Pollinations typically supports `?key=` query param for auth or Bearer token.
    // As of recent updates, authenticated requests require a `model` parameter (e.g. flux).
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&private=true&key=${process.env.POLLINATIONS_API_KEY}&model=flux`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error('Pollinations Error:', response.status, response.statusText);
      return res.status(response.status).send('Failed to fetch image from Pollinations');
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Pipe the image buffer back to the client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: "Eres un asistente de IA muy útil y avanzado para C7 Studio. Si el usuario te pide generar, crear o dibujar una imagen o foto, DEBES responder con un prompt altamente descriptivo en inglés y usar exactamente este formato de imagen en Markdown apuntando a nuestro servidor proxy: `![Descripción visual detallada](/api/image?prompt=your%20english%20prompt%20here)`. Asegúrate de que las palabras en la URL estén separadas por `%20`. Tu respuesta debe consistir ÚNICAMENTE de ese Markdown si te piden una imagen explícita, sin texto adicional antes o después. Para cualquier otra petición, responde de manera natural y amable en español."
    });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      // Send the chunk data formatted as an SSE message
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.write(`data: ${JSON.stringify({ error: `Error de Gemini: ${error.message}` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
export default app;
