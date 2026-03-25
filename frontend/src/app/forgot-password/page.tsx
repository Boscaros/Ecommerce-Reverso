"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mockTokenMessage, setMockTokenMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/users/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        if (data.mock_token) {
           // We are in MVP mode, display token to user for easy testing
           setMockTokenMessage(`Para testes (MVP), copie este token gerado: ${data.mock_token}`);
        }
      } else {
        setStatus('error');
        setErrorMessage(data.detail || 'Ocorreu um erro. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Erro de conexão ao solicitar recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-meli-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-meli-yellow/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-meli-border rounded-2xl mb-6 shadow-sm">
            <ShoppingBag className="w-8 h-8 text-meli-blue" />
          </div>
          <h1 className="text-4xl font-extrabold text-meli-dark tracking-tight mb-2">Esqueci a Senha</h1>
          <p className="text-meli-gray text-lg">Enviaremos um link de recuperação para o seu email.</p>
        </div>

        <div className="bg-white border border-meli-border rounded-3xl p-8 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-meli-dark mb-4">Email Enviado!</h2>
              <p className="text-meli-dark/80 mb-6 font-medium">
                Se o email informado estiver cadastrado, nosso sistema enviou instruções de recuperação.
              </p>

              {mockTokenMessage && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">MENSAGEM DE TESTE - AMBIENTE DEV</p>
                      <p className="text-meli-dark text-sm break-all font-mono">{mockTokenMessage}</p>
                      <button 
                        onClick={() => router.push('/reset-password')}
                        className="mt-4 w-full bg-meli-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                      >
                         Ir para a tela de Reset de Senha
                      </button>
                  </div>
              )}

              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-meli-blue hover:text-blue-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Login
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
                <label className="text-sm font-semibold text-meli-dark/80 ml-1">Seu E-mail Cadastrado</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-meli-blue transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-meli-border text-meli-dark text-base rounded-xl focus:ring-2 focus:ring-meli-blue block pl-11 p-4 transition-all placeholder:text-gray-400"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-meli-blue hover:bg-blue-600 text-white font-bold text-lg py-4 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Recuperar Senha'
                )}
              </button>
              
              <div className="text-center mt-6">
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 text-meli-gray hover:text-meli-dark font-medium transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
