import React, { useState, useEffect } from 'react';
import { X, User, Settings as SettingsIcon, ShieldAlert, Camera } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SettingsModal = ({ isOpen, onClose, user, onClearAllChats }) => {
  const [activeTab, setActiveTab] = useState('profile');
  
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
      onClose(); // Auto close on successful save to mimic fluidity
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

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#212121] w-full max-w-[800px] rounded-xl shadow-2xl border border-[#333] flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[600px]">
        
        {/* Left Sidebar (Configuración) */}
        <div className="w-full md:w-[260px] bg-[#171717] border-r border-[#333] flex flex-col">
           <div className="p-5 border-b border-[#333] md:border-transparent flex justify-between items-center md:block">
              <h2 className="text-white font-poppins font-semibold text-base">Configuración</h2>
              <button onClick={onClose} className="md:hidden text-[#8E8E8E] hover:text-white"><X size={20}/></button>
           </div>
           <div className="p-3 space-y-1 flex-1 mt-2">
             <button 
               onClick={() => setActiveTab('profile')}
               className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 font-poppins text-[14px] transition-colors ${activeTab === 'profile' ? 'bg-[#333] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'}`}
             >
               <User size={16} /> Perfil
             </button>
             <button 
               onClick={() => setActiveTab('general')}
               className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 font-poppins text-[14px] transition-colors ${activeTab === 'general' ? 'bg-[#333] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'}`}
             >
               <SettingsIcon size={16} /> Controles de datos
             </button>
           </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-[#212121] flex flex-col relative overflow-y-auto">
           <div className="absolute top-4 right-4 hidden md:block">
              <button onClick={onClose} className="text-[#8E8E8E] hover:text-white bg-[#333]/50 p-2 rounded-lg hover:bg-[#333] transition-colors">
                 <X size={18} />
              </button>
           </div>

           {activeTab === 'profile' && (
             <div className="p-6 md:p-10 animate-fade-in-up">
               <h3 className="text-xl text-white font-poppins font-medium mb-8">Tu perfil</h3>
               
               <form onSubmit={handleSaveProfile} className="space-y-7 max-w-lg">
                 <div className="flex items-start gap-4 pb-2">
                    <img src={getAvatarFallback()} alt="Avatar" className="w-16 h-16 rounded-full border border-[#444] object-cover bg-[#171717]" />
                    <div className="flex-1">
                       <label className="text-[13px] text-[#A0A0A0] font-poppins block mb-2">Enlace de foto de perfil (URL)</label>
                       <div className="relative">
                          <input 
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] font-poppins transition-colors pl-9"
                            placeholder="https://..."
                          />
                          <Camera size={16} className="absolute left-3 top-3 text-[#8E8E8E]" />
                       </div>
                       <p className="text-[11px] text-[#8E8E8E] mt-2">Deja en blanco para generar un avatar con tus iniciales.</p>
                    </div>
                 </div>

                 <div className="space-y-6 pt-6 border-t border-[#333]">
                   <div>
                     <label className="text-[13px] text-[#A0A0A0] font-poppins block mb-2">Nombre de visualización</label>
                     <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] font-poppins transition-colors"
                        required
                     />
                   </div>
                   <div>
                     <label className="text-[13px] text-[#A0A0A0] font-poppins block mb-2">Edad</label>
                     <input 
                        type="number"
                        value={age}
                        min="1"
                        max="120"
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2.5 text-[14px] text-[#ECECEC] outline-none focus:border-[#444] font-poppins transition-colors"
                        required
                     />
                   </div>
                 </div>

                 <div className="pt-2">
                   <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#333] hover:bg-[#444] border border-[#444] text-[#ECECEC] px-4 py-2 rounded-lg font-poppins text-[14px] font-medium transition-colors disabled:opacity-50"
                   >
                      {isSaving ? 'Guardando...' : 'Guardar perfil'}
                   </button>
                 </div>
               </form>
             </div>
           )}

           {activeTab === 'general' && (
             <div className="p-6 md:p-10 animate-fade-in-up">
               <h3 className="text-xl text-white font-poppins font-medium mb-8">Controles de datos</h3>
               
               <div className="border border-[#ff4a4a]/20 bg-[#1A1A1A] rounded-xl p-5">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#ff4a4a]/10 flex items-center justify-center flex-shrink-0 mt-1">
                       <ShieldAlert size={20} className="text-[#ff4a4a]" />
                     </div>
                     <div>
                       <h4 className="text-[#ECECEC] font-poppins font-medium text-[15px] mb-2">Eliminar todos los chats</h4>
                       <p className="text-[#A0A0A0] text-[13px] font-poppins mb-5 max-w-md">
                         Esta acción eliminará de forma permanente todas tus conversaciones, incluyendo chats fijados y archivados. No se puede deshacer.
                       </p>
                       <button 
                         onClick={onClearAllChats}
                         className="bg-[#ff4a4a] hover:bg-[#ff3333] text-white px-4 py-2 rounded-lg font-poppins text-[14px] font-medium transition-colors shadow-sm"
                       >
                         Eliminar definitivamente
                       </button>
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
