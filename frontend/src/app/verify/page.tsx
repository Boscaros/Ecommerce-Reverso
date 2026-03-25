"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmail() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.is_email_verified) {
        router.push("/"); // Already verified
        return;
    }
    setUserName(user.name);
    setUserId(user.id);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_code: code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Código inválido");
      }
      
      const sessionStr = localStorage.getItem("user");
      if (sessionStr) {
          const session = JSON.parse(sessionStr);
          session.is_email_verified = true;
          localStorage.setItem("user", JSON.stringify(session));
      }
      
      setSuccess(true);
      setTimeout(() => {
          router.push("/profile");
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (success) {
      return (
        <div className="flex min-h-[85vh] items-center justify-center py-10">
          <div className="w-full max-w-md p-8 bg-white rounded-xl border border-meli-border shadow-sm text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Conta Verificada!</h2>
            <p className="text-meli-dark/80">Você será redirecionado para o seu Perfil...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10">
      <div className="w-full max-w-md p-8 bg-white rounded-xl border border-meli-border shadow-sm text-center">
        <h2 className="text-2xl font-bold text-meli-dark mb-2">Verifique seu E-mail</h2>
        <p className="text-meli-gray text-sm mb-6">
          Olá {userName}, nós enviamos um código para o seu e-mail para confirmar a autenticidade da sua conta.
        </p>
        
        {error && <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-meli-dark/80 mb-1">Código de Segurança</label>
            <input 
              type="text" required value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 123456"
              className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue text-center tracking-widest font-mono text-xl"
            />
            <p className="text-xs text-meli-gray mt-2 text-center">(Dica: para esse teste MVP, digite qualquer coisa diferente de 0000 para aprovar)</p>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-meli-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm mt-4"
          >
            Confirmar Conta
          </button>
        </form>
      </div>
    </div>
  );
}
