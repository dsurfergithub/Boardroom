import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { setToken } from '../lib/auth';

interface AuthGateProps {
  onLogin: () => void;
}

export function AuthGate({ onLogin }: AuthGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ping', {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.status === 401) {
        setError('Contraseña incorrecta');
      } else if (res.ok) {
        setToken(password);
        onLogin();
      } else {
        setError('Error al verificar. Inténtalo de nuevo.');
      }
    } catch {
      setError('Error de conexión. Comprueba tu red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-sm border border-[#38383A] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-[#0A84FF22] rounded-2xl mb-4">
            <Lock className="text-[#0A84FF]" size={32} />
          </div>
          <h1 className="text-xl font-bold text-white">Boardroom</h1>
          <p className="text-[#8E8E93] text-sm mt-1">Acceso personal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#2C2C2E] border border-[#38383A] rounded-xl px-4 py-3 text-white placeholder-[#8E8E93] focus:border-[#0A84FF] outline-none transition-colors"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="text-[#FF453A] text-sm text-center font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="w-full bg-[#0A84FF] text-white py-3 rounded-xl font-bold hover:bg-[#007AFF] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verificando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
