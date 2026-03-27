import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const VoiceAssistantModal = ({ isOpen, onClose, onSendMessage, isLoading }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const { colorAcentoHex } = useSettings();
  
  // Initiate Speech Recognition
  useEffect(() => {
     if (!isOpen) return;

     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) {
        alert("Tu navegador de escritorio actual no soporta el reconocimiento de voz nativo.");
        onClose();
        return;
     }

     recognitionRef.current = new SpeechRecognition();
     recognitionRef.current.lang = 'es-MX';
     recognitionRef.current.continuous = false;
     recognitionRef.current.interimResults = true;

     recognitionRef.current.onstart = () => setIsListening(true);
     recognitionRef.current.onresult = (e) => {
        let current = '';
        for (let i = 0; i < e.results.length; i++) {
            current += e.results[i][0].transcript;
        }
        setTranscript(current);
     };

     recognitionRef.current.onend = () => {
        setIsListening(false);
     };

     return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
     };
  }, [isOpen, onClose]);

  // Handle auto-send after user stops talking
  useEffect(() => {
     if (!isListening && transcript.trim() && !isLoading) {
         onSendMessage(transcript);
         setTranscript('');
     }
  }, [isListening, transcript, isLoading, onSendMessage]);

  // Listen for AI completing its synthesized speech to wake Mic up
  useEffect(() => {
     if (!isOpen) return;
     const handleSpeechEnd = () => {
        if (recognitionRef.current) {
           setTimeout(() => recognitionRef.current.start(), 300);
        }
     };
     window.addEventListener('aiSpeechFinished', handleSpeechEnd);
     return () => window.removeEventListener('aiSpeechFinished', handleSpeechEnd);
  }, [isOpen]);

  // Start initially
  useEffect(() => {
     if (isOpen && !isLoading && !isListening) {
        const t = setTimeout(() => {
            if (recognitionRef.current) recognitionRef.current.start();
        }, 500);
        return () => clearTimeout(t);
     }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col justify-between items-center py-10 px-6 font-poppins animate-fade-in-up">
       {/* Top Bar */}
       <div className="w-full flex justify-end">
          <button 
             onClick={() => { window.speechSynthesis.cancel(); onClose(); }} 
             className="bg-[#2F2F2F] text-[#ECECEC] p-3 rounded-full hover:bg-[#444] hover:text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
       </div>

       {/* Central Orb / Animation */}
       <div className="flex-1 flex flex-col items-center justify-center w-full mt-[-8vh]">
          <div className="relative flex items-center justify-center mb-16">
             {isLoading ? (
                <div 
                   className="w-48 h-48 rounded-full animate-pulse shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                   style={{ background: `linear-gradient(45deg, #2F2F2F, ${colorAcentoHex})` }}
                ></div>
             ) : isListening ? (
                <div 
                   className="w-48 h-48 rounded-full animate-ping shadow-[0_0_80px_rgba(255,255,255,0.8)] opacity-70"
                   style={{ backgroundColor: colorAcentoHex }}
                ></div>
             ) : (
                <div className="w-48 h-48 rounded-full bg-[#1A1A1A] shadow-lg flex items-center justify-center transition-all duration-500 hover:scale-105 border border-[#333]">
                   <div className="flex gap-2.5 h-12 w-24 items-center justify-center">
                      <div className="w-2.5 h-2/3 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-full bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                      <div className="w-2.5 h-1/2 bg-white rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                   </div>
                </div>
             )}
          </div>
          
          {/* Transcript / Status Text */}
          <div className="h-24 overflow-hidden text-center max-w-2xl mx-auto px-4">
             <p className="text-[#ECECEC] text-[22px] md:text-[26px] font-medium leading-relaxed opacity-95 transition-opacity">
                {isLoading ? "Procesando..." : isListening ? (transcript || "Escuchando...") : transcript}
             </p>
          </div>
       </div>

       {/* Bottom Controls */}
       <div className="w-full flex justify-center pb-8">
          <button 
             onClick={() => {
                 if (isListening) recognitionRef.current.stop();
                 else recognitionRef.current.start();
             }}
             className={`p-5 rounded-full shadow-2xl transition-all cursor-pointer ${isListening ? 'bg-[#ff4a4a] hover:bg-[#ff3333]' : 'bg-white text-black hover:bg-gray-200'} `}
          >
             {isListening ? <MicOff size={32} color="white"/> : <Mic size={32} />}
          </button>
       </div>
    </div>
  );
};
export default VoiceAssistantModal;
