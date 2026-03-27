import React from 'react';
import { X, MessageSquare, RefreshCcw, Trash2 } from 'lucide-react';

const ArchivedChatsModal = ({ isOpen, onClose, chats, onUnarchive, onDelete }) => {
  const safeChats = Array.isArray(chats) ? chats : [];
  const archivedChats = safeChats.filter(c => c && c.archived);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#212121]/90 z-[100] flex items-center justify-center p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#171717] w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-[#333333] shadow-2xl relative overflow-hidden">
        
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#333333] bg-[#212121]">
          <div>
            <h2 className="text-xl font-poppins font-semibold text-white">Chats Archivados</h2>
            <p className="text-xs text-[#8E8E8E] mt-1">{archivedChats.length} conversaciones ocultas</p>
          </div>
          <button onClick={onClose} className="text-[#8E8E8E] hover:text-white transition-colors bg-[#2F2F2F] hover:bg-[#3F3F3F] p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {archivedChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-[#ECECEC] font-poppins">No tienes chats archivados</p>
              <p className="text-sm text-[#8E8E8E] mt-2">Puedes ocultar conversaciones del menú principal sin borrarlas desde los tres puntos del chat.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedChats.map(chat => (
                <div key={chat.id} className="flex items-center justify-between bg-[#2F2F2F] p-4 rounded-xl border border-[#444] hover:border-[#555] transition-colors">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-[#212121] p-2 rounded-lg text-[#8E8E8E]">
                         <MessageSquare size={16} />
                      </div>
                      <div className="flex flex-col truncate">
                         <span className="text-[#ECECEC] font-medium text-sm truncate">{chat.title}</span>
                         <span className="text-[#8E8E8E] text-xs">
                           {new Date(chat.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                   </div>
                   <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => onUnarchive(chat.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FFD000] hover:bg-[#E6BC00] text-black text-xs font-semibold rounded-lg transition-colors"
                      >
                         <RefreshCcw size={14} /> Restaurar
                      </button>
                      <button 
                        onClick={(e) => onDelete(chat.id, e)}
                        className="flex items-center justify-center w-8 h-8 bg-[#3F3F3F] hover:bg-[#ff4a4a] text-[#ECECEC] hover:text-white text-xs font-semibold rounded-lg transition-colors"
                        title="Borrar permanentemente"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArchivedChatsModal;
