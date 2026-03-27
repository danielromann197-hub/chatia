import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, PanelLeftClose, Trash2, LogOut, MoreHorizontal, Share, Users, Edit2, Pin, PinOff, Archive, Image as ImageIcon, Search, Folder, Sparkles, Wand2, HelpCircle, Edit3, Plus, Settings } from 'lucide-react';
import { logout } from '../firebase';

const Sidebar = ({ isOpen, setIsOpen, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, onTogglePinChat, onToggleArchiveChat, onShowImageGallery, onShowArchivedChats, user, onShowLogin, onShowSettings, onShowUpgradePlan }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (!event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeChats = Array.isArray(chats) ? chats : [];
  const activeChats = safeChats.filter(c => c && !c.archived);
  const pinnedChats = activeChats.filter(c => c.pinned);
  const recentChats = activeChats.filter(c => !c.pinned);

  const enforceAuth = (e, callback) => {
    if (e) e.stopPropagation();
    if (!user) {
      if (onShowLogin) onShowLogin();
      setOpenMenuId(null);
      return;
    }
    callback();
  };

  const startRename = (chat, e) => {
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

  const handleShare = () => {
    alert("Enlace copiado al portapapeles.");
    setOpenMenuId(null);
  };

  const handleGroup = () => {
    alert("Próximamente: Funcionalidad de chats grupales.");
    setOpenMenuId(null);
  };

  const renderChatList = (chatList, title) => {
    if (chatList.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="text-[12px] text-[#A0A0A0] font-poppins font-medium mb-1 px-3">{title}</div>
        <div className="space-y-0.5">
          {chatList.map(chat => {
            const isActive = chat.id === currentChatId;
            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between group cursor-pointer relative ${
                  isActive ? 'bg-[#212121] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  {editingChatId === chat.id ? (
                    <input 
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={e => e.key === 'Enter' && submitRename()}
                      className="bg-[#1A1A1A] text-white border border-[#FFD000] rounded px-2 py-0.5 text-[14px] w-full outline-none font-poppins"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate text-[14px] font-poppins font-light leading-tight pt-0.5 pr-2">
                      {chat.title}
                    </span>
                  )}
                </div>

                {!editingChatId || editingChatId !== chat.id ? (
                  <div className="relative flex-shrink-0" ref={openMenuId === chat.id ? menuRef : null}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === chat.id ? null : chat.id); }}
                      className={`text-[#8E8E8E] hover:text-white p-1 rounded-md transition-opacity ${openMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {openMenuId === chat.id && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-56 bg-[#2F2F2F] border border-[#444] rounded-xl shadow-2xl py-1.5 z-[100] animate-fade-in-up">
                        <button onClick={(e) => enforceAuth(e, handleShare)} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Share size={15}/> Compartir</button>
                        <button onClick={(e) => enforceAuth(e, handleGroup)} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Users size={15}/> Iniciar un chat grupal</button>
                        <button onClick={(e) => enforceAuth(e, () => startRename(chat, e))} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Edit2 size={15}/> Cambiar el nombre</button>
                        <button onClick={(e) => enforceAuth(e, () => { onTogglePinChat(chat.id); setOpenMenuId(null); })} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins">{chat.pinned ? <PinOff size={15}/> : <Pin size={15}/>} {chat.pinned ? 'Desanclar chat' : 'Anclar chat'}</button>
                        <button onClick={(e) => enforceAuth(e, () => { onToggleArchiveChat(chat.id); setOpenMenuId(null); })} className="w-full text-left px-3 py-2.5 text-sm text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Archive size={15}/> Archivar</button>
                        <button onClick={(e) => enforceAuth(e, () => { onDeleteChat(chat.id, e); setOpenMenuId(null); })} className="w-full text-left px-3 py-2.5 text-sm text-[#ff4a4a] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins"><Trash2 size={15}/> Eliminar</button>
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed md:relative inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50 flex flex-col h-full bg-[#171717] overflow-visible md:overflow-hidden ${
          isOpen ? 'translate-x-0 w-[260px] shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-0 w-[260px]'
        }`}
      >
        {/* Header - ChatGPT Style with Logo */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 pointer-events-none select-none px-1">
             <div className="w-7 h-7 rounded-sm bg-[#1A1A1A] flex items-center justify-center border border-[#333333]">
                <span className="font-poppins font-medium text-xs text-white tracking-widest pl-[1px]">C7<span className="text-[#FFD000]">.</span></span>
             </div>
             <span className="text-[#ECECEC] font-poppins font-medium text-[15px]">C7 Studio</span>
          </div>
          
          <button 
            className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]"
            onClick={() => setIsOpen(false)}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* Top Tools Area */}
        <div className="px-3 mb-4 mt-2 space-y-0.5">
          <button onClick={onNewChat} className="w-full text-left px-3 py-2 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors">
            <Edit3 size={18} className="text-[#ECECEC]" /> 
            <span className="text-[14px] font-poppins">Nuevo chat</span>
          </button>
          <button onClick={(e) => enforceAuth(e, () => alert('Buscador de chats próximo a integrarse'))} className="w-full text-left px-3 py-2 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors">
            <Search size={18} className="text-[#ECECEC]" /> 
            <span className="text-[14px] font-poppins">Buscar chats</span>
          </button>
          <button onClick={(e) => enforceAuth(e, onShowImageGallery)} className="w-full text-left px-3 py-2 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors">
            <Folder size={18} className="text-[#ECECEC]" /> 
            <span className="text-[14px] font-poppins">Galería visual</span>
          </button>
          <button onClick={(e) => enforceAuth(e, onShowArchivedChats)} className="w-full text-left px-3 py-2 rounded-lg text-[#ECECEC] hover:bg-[#202123] flex items-center gap-3 transition-colors">
            <MoreHorizontal size={18} className="text-[#ECECEC]" /> 
            <span className="text-[14px] font-poppins">Más archivados</span>
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {renderChatList(pinnedChats, 'Anclados')}
          {renderChatList(recentChats, 'Tus chats')}
        </div>

        {/* User Profile Area (ChatGPT 1:1 format) */}
        <div className="px-3 pb-3 mt-auto bg-[#171717] profile-menu-container relative">
          {user ? (
            <>
              {showProfileMenu && (
                <div className="absolute bottom-[calc(100%)] left-3 w-[calc(100%-24px)] mb-1 bg-[#2F2F2F] border border-[#444] rounded-2xl shadow-2xl py-2 z-[100] animate-fade-in-up flex flex-col">
                  
                  <div className="px-3 py-2 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#444] flex items-center justify-center flex-shrink-0 font-medium text-xs text-[#ECECEC] uppercase">
                       {user.displayName ? user.displayName.substring(0,2) : 'US'}
                     </div>
                     <div className="flex flex-col">
                       <span className="font-poppins font-semibold text-[13px] text-[#ECECEC] leading-none mb-1">{user.displayName || 'Usuario C7'}</span>
                       <span className="font-poppins text-[11px] text-[#8E8E8E] leading-none">Gratis</span>
                     </div>
                  </div>

                  <div className="h-px bg-[#444] my-1 mx-3"></div>

                  <button className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <Plus size={16} className="text-[#A0A0A0]"/> Agregar otra cuenta
                  </button>
                  <button onClick={(e) => enforceAuth(e, () => { setShowProfileMenu(false); onShowUpgradePlan(); })} className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <Sparkles size={16} className="text-[#A0A0A0]"/> Mejorar el plan
                  </button>
                  <button className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <Wand2 size={16} className="text-[#A0A0A0]"/> Personalización
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); onShowSettings(); }} className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <User size={16} className="text-[#A0A0A0]"/> Perfil
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); onShowSettings(); }} className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <Settings size={16} className="text-[#A0A0A0]"/> Configuración
                  </button>

                  <div className="h-px bg-[#444] my-1 mx-3"></div>

                  <button className="w-full text-left px-3 py-2.5 text-[13px] text-[#ECECEC] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <HelpCircle size={16} className="text-[#A0A0A0]"/> Ayuda
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full text-left px-3 py-2.5 text-[13px] text-[#ff4a4a] hover:bg-[#3F3F3F] flex items-center gap-3 font-poppins transition-colors">
                     <LogOut size={16} className="text-[#A0A0A0]"/> Cerrar sesión
                  </button>
                </div>
              )}
              
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-between w-full p-2 hover:bg-[#202123] rounded-lg transition-colors cursor-pointer group"
              >
                 <div className="flex items-center gap-2 overflow-hidden">
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'U')}`} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full bg-black object-cover flex-shrink-0 border border-[#333]" 
                    />
                    <div className="flex flex-col overflow-hidden">
                       <span className="truncate font-poppins font-medium text-[13px] text-[#ECECEC] leading-none mb-0.5">{user.displayName || 'Usuario C7'}</span>
                       <span className="truncate font-poppins text-[10px] text-[#8E8E8E] leading-none">Gratis</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 px-1">
                   <span 
                     onClick={(e) => enforceAuth(e, onShowUpgradePlan)}
                     className="px-2 py-1 bg-[#2F2F2F] text-[10px] text-[#ECECEC] rounded-full font-poppins font-medium whitespace-nowrap hidden lg:block group-hover:bg-[#3F3F3F] transition-colors border border-[#444]"
                   >
                     Mejorar el plan
                   </span>
                 </div>
              </div>
            </>
          ) : (
            <button 
              onClick={onShowLogin} 
              className="w-full flex items-center justify-center bg-[#FFD000] text-black font-semibold py-[10px] rounded-xl hover:bg-[#E6BC00] transition-colors font-poppins text-sm shadow-sm"
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
