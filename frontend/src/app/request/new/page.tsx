"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(userStr);
    
    // Converter o preço em centavos para facilitar cálculos inteiros no backend
    const target_price_cents = Math.round(parseFloat(price.replace(",", ".")) * 100);

    try {
      const res = await fetch(`http://localhost:8000/requests/?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ 
           title, 
           description, 
           product_category: productCategory,
           product_condition: productCondition,
           target_price_cents,
           city
        }),
      });

      if (!res.ok) throw new Error("Falha ao criar o pedido");
      
      const data = await res.json();
      router.push(`/request/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white border border-meli-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-meli-dark mb-2">O que você quer comprar?</h1>
        <p className="text-meli-gray mb-8">Descreva o item e quanto você quer pagar. Lojistas farão ofertas.</p>

        {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Título do Pedido</label>
            <input
              type="text"
              required
              placeholder="Ex: iPhone 13 Pro 256GB Azul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-xl px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Categoria do Produto</label>
            <select
              required
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-xl px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow appearance-none"
            >
               <option value="" disabled>Selecione uma Categoria...</option>
               <option value="Automotivo">Automotivo</option>
               <option value="Beleza e Cuidado Pessoal">Beleza e Cuidado Pessoal</option>
               <option value="Brinquedos">Brinquedos</option>
               <option value="Casa, Móveis e Decoração">Casa, Móveis e Decoração</option>
               <option value="Celulares e Telefones">Celulares e Telefones</option>
               <option value="Eletrodomésticos">Eletrodomésticos</option>
               <option value="Eletrônicos">Eletrônicos</option>
               <option value="Esportes e Fitness">Esportes e Fitness</option>
               <option value="Ferramentas">Ferramentas</option>
               <option value="Informática">Informática</option>
               <option value="Livros">Livros</option>
               <option value="Moda e Vestuário">Moda e Vestuário</option>
               <option value="Outros">Outros Diversos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Condição do Produto</label>
            <select
              required
              value={productCondition}
              onChange={(e) => setProductCondition(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-xl px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow appearance-none"
            >
               <option value="" disabled>Selecione a condição...</option>
               <option value="Novo">Novo</option>
               <option value="Usado">Usado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Descrição Detalhada</label>
            <textarea
              required
              rows={4}
              placeholder="Ex: Aceito marcas de uso, porém sem trincos na tela. Bateria acima de 85%."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-xl px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Cidade/UF de Entrega</label>
            <input
              type="text"
              required
              placeholder="Ex: São Paulo, SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white border border-meli-border rounded-xl px-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-meli-dark/80 mb-2">Valor Máximo / Alvo (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 font-medium">R$</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="3500.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-meli-border rounded-xl pl-12 pr-4 py-3 text-meli-dark focus:outline-none focus:ring-2 focus:ring-meli-blue transition-shadow"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-meli-border">
            <button
              type="submit"
              className="w-full bg-meli-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm text-lg"
            >
              Publicar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
