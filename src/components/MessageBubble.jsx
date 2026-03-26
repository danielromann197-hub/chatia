import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="w-full flex justify-end px-4 md:px-0 py-4 md:py-5 group">
        <div className="bg-[#2F2F2F] text-[#ECECEC] px-5 py-[14px] rounded-3xl max-w-[85%] md:max-w-3xl text-[16px] font-poppins font-normal leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="w-full flex justify-center px-4 md:px-0 py-4 md:py-6 group animate-fade-in-up">
      <div className="flex gap-4 md:gap-5 w-full max-w-3xl">
        <div className="flex-shrink-0 mt-1">
           <div className="h-8 w-8 rounded-full border border-[#333333] flex items-center justify-center bg-[#171717] text-[#FFD000]">
            <Sparkles size={16} strokeWidth={2.5} />
           </div>
        </div>
        <div className="flex-1 min-w-0 font-poppins text-[#ECECEC] leading-relaxed text-[16px] pt-[2px]">
          <div className="break-words overflow-hidden">
            <ReactMarkdown 
               className="space-y-4"
               components={{
                 // CRASH FIX: Do not pass `node` or other react-markdown internal props to standard HTML elements
                 p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                 ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />,
                 ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />,
                 li: ({node, ...props}) => <li className="pl-1" {...props} />,
                 h1: ({node, ...props}) => <h1 className="text-2xl font-semibold mt-7 mb-4 text-[#FFF]" {...props} />,
                 h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-[#FFF]" {...props} />,
                 h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-5 mb-2 text-[#FFF]" {...props} />,
                 a: ({node, ...props}) => <a className="text-[#FFD000] hover:underline hover:text-white transition-colors" {...props} />,
                 strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                 blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#555] pl-4 py-1 text-gray-400 my-4" {...props} />,
                 code({node, inline, className, children, ...props}) {
                   const match = /language-(\w+)/.exec(className || '');
                   return !inline && match ? (
                     <div className="my-5 rounded-lg overflow-hidden border border-[#333333] shadow-sm">
                       <div className="bg-[#2F2F2F] px-4 py-2 flex items-center justify-between text-xs font-mono text-[#A3A3A3] uppercase">
                         {match[1]}
                       </div>
                       <pre className="bg-[#000000] p-4 overflow-x-auto m-0">
                         <code className={className} {...props}>
                           {children}
                         </code>
                       </pre>
                     </div>
                   ) : (
                     <code className="bg-[#2F2F2F] px-1.5 py-0.5 rounded-md text-[14px] font-mono text-[#D4D4D4]" {...props}>
                       {children}
                     </code>
                   );
                 }
               }}
            >
              {message.content || ' '}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
