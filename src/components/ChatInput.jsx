import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, Mic, AudioLines, Paperclip, Image as ImageIcon, Lightbulb, Telescope, MoreHorizontal, Globe, BookOpen, PenTool, FileText } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // { data: base64, mimeType }
  const { colorAcentoHex } = useSettings();
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
        setShowSubMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((message.trim() || selectedImage) && !isLoading) {
      onSendMessage(message || "Adjunto archivo visual", selectedImage);
      setMessage('');
      setSelectedImage(null);
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const triggerImageUpload = () => {
     setShowAttachMenu(false);
     setShowSubMenu(false);
     if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleCreateImagePrompt = () => {
     setShowAttachMenu(false);
     setShowSubMenu(false);
     setMessage("Crea una imagen detallada de: ");
     if (textareaRef.current) textareaRef.current.focus();
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;

        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Quality 0.8 to keep under 4MB limit usually
        const base64data = canvas.toDataURL('image/jpeg', 0.8); 
        resolve({ data: base64data, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
    });
  };

  const handleFileChange = async (e) => {
     const file = e.target.files[0];
     if (file && file.type.startsWith('image/')) {
        try {
           const compressed = await compressImage(file);
           setSelectedImage(compressed);
        } catch (err) {
           console.error("Error compressing image", err);
           alert("No se pudo procesar la imagen.");
        }
     }
  };

  const handleAction = (text) => {
     setShowAttachMenu(false);
     setShowSubMenu(false);
     alert(`Función en desarrollo: ${text}`);
  };

  const fireVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado por voz nativo no soportado en este navegador de escritorio.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.start();
    
    recognition.onstart = () => setMessage(prev => prev + " [Escuchando...]");
    recognition.onresult = (e) => {
      setMessage(prev => prev.replace(" [Escuchando...]", "") + (prev ? " " : "") + e.results[0][0].transcript);
    };
    recognition.onerror = () => setMessage(prev => prev.replace(" [Escuchando...]", ""));
    recognition.onend = () => setMessage(prev => prev.replace(" [Escuchando...]", ""));
  };

  const fireVoiceMode = () => {
     if (!window.currentAIAudio) {
        window.currentAIAudio = new Audio();
     }
     // Play silent 0.1s base64 wav to unlock audio context on Chrome/Safari
     window.currentAIAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
     window.currentAIAudio.play().catch(e => console.log("Audio unlock:", e));
     
     window.dispatchEvent(new Event('toggleAIVoiceMode'));
  };

  return (
    <div className="w-full flex justify-center px-4 md:px-0 pb-2 md:pb-6 relative z-10 font-poppins">
      <div className="w-full max-w-3xl flex flex-col items-center">
        
        <form 
          onSubmit={handleSubmit}
          className="relative flex flex-col w-full bg-[#2F2F2F] rounded-[24px] px-2 py-0 shadow-sm border border-transparent focus-within:border-[#444] transition-colors"
        >
          {/* Visual Thumbnail Area */}
          {selectedImage && (
             <div className="w-full pl-12 pr-4 pt-3 pb-1">
                <div className="relative inline-block group">
                   <img src={selectedImage.data} alt="Adjunto" className="w-[60px] h-[60px] object-cover rounded-xl border border-[#444] shadow-md" />
                   <button 
                     type="button" 
                     onClick={() => setSelectedImage(null)}
                     className="absolute -top-1.5 -right-1.5 bg-[#444] hover:bg-[#ff4a4a] text-white rounded-full p-0.5 shadow transition-colors"
                   >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                </div>
             </div>
          )}

          {/* Top Row: Attachment & Textarea & Output actions */}
          <div className="flex items-end min-h-[52px] w-full pt-1 pb-1 relative">
            
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />

            {/* Attachment Button & Menu */}
            <div className="relative mb-0.5 ml-1 flex-shrink-0" ref={menuRef}>
               <button 
                 type="button"
                 onClick={() => setShowAttachMenu(!showAttachMenu)}
                 className="p-2 text-[#ECECEC] hover:bg-[#3F3F3F] rounded-full transition-colors flex items-center justify-center focus:outline-none"
               >
                 <Plus size={22} className={showAttachMenu ? "rotate-45 transition-transform" : "transition-transform"} />
               </button>

               {/* Attachment Popover */}
               {showAttachMenu && (
                 <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-[#212121] border border-[#444] rounded-2xl shadow-2xl py-2 z-[200] animate-fade-in-up">
                    <button type="button" onClick={triggerImageUpload} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                       <Paperclip size={18} className="text-[#ECECEC] shrink-0" strokeWidth={1.5}/> Agregar fotos y archivos
                    </button>
                    <button type="button" onClick={handleCreateImagePrompt} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                       <ImageIcon size={18} className="text-[#ECECEC] shrink-0" strokeWidth={1.5}/> Crea una imagen
                    </button>
                    <button type="button" onClick={() => handleAction('Pensar')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                       <Lightbulb size={18} className="text-[#ECECEC] shrink-0" strokeWidth={1.5}/> Pensar
                    </button>
                    <button type="button" onClick={() => handleAction('Investigar a fondo')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                       <Telescope size={18} className="text-[#ECECEC] shrink-0" strokeWidth={1.5}/> Investigar a fondo
                    </button>
                    
                    <div className="h-px bg-[#444] my-1 mx-3"></div>

                    <div 
                      className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center justify-between transition-colors cursor-pointer group"
                      onMouseEnter={() => setShowSubMenu(true)}
                      onClick={() => setShowSubMenu(!showSubMenu)}
                    >
                       <div className="flex items-center gap-3">
                          <MoreHorizontal size={18} className="text-[#ECECEC]" strokeWidth={1.5}/> Más
                       </div>
                    </div>

                    {/* Más Submenu */}
                    {showSubMenu && (
                      <div className="absolute bottom-0 left-full ml-1 w-56 bg-[#212121] border border-[#444] rounded-2xl shadow-2xl py-2 z-[210] animate-fade-in-up">
                        <button type="button" onClick={() => handleAction('Busca en la web')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                           <Globe size={18} className="text-[#ECECEC]" strokeWidth={1.5}/> Busca en la web
                        </button>
                        <button type="button" onClick={() => handleAction('Estudia y aprende')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                           <BookOpen size={18} className="text-[#ECECEC]" strokeWidth={1.5}/> Estudia y aprende
                        </button>
                        <button type="button" onClick={() => handleAction('Canvas')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                           <PenTool size={18} className="text-[#ECECEC]" strokeWidth={1.5}/> Canvas
                        </button>
                        <button type="button" onClick={() => handleAction('Cuestionarios')} className="w-full text-left px-4 py-3 text-[14px] text-[#ECECEC] hover:bg-[#2F2F2F] flex items-center gap-3 transition-colors">
                           <FileText size={18} className="text-[#ECECEC]" strokeWidth={1.5}/> Cuestionarios
                        </button>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* TEXTAREA WRAPPER FOR WEBKIT SAFE HITBOX */}
            <div className="flex-1 flex flex-col justify-center min-w-0 px-1 pt-1">
              <textarea 
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntale a C7 Studio" 
                className="w-full bg-transparent text-[#ECECEC] placeholder-[#A0A0A0] focus:outline-none resize-none px-2 py-3 font-poppins text-[16px] scrollbar-hide leading-[1.6]"
                rows={1}
                disabled={isLoading}
                style={{
                   maxHeight: '200px'
                }}
              />
            </div>
            {/* Right side dynamic actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pr-1 pb-1">
              {!message.trim() && !selectedImage && !isLoading ? (
                <>
                  <button type="button" onClick={fireVoiceInput} className="p-2 text-[#ECECEC] hover:bg-[#3F3F3F] rounded-full transition-colors flex items-center justify-center">
                    <Mic size={20} strokeWidth={1.5} />
                  </button>
                  <button 
                    type="button" 
                    onClick={fireVoiceMode}
                    className="p-2.5 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 ml-1"
                    style={{ backgroundColor: colorAcentoHex }}
                  >
                    <AudioLines size={18} strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || (!message.trim() && !selectedImage)}
                  className="p-2 mr-1 mb-0.5 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ backgroundColor: isLoading ? '#424242' : colorAcentoHex }}
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>

          </div>
        </form>

        <div className="text-center mt-2 mb-1">
          <p className="text-[11px] text-[#A0A0A0] font-poppins">
            ChatGPT puede cometer errores. Comprueba la información importante. Consulta Preferencias de cookies.
          </p>
        </div>

      </div>
    </div>
  );
};
export default ChatInput;
