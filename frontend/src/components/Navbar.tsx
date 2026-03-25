"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{name: string, id: number} | null>(null);

  useEffect(() => {
    // Simple mock auth for the MVP
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="bg-meli-yellow text-meli-dark shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black text-meli-dark tracking-tighter">
              RevCommerce
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile" className="text-sm font-semibold text-meli-dark/80 hover:text-meli-dark transition-colors">
                  Olá, {user.name}
                </Link>
                <Link href="/my-requests" className="text-sm font-semibold text-meli-dark/80 hover:text-meli-dark transition-colors">
                  Meus Pedidos
                </Link>
                <Link href="/my-offers" className="text-sm font-semibold text-meli-dark/80 hover:text-meli-dark transition-colors">
                  Minhas Ofertas
                </Link>
                <Link href="/request/new" className="bg-meli-blue hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity">
                  Criar Pedido
                </Link>
                <button onClick={logout} className="text-sm text-meli-dark/70 hover:text-meli-dark transition-colors">Sair</button>
              </>
            ) : (
              <Link href="/login" className="text-meli-dark hover:text-black px-4 py-2 text-sm font-medium transition-colors">
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
