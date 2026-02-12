
import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: { data: string; mimeType: string }) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((text.trim() || image) && !disabled) {
      onSendMessage(text, image ? { data: image.data, mimeType: image.mimeType } : undefined);
      setText('');
      setImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
          data: base64String,
          mimeType: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      <div className="relative bg-[#3D3D3D] border border-[#444] rounded-2xl shadow-xl p-2 focus-within:ring-2 focus-within:ring-[#FF4B4B] transition-all">
        {image && (
          <div className="flex px-4 pt-2 gap-2">
            <div className="relative group">
              <img src={image.preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-[#555]" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#FF4B4B] transition-colors"
            title="Upload Image"
          >
            <i className="fa-solid fa-image text-xl"></i>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemigroq..."
            className="flex-1 bg-transparent text-white border-none focus:ring-0 resize-none py-4 px-2 max-h-40 min-h-[44px]"
            rows={1}
            disabled={disabled}
          />
          
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !image) || disabled}
            className={`p-3 mr-1 rounded-xl flex items-center justify-center transition-all ${
              (!text.trim() && !image) || disabled 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-[#FF4B4B] hover:bg-[#FF4B4B]/10'
            }`}
          >
            <i className="fa-solid fa-paper-plane text-xl"></i>
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">
        Gemigroq Ultimate Edition &bull; Powered by Gemini 3 Pro
      </p>
    </div>
  );
};

export default ChatInput;
