import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Image as ImageIcon, Info, Activity, Monitor, Database, Shield, Blocks, Cpu, User } from 'lucide-react';

const UpgradePlanModal = ({ isOpen, onClose }) => {
  const [toggleMode, setToggleMode] = useState('Personal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#212121] z-[300] flex flex-col items-center overflow-y-auto font-poppins px-4 py-8 animate-fade-in-up">
      <div className="w-full max-w-[1100px] flex justify-end mb-4">
        <button onClick={onClose} className="p-2 text-[#ECECEC] hover:bg-[#333] rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-[1100px] flex flex-col items-center">
        <h2 className="text-3xl font-semibold text-white mb-6">Mejora tu plan</h2>

        {/* Toggle Personal / Empresa */}
        <div className="bg-[#1A1A1A] p-1 rounded-full flex gap-1 mb-12 border border-[#333]">
          <button 
            onClick={() => setToggleMode('Personal')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${toggleMode === 'Personal' ? 'bg-[#333] text-white' : 'text-[#8E8E8E] hover:text-white'}`}
          >
            Personal
          </button>
          <button 
            onClick={() => setToggleMode('Empresa')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${toggleMode === 'Empresa' ? 'bg-[#333] text-white' : 'text-[#8E8E8E] hover:text-white'}`}
          >
            Empresa
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          {/* Card: Gratis */}
          <div className="bg-[#171717] border border-[#333] rounded-2xl p-6 flex flex-col relative">
            <h3 className="text-2xl font-semibold text-white mb-1">Gratis</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-white leading-none">$0</span>
              <span className="text-xs text-[#A0A0A0] pb-1">MXN /<br/>mes</span>
            </div>
            <p className="text-[13px] text-[#ECECEC] mb-6 min-h-[40px]">Descubre las posibilidades de la IA</p>
            
            <button className="w-full py-3 rounded-full bg-[#2F2F2F] text-[#8E8E8E] text-[15px] font-medium mb-8 cursor-not-allowed">
              Tu plan actual
            </button>

            <div className="space-y-4 flex-1">
              <div className="flex gap-3 items-start">
                <Sparkles size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#A0A0A0] leading-tight">Explicaciones sencillas</span>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-4 h-4 rounded-full border border-[#ECECEC] mt-0.5 flex-shrink-0"></div>
                <span className="text-[13px] text-[#A0A0A0] leading-tight">Chats breves para preguntas comunes</span>
              </div>
              <div className="flex gap-3 items-start">
                <ImageIcon size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#A0A0A0] leading-tight">Prueba la generación de imágenes</span>
              </div>
              <div className="flex gap-3 items-start">
                <Info size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#A0A0A0] leading-tight">Almacenamiento de memoria y contexto limitados</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#333] text-[11px] text-[#8E8E8E]">
              ¿Ya tienes un plan? Consulta ayuda con la facturación
            </div>
          </div>

          {/* Card: Go */}
          <div className="bg-[#171717] border border-[#333] rounded-2xl p-6 flex flex-col relative">
            <h3 className="text-2xl font-semibold text-white mb-1">Go</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-white leading-none">$110</span>
              <span className="text-xs text-[#A0A0A0] pb-1">MXN /<br/>mes</span>
            </div>
            <p className="text-[13px] text-[#ECECEC] mb-6 min-h-[40px]">Sigue chateando con acceso ampliado</p>
            
            <button className="w-full py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-[15px] font-medium mb-8">
              Cambiar a Go
            </button>

            <div className="space-y-4 flex-1">
              <div className="flex gap-3 items-start">
                <Sparkles size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Explora temas a fondo</span>
              </div>
              <div className="flex gap-3 items-start">
                <MessageSquare size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Chatea más tiempo y carga más contenido</span>
              </div>
              <div className="flex gap-3 items-start">
                <ImageIcon size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Crea más imágenes para tus proyectos</span>
              </div>
              <div className="flex gap-3 items-start">
                <Database size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Obtén más memoria para respuestas más inteligentes</span>
              </div>
              <div className="flex gap-3 items-start">
                <Activity size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Explora proyectos, tareas y GPT personalizados</span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-[#333] text-[11px] text-[#8E8E8E]">
              Este plan puede incluir anuncios. Obtener más información
            </div>
          </div>

          {/* Card: Plus */}
          <div className="bg-[#24213B] border border-[#6B5A9F] rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <span className="absolute top-4 right-4 bg-[#6B5A9F] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white">Popular</span>
            <h3 className="text-2xl font-semibold text-white mb-1">Plus</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-white leading-none">$399</span>
              <span className="text-xs text-[#A0A0A0] pb-1">MXN /<br/>mes</span>
            </div>
            <p className="text-[13px] text-[#ECECEC] mb-6 min-h-[40px]">Desbloquea todas las posibilidades</p>
            
            <button className="w-full py-3 rounded-full bg-[#5D5CFF] hover:bg-[#4C4BFF] text-white transition-colors text-[15px] font-medium mb-8">
              Cambiar a Plus
            </button>

            <div className="space-y-4 flex-1">
              <div className="flex gap-3 items-start">
                <Sparkles size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Resuelve problemas complejos</span>
              </div>
              <div className="flex gap-3 items-start">
                <Monitor size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Conversaciones largas en varias sesiones</span>
              </div>
              <div className="flex gap-3 items-start">
                <ImageIcon size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Crea más imágenes, más rápido</span>
              </div>
              <div className="flex gap-3 items-start">
                <Database size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Recuerda los objetivos y las conversaciones pasadas</span>
              </div>
              <div className="flex gap-3 items-start">
                <Blocks size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Organiza proyectos y GPT personalizados</span>
              </div>
               <div className="flex gap-3 items-start">
                <Cpu size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Escribe código y crea aplicaciones avanzadas</span>
              </div>
            </div>
          </div>

          {/* Card: Pro */}
          <div className="bg-[#171717] border border-[#333] rounded-2xl p-6 flex flex-col relative">
            <h3 className="text-2xl font-semibold text-white mb-1">Pro</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-white leading-none">$3,999</span>
              <span className="text-xs text-[#A0A0A0] pb-1">MXN /<br/>mes</span>
            </div>
            <p className="text-[13px] text-[#ECECEC] mb-6 min-h-[40px]">Maximiza tu productividad</p>
            
            <button className="w-full py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-[15px] font-medium mb-8">
              Cambiar a Pro
            </button>

            <div className="space-y-4 flex-1">
              <div className="flex gap-3 items-start">
                <Sparkles size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Domina tareas y temas avanzados</span>
              </div>
              <div className="flex gap-3 items-start">
                <User size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Aborda proyectos grandes con chat ilimitado</span>
              </div>
              <div className="flex gap-3 items-start">
                <ImageIcon size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Crea imágenes de alta calidad a cualquier escala</span>
              </div>
              <div className="flex gap-3 items-start">
                <Shield size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Realiza investigaciones y tareas privadas</span>
              </div>
              <div className="flex gap-3 items-start">
                <Code size={16} className="text-[#ECECEC] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#ECECEC] leading-tight">Supera tus límites usando funciones en beta</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#333] text-[11px] text-[#A0A0A0] underline hover:text-white cursor-pointer transition-colors">
              Obtener más información
            </div>
          </div>
          
        </div>

        <p className="mt-12 text-[#A0A0A0] text-[13px] flex items-center justify-center gap-2">
          <Users size={16} /> ¿Necesitas más funcionalidades para tu empresa? <span className="text-white underline cursor-pointer">Consulta C7 Enterprise</span>
        </p>

      </div>
    </div>
  );
};

// Polishing import code bug fallback
import { Code, Users } from 'lucide-react';

export default UpgradePlanModal;
