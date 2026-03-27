import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Bell, Palette, LayoutGrid, Database, Key, Users, User, ShieldAlert, Play, ChevronDown, Camera, AlertTriangle } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SettingsModal = ({ isOpen, onClose, user, onClearAllChats }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showMfaAlert, setShowMfaAlert] = useState(true);

  // Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
         if (docSnap.exists() && docSnap.data().age) {
            setAge(docSnap.data().age.toString());
         }
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: name.trim(),
          photoURL: photoURL.trim()
        });
      }
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        age: parseInt(age, 10), 
        displayName: name.trim() 
      }, { merge: true });
      onClose(); // Auto close on successful save
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarFallback = () => {
    if (photoURL) return photoURL;
    if (name) return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    return `https://api.dicebear.com/7.x/initials/svg?seed=User`;
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'personalizacion', label: 'Personalización', icon: Palette },
    { id: 'aplicaciones', label: 'Aplicaciones', icon: LayoutGrid },
    { id: 'controles', label: 'Controles de datos', icon: Database },
    { id: 'seguridad', label: 'Seguridad', icon: Key },
    { id: 'parental', label: 'Controles parentales', icon: Users },
    { id: 'cuenta', label: 'Cuenta', icon: User },
  ];

  /* Simulated Settings Row Component */
  const SettingRow = ({ label, value, subtext, hasDot }) => (
    <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
      <div className="flex flex-col">
         <span className="text-[#ECECEC] text-[14px] font-poppins">{label}</span>
         {subtext && <span className="text-[#8E8E8E] text-[12px] max-w-[85%] mt-1.5 leading-snug font-poppins">{subtext}</span>}
      </div>
      <div className="flex items-center gap-2 text-[#ECECEC] cursor-pointer hover:text-white group">
         {hasDot && <div className="w-2.5 h-2.5 rounded-full bg-[#8E8E8E] group-hover:bg-white transition-colors"></div>}
         <span className="text-[14px] font-poppins">{value}</span>
         <ChevronDown size={16} className="text-[#8E8E8E] group-hover:text-white" />
      </div>
    </div>
  );

  const handleWrapperClick = (e) => {
    if (e.target.id === 'settings-modal-wrapper') {
      onClose();
    }
  };

  return (
    <div id="settings-modal-wrapper" onClick={handleWrapperClick} className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#212121] w-full max-w-[850px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[650px] font-poppins">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[250px] bg-[#212121] flex flex-col items-start px-2 py-3 overflow-y-auto">
           {/* Top Left X Button */}
           <button onClick={onClose} className="p-2 mb-2 ml-1 text-[#8E8E8E] hover:text-white hover:bg-[#333] rounded-lg transition-colors text-left w-fit cursor-pointer">
              <X size={20}/>
           </button>
           
           <div className="w-full space-y-0.5 mt-1 px-1">
             {tabs.map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-[14px] ${
                   activeTab === tab.id ? 'bg-[#333] text-white font-medium' : 'text-[#ECECEC] hover:bg-[#2A2A2A]'
                 }`}
               >
                 <tab.icon size={18} strokeWidth={1.5} className={activeTab === tab.id ? 'text-white' : 'text-[#ECECEC]'} /> 
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-[#212121] flex flex-col overflow-y-auto px-6 md:px-10 py-4 md:py-14">
           
           {activeTab === 'general' && (
             <div className="w-full max-w-2xl animate-fade-in-up">
               <h3 className="text-xl text-white font-medium mb-8">General</h3>
               
               {showMfaAlert && (
                 <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 relative mb-8">
                   <button onClick={() => setShowMfaAlert(false)} className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors">
                     <X size={16}/>
                   </button>
                   <ShieldAlert size={22} className="text-[#ECECEC] mb-3" />
                   <h4 className="text-white font-semibold text-[15px] mb-2">Protege tu cuenta</h4>
                   <p className="text-[#ECECEC] text-[13.5px] mb-4 leading-relaxed font-light">Agrega autenticación multifactor (MFA), como una passkey o un mensaje de texto, para ayudar a proteger tu cuenta al iniciar sesión.</p>
                   <button className="px-4 py-2 rounded-full border border-[#444] text-[#ECECEC] text-[13px] font-medium hover:bg-[#333] transition-colors">
                     Configurar MFA
                   </button>
                 </div>
               )}

               <div className="flex flex-col">
                 <SettingRow label="Aspecto" value="Sistema" />
                 <SettingRow label="Color de acento" value="Predeterminada" hasDot={true} />
                 <SettingRow label="Idioma" value="Automático" />
                 <SettingRow 
                    label="Idioma hablado" 
                    value="Automático" 
                    subtext="Para obtener mejores resultados, selecciona el idioma principal. Si no está incluido, podría estar disponible a través de la detección automática."
                 />
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                    <span className="text-[#ECECEC] text-[14px]">Voz</span>
                    <div className="flex items-center gap-3">
                       <button className="flex items-center gap-2 px-3 py-1.5 bg-[#333] rounded-full text-white text-[13px] hover:bg-[#444] transition-colors">
                         <Play size={12} fill="currentColor" /> Reproducir
                       </button>
                       <div className="flex items-center gap-2 text-[#ECECEC] cursor-pointer hover:text-white group">
                         <span className="text-[14px]">Ember</span>
                         <ChevronDown size={16} className="text-[#8E8E8E] group-hover:text-white" />
                       </div>
                    </div>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'cuenta' && (
             <div className="w-full max-w-2xl animate-fade-in-up">
               <h3 className="text-xl text-white font-medium mb-8">Cuenta y Perfil</h3>
               
               <form onSubmit={handleSaveProfile} className="space-y-7 border border-[#333] bg-[#1A1A1A] p-6 rounded-xl">
                 <div className="flex items-start gap-4 pb-2">
                    <img src={getAvatarFallback()} alt="Avatar" className="w-16 h-16 rounded-full border border-[#444] object-cover bg-[#212121]" />
                    <div className="flex-1">
                       <label className="text-[13px] text-[#A0A0A0] block mb-2">Enlace de foto de perfil (URL)</label>
                       <div className="relative">
                          <input 
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full bg-[#212121] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] transition-colors pl-9"
                            placeholder="https://..."
                          />
                          <Camera size={16} className="absolute left-3 top-3 text-[#8E8E8E]" />
                       </div>
                       <p className="text-[11px] text-[#8E8E8E] mt-2">Deja en blanco para generar tu inicial estéticamente.</p>
                    </div>
                 </div>

                 <div className="space-y-5 pt-4 border-t border-[#333]">
                   <div>
                     <label className="text-[13px] text-[#A0A0A0] block mb-2">Nombre de visualización</label>
                     <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#212121] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] transition-colors"
                        required
                     />
                   </div>
                   <div>
                     <label className="text-[13px] text-[#A0A0A0] block mb-2">Edad</label>
                     <input 
                        type="number"
                        value={age}
                        min="1"
                        max="120"
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-[#212121] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] transition-colors"
                        required
                     />
                   </div>
                 </div>

                 <div className="pt-2">
                   <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-white hover:bg-gray-200 text-black px-4 py-2.5 rounded-lg font-medium text-[14px] transition-colors disabled:opacity-50"
                   >
                      {isSaving ? 'Guardando en la nube...' : 'Guardar perfil e identidad'}
                   </button>
                 </div>
               </form>
             </div>
           )}

           {activeTab === 'controles' && (
             <div className="w-full max-w-2xl animate-fade-in-up">
               <h3 className="text-xl text-white font-medium mb-8">Controles de datos</h3>
               
               <div className="flex justify-between items-center py-4 border-b border-[#333]">
                 <div className="flex flex-col">
                    <span className="text-[#ECECEC] text-[14px]">Exportar datos</span>
                    <span className="text-[#8E8E8E] text-[12px] max-w-[85%] mt-1">Obtén una copia del historial de tus chats en un paquete local descargable (Próximamente).</span>
                 </div>
                 <button className="px-4 py-1.5 rounded-full border border-[#444] text-[#ECECEC] text-[13px] font-medium hover:bg-[#333] transition-colors">
                   Exportar
                 </button>
               </div>

               <div className="flex justify-between items-center py-4 border-b border-[#333]">
                 <div className="flex flex-col">
                    <span className="text-[#ECECEC] text-[14px]">Eliminar todos los chats</span>
                    <span className="text-[#8E8E8E] text-[12px] max-w-[85%] mt-1 border-transparent">No se puede deshacer. C7 Studio no conservará ningún log temporal de seguridad.</span>
                 </div>
                 <button 
                   onClick={onClearAllChats}
                   className="px-4 py-1.5 rounded-full bg-[#ff4a4a] hover:bg-[#ff3333] text-white text-[13px] font-medium transition-colors"
                 >
                   Eliminar
                 </button>
               </div>
             </div>
           )}

           {/* Placeholder for un-accessed tabs mapped to layout */}
           {['notificaciones', 'personalizacion', 'aplicaciones', 'seguridad', 'parental'].includes(activeTab) && (
             <div className="w-full max-w-2xl animate-fade-in-up">
               <h3 className="text-xl text-white font-medium mb-8 capitalize">{activeTab}</h3>
               
               <div className="border border-[#ff4a4a]/20 bg-[#1A1A1A] rounded-xl p-5">
                  <div className="flex gap-4 items-start">
                     <AlertTriangle size={20} className="text-[#FFD000] shrink-0 mt-0.5" />
                     <div>
                       <h4 className="text-[#ECECEC] font-medium text-[15px] mb-2">Sección en desarrollo</h4>
                       <p className="text-[#A0A0A0] text-[13px] leading-relaxed">
                         El panel de configuración de {activeTab} forma parte del ecosistema estructural clonado de ChatGPT, pero las funciones subyacentes se encuentran en proceso de implementación técnica en los sistemas backend de C7. Vuelve pronto.
                       </p>
                     </div>
                  </div>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
