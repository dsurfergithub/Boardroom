import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { setGeminiKey } from '../lib/auth';

interface AuthGateProps {
  onLogin: () => void;
}

export function AuthGate({ onLogin }: AuthGateProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setGeminiKey(apiKey.trim());
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-sm border border-[#38383A] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-[#0A84FF22] rounded-2xl mb-4">
            <KeyRound className="text-[#0A84FF]" size={32} />
          </div>
          <h1 className="text-xl font-bold text-white">Boardroom</h1>
          <p className="text-[#8E8E93] text-sm mt-1 text-center">
            Introduce tu API Key de Gemini
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="AIza..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-[#2C2C2E] border border-[#38383A] rounded-xl px-4 py-3 text-white placeholder-[#8E8E93] focus:border-[#0A84FF] outline-none transition-colors font-mono text-sm"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full bg-[#0A84FF] text-white py-3 rounded-xl font-bold hover:bg-[#007AFF] transition-colors disabled:opacity-40"
          >
            Entrar
          </button>
          <p className="text-[#636366] text-xs text-center">
            La key se guarda solo en tu dispositivo
          </p>
        </form>
      </div>
    </div>
  );
}
