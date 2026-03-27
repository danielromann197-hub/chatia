import React, { useState, useEffect } from 'react';
import { X, User, Settings as SettingsIcon, Trash2, Camera, ShieldAlert } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SettingsModal = ({ isOpen, onClose, user, onClearAllChats }) => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
    setSaveMessage('');
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
      
      setSaveMessage('Perfil actualizado correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Error al guardar el perfil.');
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
      <div className="bg-[#212121] w-full max-w-3xl rounded-xl shadow-2xl border border-[#333] flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[600px]">
        
        {/* Sidebar Settings Tabs */}
        <div className="w-full md:w-64 bg-[#171717] border-r border-[#333] flex flex-col">
           <div className="p-5 border-b border-[#333] flex justify-between items-center md:block">
              <h2 className="text-white font-poppins font-medium">Configuración</h2>
              <button onClick={onClose} className="md:hidden text-[#8E8E8E] hover:text-white"><X size={20}/></button>
           </div>
           <div className="p-3 space-y-1 flex-1">
             <button 
               onClick={() => setActiveTab('profile')}
               className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 font-poppins text-sm transition-colors ${activeTab === 'profile' ? 'bg-[#333] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'}`}
             >
               <User size={16} /> Perfil
             </button>
             <button 
               onClick={() => setActiveTab('general')}
               className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 font-poppins text-sm transition-colors ${activeTab === 'general' ? 'bg-[#333] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'}`}
             >
               <SettingsIcon size={16} /> Controles de datos
             </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#212121] flex flex-col relative overflow-y-auto">
           <div className="absolute top-4 right-4 hidden md:block">
              <button onClick={onClose} className="text-[#8E8E8E] hover:text-white bg-[#333]/50 p-1.5 rounded-lg hover:bg-[#333] transition-colors">
                 <X size={20} />
              </button>
           </div>

           {activeTab === 'profile' && (
             <div className="p-6 md:p-10 animate-fade-in-up">
               <h3 className="text-lg text-white font-poppins font-medium mb-6">Tu perfil</h3>
               
               <form onSubmit={handleSaveProfile} className="space-y-6 max-w-md">
                 <div className="flex items-center gap-5">
                    <img src={getAvatarFallback()} alt="Avatar" className="w-20 h-20 rounded-full border border-[#444] object-cover bg-black" />
                    <div className="flex-1">
                       <label className="text-xs text-[#8E8E8E] font-poppins block mb-1">Enlace de foto de perfil (URL)</label>
                       <div className="relative">
                          <input 
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#ECECEC] outline-none focus:border-[#FFD000] font-poppins transition-colors pl-9"
                            placeholder="https://tufoto.com/foto.jpg"
                          />
                          <Camera size={14} className="absolute left-3 top-2.5 text-[#8E8E8E]" />
                       </div>
                       <p className="text-[10px] text-[#8E8E8E] mt-1 line-clamp-2">Deja en blanco para generar un avatar con tus iniciales.</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-2 border-t border-[#333]">
                   <div>
                     <label className="text-xs text-[#8E8E8E] font-poppins block mb-1">Nombre de visualización</label>
                     <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#ECECEC] outline-none focus:border-[#FFD000] font-poppins transition-colors"
                        required
                     />
                   </div>
                   <div>
                     <label className="text-xs text-[#8E8E8E] font-poppins block mb-1">Edad</label>
                     <input 
                        type="number"
                        value={age}
                        min="1"
                        max="120"
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#ECECEC] outline-none focus:border-[#FFD000] font-poppins transition-colors"
                        required
                     />
                   </div>
                 </div>

                 {saveMessage && (
                   <div className="text-sm font-poppins text-[#FFD000] bg-[#FFD000]/10 border border-[#FFD000]/30 px-3 py-2 rounded-lg">
                     {saveMessage}
                   </div>
                 )}

                 <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#2B2B2B] hover:bg-[#333] border border-[#444] text-white px-5 py-2 rounded-lg font-poppins text-sm transition-colors disabled:opacity-50"
                 >
                    {isSaving ? 'Guardando...' : 'Guardar perfil'}
                 </button>
               </form>
             </div>
           )}

           {activeTab === 'general' && (
             <div className="p-6 md:p-10 animate-fade-in-up">
               <h3 className="text-lg text-white font-poppins font-medium mb-6">Controles de datos</h3>
               
               <div className="border border-[#ff4a4a]/20 bg-[#1a0a0a]/50 rounded-xl p-5 mt-4">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#ff4a4a]/10 flex items-center justify-center flex-shrink-0">
                       <ShieldAlert size={20} className="text-[#ff4a4a]" />
                     </div>
                     <div>
                       <h4 className="text-[#ECECEC] font-poppins font-medium text-sm mb-1">Eliminar todos los chats</h4>
                       <p className="text-[#8E8E8E] text-xs font-poppins mb-4 max-w-md">
                         Esta acción procesará la eliminación permanente de todas tus conversaciones, incluyendo chats fijados y archivados. Esta acción no se puede deshacer de ninguna manera.
                       </p>
                       <button 
                         onClick={onClearAllChats}
                         className="bg-[#ff4a4a] hover:bg-[#ff3333] text-white px-4 py-2 rounded-lg font-poppins text-sm font-medium transition-colors shadow-sm"
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
