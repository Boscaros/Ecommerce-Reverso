"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Request {
  id: number;
  title: string;
  target_price_cents: number;
  product_category: string;
  is_open: boolean;
  city: string;
  offers: any[];
  created_at: string;
}

export default function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/requests/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar meuds pedidos:", err);
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return <div className="text-center py-20 text-meli-dark">Carregando seus pedidos...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-meli-dark">Meus Pedidos</h1>
        <Link href="/request/new" className="bg-meli-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
          Novo Pedido
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-meli-border shadow-sm">
            <h2 className="text-2xl font-bold text-meli-dark mb-4">Você ainda não tem nenhum pedido</h2>
            <p className="text-meli-gray mb-6">Comece agora mesmo postando o que você quer comprar.</p>
            <Link href="/request/new" className="bg-meli-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
                Criar Primeiro Pedido
            </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Link href={`/request/${req.id}`} key={req.id} className="block group">
              <div className="bg-white border text-left border-meli-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-meli-blue transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-meli-bg text-meli-gray text-xs px-2 py-1 rounded-md border border-meli-border uppercase tracking-wider font-semibold">
                    {req.product_category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${req.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {req.is_open ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-meli-dark mb-2 group-hover:text-meli-blue transition-colors line-clamp-2">
                  {req.title}
                </h2>
                
                <div className="mt-auto pt-4 flex flex-col gap-1">
                   {req.city && (
                       <p className="text-xs text-meli-gray flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {req.city}
                       </p>
                   )}
                   <div className="flex justify-between items-center">
                     <div>
                       <span className="text-xs text-meli-gray block">Alvo:</span>
                       <span className="font-bold text-green-600 text-lg">
                         {(req.target_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                       </span>
                     </div>
                     <div className="text-right">
                       <span className="text-xs text-meli-gray block">Ofertas</span>
                       <span className="font-bold text-meli-blue text-lg bg-blue-50 px-2 rounded-md">
                          {req.offers?.length || 0}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
