"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Helper para formatar o telefone enquanto digita (apenas números e DDD)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, ''); // Remove não números
    if (rawValue.length > 11) rawValue = rawValue.slice(0, 11); // Limita a 11 digitos

    let formatted = rawValue;
    if (rawValue.length > 2) {
      formatted = `(${rawValue.slice(0, 2)}) ` + rawValue.slice(2);
    }
    if (rawValue.length > 7) {
      formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7)}`;
    }
    setPhone(formatted);
  };

  const getRawPhone = () => phone.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        if (password !== passwordConfirm) {
           setError("As senhas não conferem.");
           return;
        }
        
        const rawPhone = getRawPhone();
        if (rawPhone.length < 10) {
           setError("Digite um telefone válido com DDD.");
           return;
        }

        const payload = {
            name, 
            email, 
            password,
            password_confirm: passwordConfirm,
            phone_number: rawPhone
        };

        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + "/users/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
           if (Array.isArray(data.detail)) {
               throw new Error(data.detail[0].msg);
           }
           throw new Error(data.detail || "Erro ao cadastrar");
        }
        
        localStorage.setItem("user", JSON.stringify({ name: data.name, id: data.id, is_email_verified: data.is_email_verified }));
        window.location.href = "/verify"; // Redireciona para confirmar e-mail
      } else {
        // Mock Login
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + "/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await res.json();
        if (!res.ok) {
           throw new Error(data.detail || "Erro ao fazer login");
        }
        
        localStorage.setItem("user", JSON.stringify({name: data.user.name, id: data.user.id, is_email_verified: data.user.is_email_verified}));
        localStorage.setItem("token", data.access_token);
        if (!data.user.is_email_verified) {
           window.location.href = "/verify";
        } else {
           window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10">
      <div className="w-full max-w-md p-8 bg-white rounded-xl border border-meli-border shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-meli-dark">
          {isRegistering ? "Criar Conta" : "Entrar no RevCommerce"}
        </h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-meli-dark/80 mb-1">Nome Completo</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-meli-dark/80 mb-1">Telefone (DDD + Número)</label>
                <input 
                  type="tel" required value={phone} onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-meli-dark/80 mb-1">Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-meli-dark/80 mb-1">Senha</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue"
            />
            {isRegistering && (
                <p className="text-xs text-meli-gray mt-2 leading-tight">Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial.</p>
            )}
            {!isRegistering && (
                <div className="flex items-center justify-end mt-2">
                    <a href="/forgot-password" className="text-sm font-medium text-meli-blue hover:opacity-80 transition-colors">Esqueci a senha</a>
                </div>
            )}
          </div>

          {isRegistering && (
             <div>
               <label className="block text-sm font-medium text-meli-dark/80 mb-1">Confirme a Senha</label>
               <input 
                 type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                 className="w-full bg-white border border-meli-border rounded-md px-4 py-2 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue"
               />
             </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-meli-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm mt-4"
          >
            {isRegistering ? "Cadastrar" : "Entrar"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-meli-gray">
          {isRegistering ? "Já tem uma conta? " : "Não tem conta? "}
          <button 
            type="button" 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); // Clear errors on toggle
            }} 
            className="text-meli-blue hover:text-blue-600 font-medium transition-colors"
          >
            {isRegistering ? "Faça login" : "Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
}
