import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { Mail, Key, LogIn } from 'lucide-react';

const LoginModal = ({ onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAction = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError("Error: " + err.message.replace('Firebase:', '').trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAction = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
       // Ignore popup closed errors
       if (err.code !== 'auth/popup-closed-by-user') {
          setError("Error de Google: " + err.message);
       }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#212121] z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-[#171717] w-full max-w-md rounded-2xl p-8 border border-[#333] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-[#8E8E8E] hover:text-white text-xl pb-2">✕</button>
        <h2 className="font-anton text-3xl text-white mb-6 uppercase tracking-wide text-center flex justify-center items-center gap-2">
          C7 STUDIO<span className="text-[#FFD000]">.</span>
        </h2>
        
        {error && <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

        <button 
          onClick={handleGoogleAction}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar con Google
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-[#333]"></div>
          <span className="flex-shrink-0 mx-4 text-[#8E8E8E] text-[11px] uppercase tracking-wider">O usa tu correo</span>
          <div className="flex-grow border-t border-[#333]"></div>
        </div>

        <form onSubmit={handleEmailAction} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-[14px] text-[#8E8E8E]" size={18} />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#212121] border border-[#333] rounded-xl py-[12px] pl-12 pr-4 text-white placeholder-[#8E8E8E] focus:outline-none focus:border-[#FFD000] focus:ring-1 focus:ring-[#FFD000] transition-all font-poppins text-[15px]"
            />
          </div>
          <div className="relative">
            <Key className="absolute left-4 top-[14px] text-[#8E8E8E]" size={18} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#212121] border border-[#333] rounded-xl py-[12px] pl-12 pr-4 text-white placeholder-[#8E8E8E] focus:outline-none focus:border-[#FFD000] focus:ring-1 focus:ring-[#FFD000] transition-all font-poppins text-[15px]"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#FFD000] text-black font-semibold py-[12px] mt-2 rounded-xl hover:bg-[#E6BC00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Cargando...' : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <p className="text-center text-[#8E8E8E] text-[13px] mt-6 font-poppins">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
          <button onClick={() => setIsRegister(!isRegister)} className="text-[#FFD000] ml-1 font-medium hover:underline focus:outline-none">
            {isRegister ? 'Ingresa aquí' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginModal;
