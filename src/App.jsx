import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { generateAIStream } from './gemini';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const streamActiveRef = useRef(false);

  // Load from LocalStorage or initialize with one empty chat
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('c7_chatHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Local storage parse error", e);
      }
    }
    return [{ id: Date.now(), title: 'Nuevo chat', messages: [], createdAt: Date.now() }];
  });

  const [currentChatId, setCurrentChatId] = useState(chats[0]?.id);

  // Save to LocalStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('c7_chatHistory', JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    const newChat = { id: Date.now(), title: 'Nuevo chat', messages: [], createdAt: Date.now() };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // If we delete the last chat, create a new one automatically
      if (filtered.length === 0) {
        const fallback = { id: Date.now(), title: 'Nuevo chat', messages: [], createdAt: Date.now() };
        setCurrentChatId(fallback.id);
        return [fallback];
      }
      return filtered;
    });

    if (currentChatId === id) {
      const remaining = chats.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      }
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat?.messages || [];

  const handleSendMessage = async (content) => {
    if (!content.trim() || streamActiveRef.current) return;

    const activeId = currentChatId;
    const isFirstMessage = messages.length === 0;
    
    // Auto-name the chat if it's the first message
    let newTitle = currentChat.title;
    if (isFirstMessage) {
       newTitle = content.split(' ').slice(0, 4).join(' ');
       if (content.split(' ').length > 4) newTitle += '...';
    }

    setChats(prev => prev.map(chat => {
      if (chat.id === activeId) {
        return { 
          ...chat, 
          title: newTitle,
          messages: [...chat.messages, { role: 'user', content }] 
        };
      }
      return chat;
    }));

    setIsLoading(true);
    streamActiveRef.current = true;

    // Insert an empty AI message placeholder
    setChats(prev => prev.map(chat => {
      if (chat.id === activeId) {
        return { ...chat, messages: [...chat.messages, { role: 'ai', content: '' }] };
      }
      return chat;
    }));

    try {
      await generateAIStream(content, (currentText) => {
        setIsLoading(false);
        setChats(prev => prev.map(chat => {
          if (chat.id === activeId) {
            const newArray = [...chat.messages];
            const lastIndex = newArray.length - 1;
            if (lastIndex >= 0) {
              newArray[lastIndex] = { ...newArray[lastIndex], content: currentText };
            }
            return { ...chat, messages: newArray };
          }
          return chat;
        }));
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
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
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
