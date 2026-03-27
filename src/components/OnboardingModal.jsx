import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Sparkles, ArrowRight } from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState(user?.displayName || '');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen && !age) {
      // Intentar cargar la edad si ya existía pero falta el nombre
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists() && docSnap.data().age) {
          setAge(docSnap.data().age.toString());
        }
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) return;
    setIsSubmitting(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: name.trim() 
        });
      }
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        age: parseInt(age, 10), 
        displayName: name.trim() 
      }, { merge: true });
      
      onClose(); // Cerrar el modal exitosamente
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#212121]/95 z-[100] flex items-center justify-center p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#171717] w-full max-w-md rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex flex-col items-center p-8 text-center relative">
        <div className="w-16 h-16 bg-[#212121] border border-[#333] rounded-full flex items-center justify-center mb-6 shadow-inner">
           <Sparkles className="text-[#FFD000] w-7 h-7" />
        </div>
        
        <h2 className="text-2xl font-poppins font-semibold text-white mb-2">Construye tu identidad</h2>
        <p className="text-[#8E8E8E] text-sm font-poppins font-light mb-8 max-w-[280px]">
          Para poder disfrutar de la galería, anclar chats y personalizar tu experiencia, necesitamos conocerte un poco más.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="text-left w-full relative">
            <label className="text-xs font-poppins text-[#8E8E8E] uppercase tracking-wider mb-1.5 block px-1">¿Cómo te llamas?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#202123] border border-[#333] rounded-xl px-4 py-3.5 text-[#ECECEC] font-poppins outline-none focus:border-[#FFD000] transition-colors"
              placeholder="Ej. Daniel Roman"
              required
            />
          </div>

          <div className="text-left w-full relative">
            <label className="text-xs font-poppins text-[#8E8E8E] uppercase tracking-wider mb-1.5 block px-1">¿Cuántos años tienes?</label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="10"
              max="99"
              className="w-full bg-[#202123] border border-[#333] rounded-xl px-4 py-3.5 text-[#ECECEC] font-poppins outline-none focus:border-[#FFD000] transition-colors"
              placeholder="Ej. 24"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !name.trim() || !age.trim()}
            className="w-full mt-6 bg-[#FFD000] hover:bg-[#E6BC00] text-black font-semibold py-3.5 rounded-xl font-poppins transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? 'Guardando perfil...' : 'Entrar al Chat IA'}
            {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
