import { useState } from 'react';

interface PromptModalProps {
  title: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({ title, placeholder, onConfirm, onCancel }: PromptModalProps) {
  const [value, setValue] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <input 
            autoFocus
            className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={e => {
              if (e.key === 'Enter' && value.trim()) {
                onConfirm(value.trim());
              }
            }}
          />
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 bg-[#1C1C1E]">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded-xl text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              if (value.trim()) onConfirm(value.trim());
            }}
            disabled={!value.trim()}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold hover:bg-[#007AFF] shadow-lg shadow-[#0A84FF33] transition-colors disabled:opacity-50"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
