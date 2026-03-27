import React, { useMemo } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

const ImageGalleryModal = ({ isOpen, onClose, chats }) => {
  // Extraer todas las imágenes de los historiales de chat
  const images = useMemo(() => {
    const extracted = [];
    const regex = /!\[.*?\]\((.*?)\)/g;

    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.role === 'ai' && typeof msg.content === 'string') {
          let match;
          while ((match = regex.exec(msg.content)) !== null) {
             const url = match[1];
             if (url && (url.startsWith('http') || url.startsWith('/api/image'))) {
                extracted.push({
                   url,
                   chatTitle: chat.title,
                   date: chat.createdAt
                });
             }
          }
        }
      });
    });
    // Ordenar de más reciente a más antigua
    return extracted.sort((a, b) => b.date - a.date);
  }, [chats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#212121]/95 z-[100] flex flex-col animate-fade-in-up backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#333333]">
        <div>
           <h2 className="text-2xl font-poppins font-semibold text-white">Galería de Imágenes</h2>
           <p className="text-sm text-[#8E8E8E] mt-1">{images.length} imágenes generadas por IA</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-[#8E8E8E] hover:text-white transition-colors bg-[#2F2F2F] hover:bg-[#3F3F3F] p-2 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="text-6xl mb-4">🖼️</div>
             <p className="text-xl text-[#ECECEC] font-poppins">Tu galería está vacía</p>
             <p className="text-sm text-[#8E8E8E] mt-2">Pídele a C7 Studio que te dibuje o genere una imagen para verla aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {images.map((img, idx) => (
              <div key={idx} className="group relative aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg border border-[#333] hover:border-[#FFD000] transition-all">
                <img 
                  src={img.url} 
                  alt="AI Generated" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm font-medium truncate mb-2">{img.chatTitle}</p>
                  <div className="flex gap-2">
                    <a href={img.url} target="_blank" rel="noreferrer" className="flex-1 flex justify-center bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-lg transition-colors">
                       <ExternalLink size={16} />
                    </a>
                    <a href={img.url} download="C7_Studio_Image.jpg" className="flex-1 flex justify-center bg-[#FFD000] hover:bg-[#E6BC00] text-black p-2 rounded-lg transition-colors">
                       <Download size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;
