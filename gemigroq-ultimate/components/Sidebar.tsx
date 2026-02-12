
import React from 'react';
import { Message } from '../types';

interface SidebarProps {
  location: string;
  onLocationChange: (loc: string) => void;
  onClearChat: () => void;
  messages: Message[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenKey: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  location, 
  onLocationChange, 
  onClearChat, 
  messages,
  isOpen,
  onToggle,
  onOpenKey
}) => {
  const handleExport = () => {
    if (messages.length === 0) return;
    
    const chatContent = messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role.toUpperCase();
      return `[${timestamp}] ${role}:\n${msg.content}\n${msg.image ? '[Image Attached]' : ''}\n------------------\n`;
    }).join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemigroq-ultimate-export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
        />
      )}

      {/* Rescue Tab */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed left-0 top-4 z-[100] bg-[#FF4B4B] text-white w-12 h-12 rounded-r-xl flex items-center justify-center shadow-2xl hover:w-14 transition-all"
        >
          <i className="fa-solid fa-chevron-right text-xl"></i>
        </button>
      )}

      {/* Main Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#121212] border-r border-[#222] z-[101] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#FF4B4B] rounded flex items-center justify-center font-black">G</div>
             <h1 className="text-white font-black text-xl tracking-tighter">GEMIGROQ</h1>
          </div>
          <button onClick={onToggle} className="text-gray-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">📍 User Location</label>
            <div className="relative">
              <input 
                type="text" 
                value={location} 
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-3 pl-10 text-white text-sm focus:border-[#FF4B4B] outline-none transition-all"
                placeholder="e.g. Belfair, WA"
              />
              <i className="fa-solid fa-map-pin absolute left-3 top-3.5 text-gray-500"></i>
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">System Identity</label>
            <div className="bg-gradient-to-r from-green-900/20 to-transparent border border-green-900/40 rounded-lg p-3 text-xs flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 font-medium">Ultimate Model Active</span>
            </div>
          </section>

          <section className="space-y-3 pt-4">
             <button 
                onClick={onOpenKey}
                className="w-full flex items-center justify-center gap-3 bg-[#333] hover:bg-[#444] text-white text-sm font-bold py-3 rounded-xl transition-all border border-[#444]"
              >
                <i className="fa-solid fa-key"></i>
                Change API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="block text-center text-[10px] text-gray-500 hover:text-[#FF4B4B] transition-colors uppercase tracking-widest font-bold"
              >
                Billing Documentation <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
              </a>
          </section>

          <div className="border-t border-[#222] my-6"></div>

          <section className="space-y-4">
            <button 
              onClick={handleExport}
              disabled={messages.length === 0}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all border border-white/10"
            >
              <i className="fa-solid fa-download"></i>
              Export Chat Log
            </button>
            
            <button 
              onClick={onClearChat}
              className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-[#FF4B4B] text-sm font-bold py-3 rounded-xl transition-all border border-[#FF4B4B]/20"
            >
              <i className="fa-solid fa-trash-can"></i>
              Wipe Memory
            </button>
          </section>
        </div>

        <div className="p-6 bg-black/40 border-t border-[#222]">
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <p className="font-bold text-gray-300">Secure Environment</p>
              <p>v3.1 Stable Ultimate</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
