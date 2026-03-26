import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export const generateAIStream = async (prompt, onUpdate) => {
  if (!genAI) {
    onUpdate("⚠️ **Clave API Ausente:** No se configuró `VITE_GEMINI_API_KEY` en el archivo `.env`. Por favor añade tu clave de Google Generative AI y reinicia el servidor local.");
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContentStream(prompt);
    
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
      onUpdate(text);
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    onUpdate(`⚠️ **Error de Conexión:** Ocurrió un fallo al comunicarse con Gemini. (${error.message || 'Inténtalo más tarde'})`);
  }
};
