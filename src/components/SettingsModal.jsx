import React, { useState, useEffect, useRef } from 'react';
import { X, Settings as SettingsIcon, Bell, Palette, LayoutGrid, Database, Key, Users, User, ShieldAlert, Play, ChevronDown, Camera, AlertTriangle, Check } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SettingDropdown = ({ value, options, onChange, renderOption, align = 'right' }) => {
   const [open, setOpen] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
     const handleClickOutside = (event) => {
       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         setOpen(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const selectedOpt = options.find(o => o.value === value) || options[0];

   return (
      <div className="relative" ref={dropdownRef}>
         <div onClick={() => setOpen(!open)} className="cursor-pointer hover:text-white group flex items-center gap-2">
            {renderOption ? renderOption(selectedOpt, true) : <span className="text-[14px] text-[#ECECEC]">{selectedOpt.label}</span>}
            <ChevronDown size={14} className="text-[#8E8E8E] group-hover:text-white" />
         </div>
         {open && (
            <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-64 bg-[#2F2F2F] border border-[#444] rounded-xl shadow-2xl py-1.5 z-[500] max-h-64 overflow-y-auto`}>
               {options.map(opt => (
                  <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#3F3F3F] transition-colors ${value === opt.value ? 'bg-[#3F3F3F]' : ''}`}>
                     {renderOption ? renderOption(opt, false) : <span className="text-[#ECECEC] text-[14px]">{opt.label}</span>}
                     {value === opt.value && <Check size={16} className="text-white"/>}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} className={`w-10 h-[22px] flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 flex-shrink-0 ${checked ? 'bg-[#10A37F]' : 'bg-[#444]'}`}>
     <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
  </div>
);

const SettingsModal = ({ isOpen, onClose, user, onClearAllChats }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showMfaAlert, setShowMfaAlert] = useState(true);

  // Deep UI States for General Tab
  const [aspecto, setAspecto] = useState('Sistema');
  const [colorAcento, setColorAcento] = useState('Predeterminada');
  const [idioma, setIdioma] = useState('Automático');
  const [idiomaHablado, setIdiomaHablado] = useState('Automático');
  const [voz, setVoz] = useState('Ember');
  const [separarVoz, setSepararVoz] = useState(false);

  // Deep UI States for Notificaciones Tab
  const [notifResp, setNotifResp] = useState('Push');
  const [notifChats, setNotifChats] = useState('Push');
  const [notifTareas, setNotifTareas] = useState('Push, correo electrónico');
  const [notifProyectos, setNotifProyectos] = useState('Correo electrónico');
  const [notifRecs, setNotifRecs] = useState('Push, correo electrónico');
  const [notifUso, setNotifUso] = useState('Push, correo electrónico');

  // Deep UI States for Perfil
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
      onClose();
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

  /* Data sets */
  const aspectoList = [{value:'Sistema', label:'Sistema'}, {value:'Oscuro', label:'Oscuro'}, {value:'Claro', label:'Claro'}];
  const colorList = [
    {value:'Predeterminada', label:'Predeterminada', color:'#8E8E8E'}, 
    {value:'Azul', label:'Azul', color:'#2b8aff'}, 
    {value:'Verde', label:'Verde', color:'#10a37f'}, 
    {value:'Amarillo', label:'Amarillo', color:'#f5b502'}, 
    {value:'Rosa', label:'Rosa', color:'#e91e63'}, 
    {value:'Naranja', label:'Naranja', color:'#ff9800'}
  ];
  const colorRenderer = (opt) => (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }}></div>
      <span className="text-[14px] text-[#ECECEC]">{opt.label}</span>
    </div>
  );

  const idmList = [
    {value:'Automático', label:'Automático'}, {value:'español (Latinoamérica)', label:'español (Latinoamérica)'}, 
    {value:'English (US)', label:'English (US)'}, {value:'Deutsch', label:'Deutsch'}, 
    {value:'Français', label:'Français'}, {value:'Italiano', label:'Italiano'}
  ];
  
  const idmHabladoList = [
    {value:'Automático', label:'Automático'}, {value:'Arabic', label:'Arabic'}, {value:'Bosnian', label:'Bosnian'}, {value:'Bulgarian', label:'Bulgarian'}, {value:'Catalan', label:'Catalan'}, {value:'Chinese', label:'Chinese'}, {value:'English', label:'English'}
  ];

  const vozList = [{value:'Ember', label:'Ember'}, {value:'Cove', label:'Cove'}, {value:'Breeze', label:'Breeze'}, {value:'Juniper', label:'Juniper'}, {value:'Sky', label:'Sky'}];

  const pushListGrp1 = [{value:'Push', label:'Push'}, {value:'Desactivado', label:'Desactivado'}];
  const pushListGrp2 = [{value:'Push, correo electrónico', label:'Push, correo electrónico'}, {value:'Push', label:'Push'}, {value:'Correo electrónico', label:'Correo electrónico'}, {value:'Desactivado', label:'Desactivado'}];
  
  const handleWrapperClick = (e) => {
    if (e.target.id === 'settings-modal-wrapper') {
      onClose();
    }
  };

  return (
    <div id="settings-modal-wrapper" onClick={handleWrapperClick} className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#212121] w-full max-w-[850px] rounded-2xl shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[650px] font-poppins border border-[#333]/50">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[250px] bg-[#212121] flex flex-col items-start px-2 py-3 overflow-y-auto shrink-0 border-r border-transparent md:border-[#333]/30">
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
        <div className="flex-1 bg-[#212121] flex flex-col overflow-y-auto px-6 md:px-10 py-4 md:py-10 rounded-r-2xl">
           
           {activeTab === 'general' && (
             <div className="w-full max-w-2xl animate-fade-in-up pb-10">
               <h3 className="text-[17px] text-white font-medium mb-6">General</h3>
               
               {showMfaAlert && (
                 <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 relative mb-8">
                   <button onClick={() => setShowMfaAlert(false)} className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors cursor-pointer">
                     <X size={16}/>
                   </button>
                   <ShieldAlert size={22} className="text-[#ECECEC] mb-3" />
                   <h4 className="text-white font-semibold text-[15px] mb-2">Protege tu cuenta</h4>
                   <p className="text-[#ECECEC] text-[13.5px] mb-4 leading-relaxed font-normal">Agrega autenticación multifactor (MFA), como una passkey o un mensaje de texto, para ayudar a proteger tu cuenta al iniciar sesión.</p>
                   <button className="px-4 py-2 rounded-full border border-[#444] text-[#ECECEC] text-[13px] font-medium hover:bg-[#333] transition-colors cursor-pointer">
                     Configurar MFA
                   </button>
                 </div>
               )}

               <div className="flex flex-col">
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Aspecto</span>
                    <SettingDropdown value={aspecto} options={aspectoList} onChange={setAspecto} />
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Color de acento</span>
                    <SettingDropdown value={colorAcento} options={colorList} onChange={setColorAcento} renderOption={colorRenderer} />
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Idioma</span>
                    <SettingDropdown value={idioma} options={idmList} onChange={setIdioma} />
                 </div>
                 
                 <div className="flex justify-between items-start py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Idioma hablado</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Para obtener mejores resultados, selecciona el idioma principal. Si no está incluido, podría estar disponible a través de la detección automática.</span>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <SettingDropdown value={idiomaHablado} options={idmHabladoList} onChange={setIdiomaHablado} />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Voz</span>
                    <div className="flex items-center gap-4">
                       <button className="flex items-center gap-2 px-3 py-1.5 bg-[#333] rounded-full text-[#ECECEC] hover:text-white text-[13px] hover:bg-[#444] transition-colors font-medium">
                         <Play size={12} fill="currentColor" /> Reproducir
                       </button>
                       <SettingDropdown value={voz} options={vozList} onChange={setVoz} />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Separar Voz</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Mantén ChatGPT Voice en una pantalla completa independiente, sin transcripciones ni elementos visuales en tiempo real.</span>
                    </div>
                    <Toggle checked={separarVoz} onChange={() => setSepararVoz(!separarVoz)} />
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'notificaciones' && (
             <div className="w-full max-w-2xl animate-fade-in-up pb-10">
               <h3 className="text-[17px] text-white font-medium mb-6">Notificaciones</h3>
               
               <div className="flex flex-col">
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Respuestas</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Recibe notificaciones cuando ChatGPT responda a solicitudes que tomen tiempo, como investigaciones o generación de imágenes.</span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifResp} options={pushListGrp1} onChange={setNotifResp} /></div>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Chats grupales</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Recibirás notificaciones de los nuevos mensajes de los chats en grupo.</span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifChats} options={pushListGrp1} onChange={setNotifChats} /></div>
                 </div>

                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Tareas</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Recibe una notificación cuando haya actualizaciones de las tareas que creaste.<br/><span className="underline cursor-pointer hover:text-white transition-colors">Administrar tareas</span></span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifTareas} options={pushListGrp2} onChange={setNotifTareas} /></div>
                 </div>

                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Projects</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Recibe una notificación cuando te llegue una invitación por correo electrónico a un proyecto compartido.</span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifProyectos} options={pushListGrp2} onChange={setNotifProyectos} /></div>
                 </div>

                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Recomendaciones</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Mantente al tanto de las nuevas herramientas, consejos y características de ChatGPT.</span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifRecs} options={pushListGrp2} onChange={setNotifRecs} /></div>
                 </div>

                 <div className="flex justify-between items-center py-4 border-b border-[#333]/50 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#ECECEC] text-[14px] font-medium">Uso</span>
                      <span className="text-[#A0A0A0] text-[12.5px] leading-relaxed">Te avisaremos cuando se restablezcan los límites de funciones como la creación de imágenes.</span>
                    </div>
                    <div className="shrink-0"><SettingDropdown value={notifUso} options={pushListGrp2} onChange={setNotifUso} /></div>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'cuenta' && (
             <div className="w-full max-w-2xl animate-fade-in-up pb-10">
               <h3 className="text-[17px] text-white font-medium mb-6">Cuenta y Perfil</h3>
               
               <form onSubmit={handleSaveProfile} className="space-y-7 border border-[#333] bg-[#1A1A1A] p-6 rounded-xl">
                 <div className="flex items-start gap-4 pb-2">
                    <img src={getAvatarFallback()} alt="Avatar" className="w-16 h-16 rounded-full border border-[#444] object-cover bg-[#212121]" />
                    <div className="flex-1">
                       <label className="text-[13px] text-[#ECECEC] block mb-2 font-medium">Enlace de foto de perfil (URL)</label>
                       <div className="relative">
                          <input 
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full bg-[#212121] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] transition-colors pl-9"
                            placeholder="https://..."
                          />
                          <Camera size={16} className="absolute left-3 top-3.5 text-[#8E8E8E]" />
                       </div>
                       <p className="text-[11.5px] text-[#A0A0A0] mt-2">Deja en blanco para generar tu avatar con tus iniciales.</p>
                    </div>
                 </div>

                 <div className="space-y-5 pt-4 border-t border-[#333]">
                   <div>
                     <label className="text-[13px] text-[#ECECEC] block mb-2 font-medium">Nombre de visualización</label>
                     <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#212121] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] transition-colors"
                        required
                     />
                   </div>
                   <div>
                     <label className="text-[13px] text-[#ECECEC] block mb-2 font-medium">Edad</label>
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
                      className="w-full bg-[#10A37F] hover:bg-[#0E906F] text-white px-4 py-2.5 rounded-lg font-medium text-[14px] transition-colors disabled:opacity-50"
                   >
                      {isSaving ? 'Guardando...' : 'Guardar perfil'}
                   </button>
                 </div>
               </form>
             </div>
           )}

           {activeTab === 'controles' && (
             <div className="w-full max-w-2xl animate-fade-in-up pb-10">
               <h3 className="text-[17px] text-white font-medium mb-6">Controles de datos</h3>
               
               <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                 <div className="flex flex-col">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Exportar datos</span>
                    <span className="text-[#A0A0A0] text-[12.5px] max-w-[85%] mt-1">Obtén una copia del historial de tus chats en formato descargable.</span>
                 </div>
                 <button className="px-4 py-1.5 rounded-full border border-[#444] text-[#ECECEC] text-[13px] font-medium hover:bg-[#333] transition-colors">
                   Exportar
                 </button>
               </div>

               <div className="flex justify-between items-center py-4 border-b border-[#333]/50">
                 <div className="flex flex-col">
                    <span className="text-[#ECECEC] text-[14px] font-medium">Eliminar todos los chats</span>
                    <span className="text-[#A0A0A0] text-[12.5px] max-w-[85%] mt-1">Esta acción no se puede deshacer y eliminará definitivamente tus hilos alojados.</span>
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

           {['personalizacion', 'aplicaciones', 'seguridad', 'parental'].includes(activeTab) && (
             <div className="w-full max-w-2xl animate-fade-in-up pb-10">
               <h3 className="text-[17px] text-white font-medium mb-6 capitalize">{activeTab}</h3>
               
               <div className="border border-[#ff4a4a]/20 bg-[#1A1A1A] rounded-xl p-5">
                  <div className="flex gap-4 items-start">
                     <AlertTriangle size={20} className="text-[#FFD000] shrink-0 mt-0.5" />
                     <div>
                       <h4 className="text-[#ECECEC] font-medium text-[15px] mb-2">Sección en desarrollo paralelo</h4>
                       <p className="text-[#A0A0A0] text-[13px] leading-relaxed">
                         El panel superior para <b>{activeTab}</b> forma parte del clonado visual estricto para C7 Studio, la arquitectura subyacente interactiva estará conectada en fases posteriores.
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
