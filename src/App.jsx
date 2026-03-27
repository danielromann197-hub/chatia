import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import { generateAIStream } from './gemini';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const streamActiveRef = useRef(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Base state generator
  const getEmptyChat = () => [{ id: Date.now(), title: 'Nuevo chat', messages: [], createdAt: Date.now() }];

  const [chats, setChats] = useState(getEmptyChat());
  const [currentChatId, setCurrentChatId] = useState(chats[0].id);

  // Authentication Listener & Persistence Router
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);

      if (currentUser) {
        // Logged In User: Load their specific local database
        const saved = localStorage.getItem(`c7_chatHistory_${currentUser.uid}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setChats(parsed);
            setCurrentChatId(parsed[0].id);
          } catch (e) {
            setChats(getEmptyChat());
            setCurrentChatId(getEmptyChat()[0].id);
          }
        } else {
           setChats(getEmptyChat());
           setCurrentChatId(getEmptyChat()[0].id);
        }
      } else {
        // Unregistered/Guest User: Start fresh (Volatile RAM memory only)
        setChats(getEmptyChat());
        setCurrentChatId(getEmptyChat()[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save to LocalStorage specifically attached to the verified user
  useEffect(() => {
    if (user && chats.length > 0) {
      localStorage.setItem(`c7_chatHistory_${user.uid}`, JSON.stringify(chats));
    }
  }, [chats, user]);

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
      if (filtered.length === 0) {
        const fallback = getEmptyChat()[0];
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

  // Hide the entire UI if Firebase is initializing
  if (isAuthChecking) {
    return <div className="h-screen w-screen bg-[#212121] flex justify-center items-center"><div className="w-6 h-6 border-2 border-[#FFD000] border-t-transparent animate-spin rounded-full"></div></div>;
  }

  // Full-screen login page when accessed
  if (showLogin) {
    return (
      <div className="flex bg-[#212121] h-screen font-poppins text-white overflow-hidden selection:bg-[#FFD000] selection:text-black">
        <LoginModal onClose={() => setShowLogin(false)} />
      </div>
    );
  }

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
        user={user}
        onShowLogin={() => setShowLogin(true)}
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
