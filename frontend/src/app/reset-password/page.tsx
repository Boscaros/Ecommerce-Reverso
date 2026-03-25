"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setStatus('error');
      setErrorMessage('As senhas não conferem. Verifique a digitação.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/users/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          new_password: password,
          new_password_confirm: passwordConfirm
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        if (Array.isArray(data.detail)) {
          setErrorMessage(data.detail[0].msg);
        } else {
          setErrorMessage(data.detail || 'Ocorreu um erro ao definir a nova senha.');
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Erro de conexão ao comunicar a nova senha.');
    }
  };

  return (
    <div className="min-h-screen bg-meli-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-meli-yellow/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-meli-border rounded-2xl mb-6 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-meli-blue" />
          </div>
          <h1 className="text-4xl font-extrabold text-meli-dark tracking-tight mb-2">Nova Senha</h1>
          <p className="text-meli-gray text-lg">Defina novas credenciais fortes para a sua conta.</p>
        </div>

        <div className="bg-white border border-meli-border rounded-3xl p-8 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border border-green-200">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-meli-dark mb-4">Senha Atualizada!</h2>
              <p className="text-meli-dark/80 mb-8 font-medium">
                Sua senha foi redefinida com criptografia segura. Você já pode acessar sua conta novamente.
              </p>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-meli-blue hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-sm"
              >
                Fazer Login agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-meli-dark/80 ml-1">E-mail</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-meli-border text-meli-dark text-base rounded-xl focus:ring-2 focus:ring-meli-blue block px-4 py-4 transition-all placeholder:text-gray-400"
                    placeholder="Confirme seu e-mail"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-meli-dark/80 ml-1">Nova Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-meli-blue transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-meli-border text-meli-dark text-base rounded-xl focus:ring-2 focus:ring-meli-blue block pl-11 p-4 transition-all placeholder:text-gray-400"
                    placeholder="Digite a nova senha"
                  />
                </div>
                <p className="text-xs text-meli-gray ml-1 font-medium">No mínimo 8 caracteres, 1 número, 1 maiúscula, 1 especial.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-meli-dark/80 ml-1">Confirmar Nova Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-meli-blue transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-white border border-meli-border text-meli-dark text-base rounded-xl focus:ring-2 focus:ring-meli-blue block pl-11 p-4 transition-all placeholder:text-gray-400"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full mt-8 bg-meli-blue hover:bg-blue-600 text-white font-bold text-lg py-4 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
