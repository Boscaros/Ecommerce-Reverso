po"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { offerId } = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/offers/${offerId}`)
      .then(res => res.json())
      .then(data => setOffer(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [offerId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Simular intenção de pagamento no backend mock
      const checkoutRes = await fetch(`http://localhost:8000/offers/${offerId}/checkout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!checkoutRes.ok) {
        const err = await checkoutRes.json();
        throw new Error(err.detail || "Erro ao iniciar pagamento");
      }

      const checkoutData = await checkoutRes.json();
      const preferenceId = checkoutData.preference_id;

      // 2. Simular delay de processamento (autenticando pagamento)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // 3. Aceitar a oferta oficialmente no backend
      const acceptRes = await fetch(`http://localhost:8000/offers/${offerId}/accept?user_id=${user?.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!acceptRes.ok) {
        throw new Error("Erro ao finalizar a transação.");
      }

      // 4. Redirecionar para o sucesso
      router.push(`/checkout/success?pref=${preferenceId}&request_id=${offer.request_id}`);
    } catch (error: any) {
      alert(error.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-meli-gray">Preparando seu checkout seguro...</div>;
  if (!offer || offer.detail) return <div className="p-10 text-center text-meli-gray">Oferta inválida ou não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-bold text-meli-dark mb-8">Finalizar Pagamento</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Resumo */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-meli-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-meli-dark mb-4 border-b pb-2">Resumo da Compra</h2>
            <div className="mb-4">
              <p className="text-sm text-meli-gray uppercase tracking-wider font-bold">Produto</p>
              <p className="text-meli-dark text-lg">{offer.request.title}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-meli-gray uppercase tracking-wider font-bold">Vendedor</p>
              <p className="text-meli-dark">#{offer.seller_id}</p>
            </div>
            <div className="mt-8 pt-4 border-t border-meli-border flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <span className="text-xl font-bold text-meli-dark">Total a pagar</span>
              <span className="text-3xl font-bold text-green-600">
                {(offer.offer_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>

          <p className="text-xs text-meli-gray text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Pagamento 100% Simulado e Seguro
          </p>
        </div>

        {/* Pagamento */}
        <div className="w-full md:w-96 bg-meli-bg border border-meli-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-meli-dark mb-4">Como você prefere pagar?</h2>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-4 border-2 border-meli-blue bg-blue-50 rounded-xl cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="text-meli-blue w-5 h-5 accent-meli-blue" />
                <span className="font-bold text-meli-dark text-lg">PIX</span>
                <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">Aprovação imediata</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-meli-border bg-white rounded-xl cursor-not-allowed opacity-50">
                <input type="radio" name="payment" disabled className="w-5 h-5" />
                <div>
                  <span className="font-medium text-meli-dark block">Cartão de Crédito</span>
                  <span className="text-xs text-meli-gray">Em até 12x (Indisponível no Mock)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-meli-border bg-white rounded-xl cursor-not-allowed opacity-50">
                <input type="radio" name="payment" disabled className="w-5 h-5" />
                <span className="font-medium text-meli-dark">Boleto Bancário</span>
              </label>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-meli-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-md text-xl"
          >
            {isProcessing ? "Processando Pagamento..." : "Pagar Agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
