
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, ChatState } from './types';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    location: 'Belfair, WA',
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check for API Key on mount using the environment's aistudio object
  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.isLoading]);

  const handleSend = async (text: string, image?: { data: string; mimeType: string }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      image,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await getGeminiResponse(
        [...state.messages, userMessage], 
        state.location,
        image
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🚨 ${err.message}`,
        timestamp: new Date(),
        error: true
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: err.message
      }));
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Wipe memory?")) {
      setState(prev => ({ ...prev, messages: [], error: null }));
    }
  };

  const handleOpenKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume selection successful as per guidelines to mitigate race condition
      setHasKey(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#2F2F2F] text-white overflow-hidden font-sans">
      <Sidebar 
        location={state.location}
        onLocationChange={(loc) => setState(p => ({...p, location: loc}))}
        onClearChat={handleClearChat}
        messages={state.messages}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenKey={handleOpenKey}
      />

      <main className={`flex-1 flex flex-col h-full transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#333] bg-[#2F2F2F] sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF4B4B] rounded-lg flex items-center justify-center font-bold text-xs">GQ</div>
            <h2 className="font-bold text-lg tracking-tight">Gemigroq <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">ULTIMATE</span></h2>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 hover:bg-white/5 rounded-lg lg:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          {state.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#FF4B4B] to-[#ff7b7b] rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-2xl rotate-3">
                🤖
              </div>
              <h3 className="text-3xl font-black mb-2 tracking-tighter">GEMIGROQ ULTIMATE</h3>
              <p className="max-w-md text-gray-400 text-sm leading-relaxed">
                Experience high-intelligence reasoning and multi-modal analysis. 
                Everything is private and stored locally in this session.
              </p>
              {!hasKey && (
                <button 
                  onClick={handleOpenKey}
                  className="mt-8 px-6 py-2 bg-[#FF4B4B] text-white rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Connect API Key
                </button>
              )}
            </div>
          ) : (
            state.messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          
          {state.isLoading && (
            <div className="flex justify-start items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="w-10 h-10 rounded-full bg-black border border-[#444] flex items-center justify-center text-xl shadow-lg">
                🤖
              </div>
              <div className="bg-[#3D3D3D] p-4 rounded-2xl rounded-tl-none border border-[#444] text-gray-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <ChatInput 
          onSendMessage={handleSend} 
          disabled={state.isLoading} 
        />
      </main>
    </div>
  );
};

export default App;
