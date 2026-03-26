import React from 'react';
import { Plus, MessageSquare, Menu, PanelLeftClose } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const chatHistory = [
    "Estrategia de Contenidos",
    "Ideas para Reels",
    "Copy para Facebook Ads",
    "Guion YouTube",
  ];

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
        className={`fixed md:relative inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-[260px] bg-[#171717] flex flex-col h-full`}
      >
        {/* Header Options */}
        <div className="p-3 flex items-center justify-between">
          {/* Collapse button typical in ChatGPT top left */}
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
          
          {/* New Chat icon on right of sidebar header */}
          <button className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]">
            <Plus size={20} />
          </button>
        </div>

        {/* Branding inside the sidebar to satisfy instructions */}
        <div className="px-4 py-2 mt-2">
          <h1 className="font-anton text-2xl tracking-wide text-white uppercase flex items-baseline">
            CALLE 7 STUDIO<span className="text-[#FFD000] ml-[2px] text-2xl leading-none">.</span>
          </h1>
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto px-3 mt-6">
          <div className="text-xs text-[#8E8E8E] font-poppins font-medium mb-3 px-2">Hoy</div>
          <div className="space-y-[2px]">
            {chatHistory.map((chat, idx) => (
              <button 
                key={idx}
                className="w-full text-left px-3 py-2 rounded-lg text-[#ECECEC] hover:bg-[#202123] transition-colors duration-200 flex items-center gap-3 overflow-hidden"
              >
                <div className="truncate text-[14px] font-poppins">{chat}</div>
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Sidebar;
