"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const pref = searchParams.get("pref");
  const requestId = searchParams.get("request_id");

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-12 text-center">
      <div className="bg-white border border-meli-border rounded-2xl p-10 shadow-sm flex flex-col items-center">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-meli-dark mb-2">Pagamento Aprovado!</h1>
        <p className="text-meli-gray text-lg mb-8">
          A oferta foi aceita e o pagamento concluído com sucesso.
          {pref && <span className="block text-sm mt-3 font-mono bg-meli-bg border border-meli-border p-2 rounded-lg text-meli-dark/70">Transação Interna: {pref}</span>}
        </p>

        <Link 
          href={`/request/${requestId}`}
          className="bg-meli-blue hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-colors inline-block w-full shadow-md text-lg"
        >
          Voltar ao Pedido (Acessar Chat e Avaliar)
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando recibo...</div>}>
       <SuccessContent />
    </Suspense>
  )
}
