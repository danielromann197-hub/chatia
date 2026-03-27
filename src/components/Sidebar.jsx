import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, PanelLeftClose, Trash2, LogOut, MoreHorizontal, Share, Users, Edit2, Pin, PinOff, Archive, Image as ImageIcon } from 'lucide-react';
import { logout } from '../firebase';

const Sidebar = ({ isOpen, setIsOpen, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, onTogglePinChat, onToggleArchiveChat, onShowImageGallery, onShowArchivedChats, user, onShowLogin }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeChats = Array.isArray(chats) ? chats : [];
  const activeChats = safeChats.filter(c => c && !c.archived);
  const pinnedChats = activeChats.filter(c => c.pinned);
  const recentChats = activeChats.filter(c => !c.pinned);

  const startRename = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setOpenMenuId(null);
  };

  const submitRename = () => {
    if (editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    alert("Enlace copiado al portapapeles.");
    setOpenMenuId(null);
  };

  const handleGroup = (e) => {
    e.stopPropagation();
    alert("Próximamente: Funcionalidad de chats grupales.");
    setOpenMenuId(null);
  };

  const renderChatList = (chatList, title) => {
    if (chatList.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="text-[11px] text-[#8E8E8E] font-poppins font-medium mb-2 px-3 uppercase tracking-wider">{title}</div>
        <div className="space-y-0.5">
          {chatList.map(chat => {
            const isActive = chat.id === currentChatId;
            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-between group cursor-pointer relative ${
                  isActive ? 'bg-[#212121] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageSquare size={16} className={isActive ? 'text-white' : 'text-[#8E8E8E] group-hover:text-[#ECECEC] transition-colors'} />
                  {editingChatId === chat.id ? (
                    <input 
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={e => e.key === 'Enter' && submitRename()}
                      className="bg-[#1A1A1A] text-white border border-[#FFD000] rounded px-2 py-0.5 text-sm w-full outline-none font-poppins"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate text-[14px] font-poppins font-light leading-tight pt-0.5 pr-4">
                      {chat.title}
                    </span>
                  )}
                </div>

                {/* Ellipsis Menu Button */}
                {!editingChatId || editingChatId !== chat.id ? (
                  <div className="relative flex-shrink-0" ref={openMenuId === chat.id ? menuRef : null}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === chat.id ? null : chat.id); }}
                      className={`text-[#8E8E8E] hover:text-white p-1 rounded-md transition-opacity ${openMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openMenuId === chat.id && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-56 bg-[#2F2F2F] border border-[#444] rounded-xl shadow-2xl py-1.5 z-[100] animate-fade-in-up">
                        <button onClick={handleShare} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Share size={15}/> Compartir</button>
                        <button onClick={handleGroup} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Users size={15}/> Iniciar un chat grupal</button>
                        <button onClick={(e) => startRename(chat, e)} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Edit2 size={15}/> Cambiar el nombre</button>
                        <button onClick={(e) => { e.stopPropagation(); onTogglePinChat(chat.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins">{chat.pinned ? <PinOff size={15}/> : <Pin size={15}/>} {chat.pinned ? 'Desanclar chat' : 'Anclar chat'}</button>
                        <button onClick={(e) => { e.stopPropagation(); onToggleArchiveChat(chat.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Archive size={15}/> Archivar</button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id, e); setOpenMenuId(null); }} className="w-full text-left px-3 py-2.5 text-sm text-[#ff4a4a] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Trash2 size={15}/> Eliminar</button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - ChatGPT Style #171717 */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50 flex flex-col h-full bg-[#171717] overflow-visible md:overflow-hidden ${
          isOpen ? 'translate-x-0 w-[260px] shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-0 w-[260px]'
        }`}
      >
        {/* Header Options */}
        <div className="p-3 flex items-center justify-between">
          <button 
            className="md:flex hidden text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]"
            onClick={() => setIsOpen(false)}
          >
            <PanelLeftClose size={20} />
          </button>
          
          <button 
            className="md:hidden text-[#B4B4B4] hover:text-white transition-colors p-2"
            onClick={() => setIsOpen(false)}
          >
            <PanelLeftClose size={20} />
          </button>
          
          <div className="flex-1" />
          
          {/* New Chat icon */}
          <button 
            onClick={onNewChat}
            className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]"
            title="Nuevo chat"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Branding inside the sidebar */}
        <div className="px-4 py-2 mt-2 flex items-center justify-center pointer-events-none select-none">
           <div className="w-[60px] h-[60px] rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#333333]">
              <span className="font-poppins font-medium text-2xl text-white tracking-widest pl-[2px]">C7<span className="text-[#FFD000]">.</span></span>
           </div>
        </div>

        {/* Generales / Extras Area */}
        <div className="px-3 mt-5 mb-2 space-y-0.5">
          <button onClick={onShowImageGallery} className="w-full text-left px-3 py-2.5 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors group cursor-pointer">
            <ImageIcon size={16} className="text-[#8E8E8E] group-hover:text-white transition-colors" />
            <span className="text-[14px] font-poppins font-light">Galería de Imágenes</span>
          </button>
          <button onClick={onShowArchivedChats} className="w-full text-left px-3 py-2.5 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors group cursor-pointer">
            <Archive size={16} className="text-[#8E8E8E] group-hover:text-white transition-colors" />
            <span className="text-[14px] font-poppins font-light">Chats Archivados</span>
          </button>
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {renderChatList(pinnedChats, 'Anclados')}
          {renderChatList(recentChats, 'Recientes')}
        </div>

        {/* User Profile Area at the bottom of Sidebar */}
        <div className="p-3 mt-auto border-t border-[#333333] bg-[#171717]">
          {user ? (
            <div className="flex items-center justify-between w-full px-3 py-[8px] bg-[#212121] rounded-lg border border-[#333]">
               <span className="truncate pr-2 font-poppins text-xs text-[#ECECEC]" title={user.email}>{user.email}</span>
               <button onClick={logout} className="text-[#8E8E8E] hover:text-[#ff4a4a] transition-colors p-1" title="Cerrar sesión">
                 <LogOut size={16} />
               </button>
            </div>
          ) : (
            <button 
              onClick={onShowLogin} 
              className="w-full flex items-center justify-center bg-[#FFD000] text-black font-semibold py-[10px] rounded-lg hover:bg-[#E6BC00] transition-colors font-poppins text-sm shadow-sm"
            >
              Identificarse / Guardar
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
