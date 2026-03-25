"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RequestMinimal {
  title: string;
  product_category: string;
}

interface Offer {
  id: number;
  request_id: number;
  seller_id: number;
  offer_price_cents: number;
  status: string;
  created_at: string;
  request: RequestMinimal;
}

export default function MyOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);

    fetch(`http://localhost:8000/offers/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-md border border-green-200 uppercase tracking-wider font-extrabold whitespace-nowrap">Aceita</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-md border border-red-200 uppercase tracking-wider font-extrabold whitespace-nowrap">Rejeitada</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-md border border-gray-200 uppercase tracking-wider font-extrabold whitespace-nowrap">Pendente</span>;
    }
  };

  if (loading) {
     return <div className="p-10 text-center text-meli-gray font-medium">Carregando suas ofertas...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 sm:p-8 rounded-2xl border border-meli-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-meli-yellow/20 rounded-full blur-3xl -tr -mt-20 -mr-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-meli-dark mb-2 tracking-tight">Minhas Ofertas</h1>
          <p className="text-meli-gray text-base sm:text-lg">Acompanhe as propostas que você enviou para os pedidos abertos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {offers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-meli-border border-dashed">
             <p className="text-meli-gray font-medium text-lg mb-2">Você ainda não enviou nenhuma oferta.</p>
             <Link href="/" className="mt-2 flex items-center bg-meli-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
               Explorar Pedidos
             </Link>
          </div>
        ) : (
          offers.map(offer => (
             <Link href={`/request/${offer.request_id}`} key={offer.id}>
               <div className="bg-white border border-meli-border rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full flex flex-col justify-between shadow-sm">
                 <div>
                   <div className="flex justify-between items-start mb-3">
                     <h3 className="text-lg font-bold text-meli-dark group-hover:text-meli-blue transition-colors leading-tight">
                       {offer.request?.title || `Pedido #${offer.request_id}`}
                     </h3>
                     <span className="bg-[#f5f5f5] text-meli-gray text-[10px] px-2 py-1 rounded-md border border-meli-border uppercase tracking-wider font-extrabold whitespace-nowrap ml-3">
                        {offer.request?.product_category || "Outros"}
                     </span>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-meli-border flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-meli-gray uppercase tracking-wider font-extrabold mb-1">Status na Negociação</p>
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-meli-gray uppercase tracking-wider font-extrabold mb-0.5">Sua Oferta</p>
                      <p className="text-green-600 font-extrabold text-xl leading-none">{formatCurrency(offer.offer_price_cents)}</p>
                    </div>
                 </div>
               </div>
             </Link>
          ))
        )}
      </div>
    </div>
  );
}
