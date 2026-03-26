import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { generateAIStream } from './gemini';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const streamActiveRef = useRef(false);

  const handleSendMessage = async (content) => {
    if (!content.trim() || streamActiveRef.current) return;

    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    streamActiveRef.current = true;

    // Insert an empty AI message that will receive the stream
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    try {
      await generateAIStream(content, (currentText) => {
        setIsLoading(false); // Stop loading indicator as soon as text flows
        setMessages(prev => {
          const newArray = [...prev];
          const lastIndex = newArray.length - 1;
          if (lastIndex >= 0) {
            newArray[lastIndex] = { ...newArray[lastIndex], content: currentText };
          }
          return newArray;
        });
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      streamActiveRef.current = false;
    }
  };

  return (
    <div className="flex bg-[#212121] h-screen font-poppins text-white overflow-hidden selection:bg-[#FFD000] selection:text-black">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col relative w-full h-full bg-[#212121]">
        <ChatArea 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;
