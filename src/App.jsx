import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import ImageGalleryModal from './components/ImageGalleryModal';
import ArchivedChatsModal from './components/ArchivedChatsModal';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import UpgradePlanModal from './components/UpgradePlanModal';
import SearchChatsModal from './components/SearchChatsModal';
import { generateAIStream } from './gemini';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isLoading, setIsLoading] = useState(false);
  const streamActiveRef = useRef(false);

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradePlan, setShowUpgradePlan] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAIVoiceMode, setIsAIVoiceMode] = useState(false);

  useEffect(() => {
    const handleVoiceToggle = () => setIsAIVoiceMode(prev => !prev);
    window.addEventListener('toggleAIVoiceMode', handleVoiceToggle);
    return () => window.removeEventListener('toggleAIVoiceMode', handleVoiceToggle);
  }, []);

  // Global settings event listener
  useEffect(() => {
    const handleVoiceToggle = () => setIsAIVoiceMode(prev => !prev);
    window.addEventListener('toggleAIVoiceMode', handleVoiceToggle);
    return () => window.removeEventListener('toggleAIVoiceMode', handleVoiceToggle);
  }, []);

  // Base state generator
  const getEmptyChat = () => [{ id: Date.now(), title: 'Nuevo chat', messages: [], createdAt: Date.now() }];

  const [chats, setChats] = useState(getEmptyChat());
  const [currentChatId, setCurrentChatId] = useState(chats[0].id);

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Authentication Listener & Persistence Router
  useEffect(() => {
    // Failsafe to ensure the app always loads even if Firebase hangs
    const globalTimeout = setTimeout(() => setIsAuthChecking(false), 6000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await withTimeout(getDoc(doc(db, 'users', currentUser.uid)), 5000);
          let cloudChats = [];
          
          if (userDoc.exists() && userDoc.data().chats) {
            cloudChats = userDoc.data().chats;
          } else {
            const saved = localStorage.getItem(`c7_chatHistory_${currentUser.uid}`);
            cloudChats = saved && saved !== "null" ? JSON.parse(saved) : [];
          }

          if (userDoc.exists()) {
             const data = userDoc.data();
             if (!data.age || (!currentUser.displayName && !data.displayName)) {
                setShowOnboarding(true);
             }
          } else {
             setShowOnboarding(true);
          }

          if (!Array.isArray(cloudChats)) cloudChats = [];

          const safeRefChats = Array.isArray(chatsRef.current) ? chatsRef.current : [];
          const guestActiveChats = safeRefChats.filter(c => c && Array.isArray(c.messages) && c.messages.length > 0);
          let mergedChats = [];

          if (cloudChats.length === 0) {
            mergedChats = guestActiveChats.length > 0 ? guestActiveChats : getEmptyChat();
          } else {
            const existingIds = new Set(cloudChats.map(c => c.id));
            const newGuestChats = guestActiveChats.filter(c => !existingIds.has(c.id));
            mergedChats = [...newGuestChats, ...cloudChats];
          }

          if (!Array.isArray(mergedChats) || mergedChats.length === 0) {
             mergedChats = getEmptyChat();
          }

          setChats(mergedChats);
          setCurrentChatId(mergedChats[0].id);
          localStorage.setItem(`c7_chatHistory_${currentUser.uid}`, JSON.stringify(mergedChats));
          
          // Force an immediate cloud save if we just migrated guest chats over
          if (guestActiveChats.length > 0) {
            const updatePromise = setDoc(doc(db, 'users', currentUser.uid), { chats: mergedChats }, { merge: true });
            if (updatePromise && updatePromise.catch) updatePromise.catch(e => console.error(e));
          }
        } catch (error) {
           console.error("Error loading chats from Firestore:", error);
           const saved = localStorage.getItem(`c7_chatHistory_${currentUser.uid}`);
           let parsed = saved && saved !== "null" ? JSON.parse(saved) : null;
           if (!Array.isArray(parsed) || parsed.length === 0) parsed = getEmptyChat();
           setChats(parsed);
           setCurrentChatId(parsed[0].id);
        }
      } else {
        // Unregistered/Guest User: Start fresh
        setChats(getEmptyChat());
        setCurrentChatId(getEmptyChat()[0].id);
      }
      clearTimeout(globalTimeout);
      setIsAuthChecking(false);
    });
    return () => {
      clearTimeout(globalTimeout);
      unsubscribe();
    };
  }, []);

  // Sync to Cloud and LocalStorage
  useEffect(() => {
    if (user && chats.length > 0 && !isAuthChecking) {
      localStorage.setItem(`c7_chatHistory_${user.uid}`, JSON.stringify(chats));
      // Sync strictly valid states to Firestore
      setDoc(doc(db, 'users', user.uid), { chats }, { merge: true }).catch(err => console.error("Error saving to cloud:", err));
    }
  }, [chats, user, isAuthChecking]);

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
      const remaining = chats.filter(c => c.id !== id && !c.archived);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        const fallback = getEmptyChat()[0];
        setChats(prev => [fallback, ...prev]);
        setCurrentChatId(fallback.id);
      }
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(prev => prev.map(c => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const handleTogglePinChat = (id) => {
    setChats(prev => prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  const handleToggleArchiveChat = (id) => {
    setChats(prev => prev.map(c => (c.id === id ? { ...c, archived: !c.archived } : c)));
    if (currentChatId === id) {
      const activeChats = chats.filter(c => c.id !== id && !c.archived);
      if (activeChats.length > 0) {
        setCurrentChatId(activeChats[0].id);
      } else {
        const fallback = getEmptyChat()[0];
        setChats(prev => [fallback, ...prev]);
        setCurrentChatId(fallback.id);
      }
    }
  };

  const handleClearAllChats = () => {
    if (window.confirm("¿Estás completamente seguro de que quieres eliminar todos los chats de forma permanente?")) {
       const fallback = getEmptyChat();
       setChats(fallback);
       setCurrentChatId(fallback[0].id);
       setShowSettings(false);
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

    let completeResponse = '';
    try {
      await generateAIStream(content, (currentText) => {
        completeResponse = currentText;
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
      
      if (isAIVoiceMode && completeResponse) {
         try {
           const cleanText = completeResponse.replace(/[*#`_\n]/g, ' ').trim();
           const utterance = new SpeechSynthesisUtterance(cleanText);
           utterance.lang = 'es-MX';
           window.speechSynthesis.speak(utterance);
         } catch (e) {
           console.error("SpeechSynthesis Failed:", e);
         }
      }
    }
  };

  // Hide the entire UI if Firebase is initializing
  if (isAuthChecking) {
    return <div className="h-[100dvh] w-screen bg-[#212121] flex justify-center items-center"><div className="w-6 h-6 border-2 border-[#FFD000] border-t-transparent animate-spin rounded-full"></div></div>;
  }

  // Full-screen login page when accessed
  if (showLogin) {
    return (
      <div className="flex bg-[#212121] h-[100dvh] font-poppins text-white overflow-hidden selection:bg-[#FFD000] selection:text-black">
        <LoginModal onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="flex bg-[#212121] h-[100dvh] font-poppins text-white overflow-hidden selection:bg-[#FFD000] selection:text-black">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
        user={user} 
      />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user} 
        onClearAllChats={handleClearAllChats} 
      />
      <UpgradePlanModal 
        isOpen={showUpgradePlan} 
        onClose={() => setShowUpgradePlan(false)} 
      />
      <SearchChatsModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        chats={chats}
        onSelectChat={(id) => { handleSelectChat(id); setShowSearch(false); }}
      />
      <ImageGalleryModal 
        isOpen={showImageGallery} 
        onClose={() => setShowImageGallery(false)} 
        chats={chats} 
      />
      <ArchivedChatsModal 
        isOpen={showArchivedChats} 
        onClose={() => setShowArchivedChats(false)} 
        chats={chats} 
        onUnarchive={handleToggleArchiveChat}
        onDelete={handleDeleteChat}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onToggleArchiveChat={handleToggleArchiveChat}
        onShowImageGallery={() => setShowImageGallery(true)}
        onShowArchivedChats={() => setShowArchivedChats(true)}
        user={user}
        onShowLogin={() => setShowLogin(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowUpgradePlan={() => setShowUpgradePlan(true)}
        onShowSearch={() => setShowSearch(true)}
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
