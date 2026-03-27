import React from 'react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full animate-fade-in-up mt-[10vh]">
      <div className="flex flex-col items-center mb-8">
        {/* Placeholder for ChatGPT logo, we use the branding style */}
        <div className="w-[84px] h-[84px] rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#333333] shadow-md mb-6 pointer-events-none select-none">
           <span className="font-poppins font-medium text-3xl text-white tracking-widest pl-[3px]">C7<span className="text-[#FFD000]">.</span></span>
        </div>
        <h1 className="font-poppins font-semibold text-2xl md:text-3xl text-[#ECECEC] tracking-tight">
          Hola, ¿en qué te puedo ayudar?
        </h1>
      </div>
    </div>
  );
};

export default EmptyState;
