"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReviewModal from "@/components/ReviewModal";
import { useChat } from "@/context/ChatContext";

interface User {
  id: number;
  name: string;
}

interface Message {
  id: number;
  sender_id: number;
  text_content: string;
  created_at: string;
}

interface Offer {
  id: number;
  seller_id: number;
  offer_price_cents: number;
  image_url?: string;
  status: string;
  messages: Message[];
}

interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  product_category: string;
  product_condition: string;
  target_price_cents: number;
  buyer_id: number;
  is_open: boolean;
  offers: Offer[];
}

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerImage, setOfferImage] = useState<File | null>(null);
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewOffer, setReviewOffer] = useState<Offer | null>(null);
  
  const { openChat } = useChat();

  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load Request
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/requests/${id}`)
      .then(res => res.json())
      .then(data => setRequest(data))
      .catch(err => console.error(err));
  }, [id]);

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Faça login para ofertar.");
      return;
    }
    const cents = Math.round(parseFloat(offerPrice.replace(",", ".")) * 100);
    
    // Convert logic to FormData since we are sending files
    const formData = new FormData();
    formData.append("request_id", id as string);
    formData.append("seller_id", user.id.toString());
    formData.append("offer_price_cents", cents.toString());
    
    if (offerImage) {
        formData.append("image", offerImage);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/offers/`, {
        method: "POST",
        body: formData // No Content-Type header needed for FormData in fetch
      });
      if (res.ok) {
        alert("Oferta enviada com sucesso!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert("Erro ao enviar: " + (errorData.detail || "Verifique o formato"));
      }
    } catch(err) {
      console.error(err);
      alert("Erro de conexão ao enviar oferta.");
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== request?.buyer_id) return;
    if (!confirm("Tem certeza que deseja excluir este pedido de forma permanente?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/requests/${id}?user_id=${user.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Pedido excluído!");
        window.location.href = "/my-requests";
      } else {
        const errorData = await res.json();
        alert("Erro ao excluir: " + (errorData.detail || "Tente novamente."));
      }
    } catch(err) {
      console.error(err);
      alert("Erro de conexão ao excluir pedido.");
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!user || user.id !== request?.buyer_id) return;
    window.location.href = `/checkout/${offerId}`;
  };

  if (!request) return <div className="p-10 text-center text-meli-gray">Carregando pedido...</div>;

  const isBuyer = user?.id === request.buyer_id;
  const hasOffered = request.offers.some(o => o.seller_id === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {!request.is_open && (
         <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <svg className="w-8 h-8 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
               <h2 className="text-lg font-bold">Pedido Encerrado</h2>
               <p className="text-sm">O comprador já escolheu a oferta vencedora para este pedido.</p>
            </div>
         </div>
      )}

      {/* Cartão do Pedido */}
      <div className="bg-white border border-meli-border rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h1 className="text-3xl font-bold text-meli-dark mb-2">{request.title}</h1>
             <div className="flex gap-2 items-center">
               <span className="bg-meli-bg text-meli-gray text-xs px-3 py-1 rounded-md border border-meli-border uppercase tracking-wider font-semibold">
                  {request.product_category || "Outros"}
               </span>
               <span className="bg-meli-blue/10 text-meli-blue text-xs px-3 py-1 rounded-md border border-meli-blue/20 uppercase tracking-wider font-semibold ml-2">
                  {request.product_condition || "Não informado"}
               </span>
               {isBuyer && (
                 <button onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs px-3 py-1 rounded-md border border-red-200 uppercase tracking-wider font-semibold transition-colors">
                    Excluir Pedido
                 </button>
               )}
             </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase text-meli-gray font-bold tracking-wider">Preço Alvo</span>
            <p className="text-2xl font-bold text-green-600">
              {(request.target_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>
        <p className="text-meli-dark/80 whitespace-pre-line text-lg bg-meli-bg p-6 rounded-xl border border-meli-border">
          {request.description}
        </p>
      </div>

      {/* Formulário de Oferta (apenas Vendedores) */}
      {!isBuyer && !hasOffered && request.is_open && (
        <div className="bg-meli-bg border border-meli-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-meli-dark mb-2">Faça sua Oferta</h2>
          <p className="text-meli-gray mb-6 text-sm">Ofereça um valor competitivo para fechar negócio.</p>
          <form onSubmit={submitOffer} className="space-y-4">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs uppercase text-meli-gray font-bold tracking-wider mb-2">Seu Preço (R$)</label>
                  <input 
                    type="number" step="0.01" required 
                    value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                    className="w-full bg-white border border-meli-border rounded-lg px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue" 
                    placeholder="Ex: 3400.00"
                  />
                </div>
                <div className="flex-1">
                    <label className="block text-xs uppercase text-meli-gray font-bold tracking-wider mb-2">Anexar Foto (opcional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setOfferImage(e.target.files?.[0] || null)}
                      className="w-full bg-white border border-meli-border rounded-lg px-4 py-2.5 text-meli-gray file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-meli-blue hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-meli-blue cursor-pointer"
                    />
                </div>
            </div>
            <button type="submit" className="w-full bg-meli-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors mt-2">
              Enviar Oferta
            </button>
          </form>
        </div>
      )}

      {/* Lista de Ofertas */}
      <div className="bg-white border border-meli-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-meli-dark mb-6">Ofertas Recebidas ({request.offers.length})</h2>
        {request.offers.length === 0 ? (
          <p className="text-meli-gray text-center py-8">Nenhuma oferta ainda. Seja o primeiro!</p>
        ) : (
          <div className="space-y-4">
            {request.offers.map((offer) => (
              <div key={offer.id} 
                   onClick={() => openChat(offer.id)}
                   className="flex justify-between items-center p-4 rounded-xl border border-meli-border bg-white hover:border-meli-blue/50 hover:bg-gray-50 transition-all cursor-pointer">
                <div>
                  <p className="text-meli-gray text-sm">
                    <a href={`/profile/${offer.seller_id}`} className="hover:text-meli-blue hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                      Ver Perfil do Vendedor #{offer.seller_id}
                    </a>
                  </p>
                  <p className="text-meli-dark/80 font-medium">Status: <span className="text-green-600 capitalize">{offer.status}</span></p>
                </div>
                <div className="text-right flex items-center gap-4">
                  {offer.image_url && (
                     <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${offer.image_url}`} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:opacity-80 transition-opacity" title="Clique para ampliar" onClick={(e) => e.stopPropagation()}>
                         <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${offer.image_url}`} 
                            alt="Anexo da oferta"
                            className="w-16 h-16 object-cover rounded-md border border-meli-border shadow-sm"
                         />
                     </a>
                  )}
                  <div>
                      <p className="text-xl font-bold text-green-600">
                        {(offer.offer_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      
                      {isBuyer && request.is_open && offer.status === 'pending' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleAcceptOffer(offer.id); }}
                           className="mt-3 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-md uppercase tracking-wider transition-colors shadow-sm block w-full text-center"
                         >
                           Aceitar Oferta
                         </button>
                      )}
                      {offer.status === 'accepted' && (
                         <>
                           <span className="mt-3 block bg-green-100 text-green-800 text-xs font-bold py-1.5 px-3 rounded-md uppercase tracking-wider text-center border border-green-200">
                             Oferta Vencedora!
                           </span>
                           {isBuyer && (
                             <button
                               onClick={(e) => { e.stopPropagation(); setReviewOffer(offer); setIsReviewOpen(true); }}
                               className="mt-2 text-xs font-bold text-meli-blue hover:text-blue-700 underline uppercase tracking-wider block w-full text-center"
                             >
                               Deixar Avaliação
                             </button>
                           )}
                         </>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewOffer && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          requestId={request.id}
          revieweeId={reviewOffer.seller_id}
          onSubmitSuccess={() => alert("Avaliação enviada com sucesso!")}
        />
      )}
    </div>
  );
}
