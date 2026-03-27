export const generateAIStream = async (prompt, image, isVoiceMode, onUpdate) => {
  try {
    // Connect to the proxy securely.
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, image, isVoiceMode }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let text = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      
      // Keep the last incomplete cross-chunk part in the buffer
      buffer = lines.pop(); 
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
             return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
               onUpdate(`⚠️ **Error del Servidor:** ${parsed.error}`);
               return;
            }
            if (parsed.text) {
              text += parsed.text;
              onUpdate(text);
            }
          } catch (e) {
            console.error("Error al procesar los datos del stream", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    onUpdate(`⚠️ **Error de Conexión:** No se pudo comunicar con tu servidor local. Asegúrate de iniciar el backend (node server/server.js). (${error.message || 'Inténtalo de nuevo'})`);
  }
};
