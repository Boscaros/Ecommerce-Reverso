"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  product_category: string;
  product_condition: string;
  target_price_cents: number;
  created_at: string;
  buyer_id: number;
}

export default function Home() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

  // Accordion State (all closed by default as requested)
  const [openSections, setOpenSections] = useState({
    category: false,
    price: false,
    quality: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetch("http://localhost:8000/requests/")
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Derive filter options dynamically from data and mix with ML standard categories
  const standardCategories = [
    "Automotivo", "Beleza e Cuidado Pessoal", "Brinquedos",
    "Casa, Móveis e Decoração", "Celulares e Telefones", 
    "Eletrodomésticos", "Eletrônicos", "Esportes e Fitness", 
    "Ferramentas", "Informática", "Livros", "Moda e Vestuário"
  ];
  const dynamicCategories = requests.filter(r => r.product_category).map(r => r.product_category);
  const categories = Array.from(new Set([...standardCategories, ...dynamicCategories])).sort();

  // Apply filters
  const filteredRequests = requests.filter(req => {
    // 1. Category Filter
    if (selectedCategory && (req.product_category || "Outros") !== selectedCategory) return false;
    
    // 2. Price Filter
    if (selectedPrice) {
      if (selectedPrice === "ate-100" && req.target_price_cents > 10000) return false;
      if (selectedPrice === "100-500" && (req.target_price_cents <= 10000 || req.target_price_cents > 50000)) return false;
      if (selectedPrice === "mais-500" && req.target_price_cents <= 50000) return false;
    }

    // 3. Quality Filter (Now struct db field)
    if (selectedQuality) {
      const condition = (req.product_condition || "não informado").toLowerCase();
      if (condition !== selectedQuality.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 mb-2 lg:mb-0">
        <div className="bg-white rounded-xl border border-meli-border shadow-sm sticky top-24 overflow-hidden">
          
          <div className="p-5 border-b border-meli-border bg-[#f5f5f5]">
            <h2 className="text-xl font-bold text-meli-dark">Filtrar por</h2>
            {(selectedCategory || selectedPrice || selectedQuality) && (
              <button 
                onClick={() => { setSelectedCategory(null); setSelectedPrice(null); setSelectedQuality(null); setOpenSections({category: false, price: false, quality: false}); }}
                className="text-xs text-meli-blue font-semibold mt-2 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
          
          <div className="p-2">
            {/* Categorias */}
            <div className="border-b border-meli-border last:border-0">
              <button 
                onClick={() => toggleSection("category")}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-meli-bg transition-colors rounded-lg"
              >
                <span className="font-semibold text-meli-dark tracking-wide">Categorias</span>
                <svg className={`w-5 h-5 text-meli-gray transition-transform duration-200 ${openSections.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {openSections.category && (
                <div className="px-3 pb-4 pt-1 max-h-64 overflow-y-auto">
                  <ul className="space-y-3">
                    <li>
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`text-sm text-left transition-colors font-medium ${!selectedCategory ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}`}
                      >
                        Todas as categorias
                      </button>
                    </li>
                    {categories.map(cat => (
                      <li key={cat}>
                        <button 
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-sm text-left transition-colors font-medium ${selectedCategory === cat ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Preço */}
            <div className="border-b border-meli-border last:border-0">
              <button 
                onClick={() => toggleSection("price")}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-meli-bg transition-colors rounded-lg"
              >
                <span className="font-semibold text-meli-dark tracking-wide">Preço</span>
                <svg className={`w-5 h-5 text-meli-gray transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {openSections.price && (
                <div className="px-3 pb-4 pt-1">
                  <ul className="space-y-3 text-sm font-medium">
                    <li><button onClick={() => setSelectedPrice(null)} className={!selectedPrice ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Qualquer preço</button></li>
                    <li><button onClick={() => setSelectedPrice("ate-100")} className={selectedPrice === "ate-100" ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Até R$ 100</button></li>
                    <li><button onClick={() => setSelectedPrice("100-500")} className={selectedPrice === "100-500" ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>R$ 100 a R$ 500</button></li>
                    <li><button onClick={() => setSelectedPrice("mais-500")} className={selectedPrice === "mais-500" ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Mais de R$ 500</button></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Qualidade (Condição) */}
            <div className="border-b border-meli-border last:border-0">
              <button 
                onClick={() => toggleSection("quality")}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-meli-bg transition-colors rounded-lg"
              >
                <span className="font-semibold text-meli-dark tracking-wide">Condição Aceita</span>
                <svg className={`w-5 h-5 text-meli-gray transition-transform duration-200 ${openSections.quality ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {openSections.quality && (
                <div className="px-3 pb-4 pt-1">
                  <ul className="space-y-3 text-sm font-medium">
                    <li><button onClick={() => setSelectedQuality(null)} className={!selectedQuality ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Qualquer condição</button></li>
                    <li><button onClick={() => setSelectedQuality("novo")} className={selectedQuality === "novo" ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Novo</button></li>
                    <li><button onClick={() => setSelectedQuality("usado")} className={selectedQuality === "usado" ? "text-meli-blue" : "text-meli-dark/70 hover:text-meli-blue"}>Usado</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center bg-white p-6 sm:p-8 rounded-2xl border border-meli-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-meli-yellow/20 rounded-full blur-3xl -tr -mt-20 -mr-20"></div>
          <div className="relative z-10 w-2/3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-meli-dark mb-2 tracking-tight">
              Mural de Pedidos
            </h1>
            <p className="text-meli-gray text-base sm:text-lg">Encontre compradores procurando o que você tem para vender.</p>
          </div>
          <Link href="/request/new" className="relative z-10 bg-meli-blue hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-sm text-sm sm:text-base text-center whitespace-nowrap">
            Criar Pedido
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-full text-center py-12 text-meli-gray font-medium">Carregando pedidos...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-meli-border border-dashed">
              <p className="text-meli-gray font-medium text-lg mb-2">Nenhum pedido encontrado com esses filtros.</p>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedPrice(null);
                  setSelectedQuality(null);
                }}
                className="mt-2 flex items-center bg-meli-bg hover:bg-gray-200 text-meli-dark px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredRequests.map(req => (
              <Link href={`/request/${req.id}`} key={req.id}>
                <div className="bg-white border border-meli-border rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-meli-dark group-hover:text-meli-blue transition-colors leading-tight">
                        {req.title}
                      </h3>
                      <span className="bg-[#f5f5f5] text-meli-gray text-[10px] px-2 py-1 rounded-md border border-meli-border uppercase tracking-wider font-extrabold whitespace-nowrap ml-3">
                        {req.product_category || "Outros"}
                      </span>
                      <span className="bg-meli-blue/10 text-meli-blue text-[10px] px-2 py-1 rounded-md border border-meli-blue/20 uppercase tracking-wider font-extrabold whitespace-nowrap ml-2">
                        {req.product_condition || "Não informado"}
                      </span>
                    </div>
                    <p className="text-meli-dark/75 text-sm line-clamp-3 mb-4 leading-relaxed">{req.description}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-meli-border">
                    <span className="text-xs text-meli-gray font-semibold">
                      {new Date(req.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-meli-gray uppercase tracking-wider font-extrabold mb-0.5">Orçamento Alvo</p>
                      <p className="text-green-600 font-extrabold text-xl leading-none">{formatCurrency(req.target_price_cents)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
