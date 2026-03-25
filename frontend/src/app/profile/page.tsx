"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  cpf?: string;
  zipcode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [userState, setUserState] = useState("");
  const [states, setStates] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<{nome: string}[]>([]);
  const [cpf, setCpf] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    
    // Fetch profile
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        if (data.zipcode) setZipcode(data.zipcode);
        if (data.street) setStreet(data.street);
        if (data.number) setNumber(data.number);
        if (data.complement) setComplement(data.complement);
        if (data.neighborhood) setNeighborhood(data.neighborhood);
        if (data.city) setCity(data.city);
        if (data.state) setUserState(data.state);
        
        let initialCpf = data.cpf || "";
        if (initialCpf.length === 11) {
            initialCpf = `${initialCpf.slice(0, 3)}.${initialCpf.slice(3, 6)}.${initialCpf.slice(6, 9)}-${initialCpf.slice(9)}`;
        }
        setCpf(initialCpf);
      })
      .catch(err => console.error("Error fetching profile", err));
  }, [router]);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(res => res.json())
      .then(data => setStates(data.map((st: any) => ({ sigla: st.sigla, nome: st.nome }))))
      .catch(err => console.error("Erro ao carregar estados", err));
  }, []);

  useEffect(() => {
    if (!userState) {
        setCities([]);
        return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${userState}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCities(data.map((c: any) => ({ nome: c.nome }))))
      .catch(err => console.error("Erro ao carregar cidades", err));
  }, [userState]);

  const handleZipcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, ''); 
    if (rawValue.length > 8) rawValue = rawValue.slice(0, 8); 

    let formatted = rawValue;
    if (rawValue.length > 5) {
      formatted = `${rawValue.slice(0, 5)}-${rawValue.slice(5)}`;
    }
    setZipcode(formatted);

    // Auto-fill Viacep
    if (rawValue.length === 8) {
       try {
          const res = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
          const data = await res.json();
          if (!data.erro) {
             setStreet(data.logradouro || "");
             setNeighborhood(data.bairro || "");
             setCity(data.localidade || "");
             setUserState(data.uf || "");
          }
       } catch (err) {
          console.error("Erro ao buscar CEP", err);
       }
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, ''); 
    if (rawValue.length > 11) rawValue = rawValue.slice(0, 11); 

    let formatted = rawValue;
    if (rawValue.length > 3) formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3)}`;
    if (rawValue.length > 6) formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6)}`;
    if (rawValue.length > 9) formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6, 9)}-${rawValue.slice(9)}`;
    
    setCpf(formatted);
  };

  const getRawCpf = () => cpf.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!profile) return;
    
    const rawCpf = getRawCpf();
    if (rawCpf.length !== 11) {
       setError("O CPF deve conter exatamente 11 dígitos.");
       return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/${profile.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           zipcode, 
           street, 
           number, 
           complement, 
           neighborhood, 
           city,
           state: userState,
           cpf: rawCpf 
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
         if (Array.isArray(resData.detail)) {
             throw new Error(resData.detail[0].msg);
         }
         throw new Error(resData.detail || "Erro ao atualizar o perfil");
      }
      
      setMessage("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!profile) return <div className="text-center mt-20 text-meli-dark font-medium">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-6">
      <h1 className="text-2xl font-bold text-meli-dark px-2">Meu perfil</h1>

      {/* Account Info Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-meli-border shadow-sm">
        <h2 className="text-xl text-meli-dark font-semibold mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-meli-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Dados da Conta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
           <div>
              <p className="text-xs font-semibold text-meli-gray tracking-wider uppercase mb-1">Nome Completo</p>
              <p className="text-meli-dark font-medium text-base">{profile.name}</p>
           </div>
           <div>
              <p className="text-xs font-semibold text-meli-gray tracking-wider uppercase mb-1">E-mail</p>
              <p className="text-meli-dark font-medium text-base">{profile.email}</p>
           </div>
           <div>
              <p className="text-xs font-semibold text-meli-gray tracking-wider uppercase mb-1">Telefone</p>
              <p className="text-meli-dark font-medium text-base">{profile.phone_number}</p>
           </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-meli-border shadow-sm">
        <h2 className="text-xl text-meli-dark font-semibold mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-meli-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Endereço de Entrega
        </h2>
        
        {message && <div className="p-4 mb-6 text-sm text-green-800 border-l-4 border-green-500 bg-green-50 rounded-r-md font-medium">{message}</div>}
        {error && <div className="p-4 mb-6 text-sm text-red-800 border-l-4 border-red-500 bg-red-50 rounded-r-md font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="md:w-1/2">
            <label className="block text-sm font-semibold text-meli-dark mb-1">CPF Oficial</label>
            <input 
              type="text" required value={cpf} onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
            />
            <p className="text-xs text-meli-gray mt-1">Necessário para emissão de notas fiscais.</p>
          </div>
          
          <div className="pt-4 border-t border-meli-border"></div>

          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-meli-dark mb-1">CEP</label>
            <input 
              type="text" required value={zipcode} onChange={handleZipcodeChange}
              placeholder="00000-000"
              className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-3">
               <label className="block text-sm font-semibold text-meli-dark mb-1">Logradouro / Rua</label>
               <input 
                 type="text" required value={street} onChange={(e) => setStreet(e.target.value)}
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-meli-dark mb-1">Número</label>
               <input 
                 type="text" required value={number} onChange={(e) => setNumber(e.target.value)}
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
               />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-meli-dark mb-1">Complemento</label>
               <input 
                 type="text" value={complement} onChange={(e) => setComplement(e.target.value)}
                 placeholder="Opcional (Apto, Bloco, etc)"
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-meli-dark mb-1">Bairro</label>
               <input 
                 type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50"
               />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-meli-dark mb-1">Estado (UF)</label>
               <select 
                 required 
                 value={userState} 
                 onChange={(e) => {
                    setUserState(e.target.value);
                    if (e.target.value !== userState) setCity("");
                 }}
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50 appearance-none"
               >
                 <option value="" disabled>Selecione um Estado</option>
                 {states.map(st => (
                    <option key={st.sigla} value={st.sigla}>{st.nome} ({st.sigla})</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-semibold text-meli-dark mb-1">Cidade</label>
               <input 
                 list="cidades-list"
                 type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                 disabled={!userState}
                 placeholder={userState ? "Digite para pesquisar a cidade" : "Selecione o estado primeiro"}
                 className="w-full bg-meli-bg border-none rounded-md px-4 py-3 text-meli-dark transition-all focus:outline-none focus:ring-2 focus:ring-meli-blue/50 disabled:opacity-50 disabled:cursor-not-allowed"
               />
               <datalist id="cidades-list">
                 {cities.map((c, i) => (
                    <option key={i} value={c.nome} />
                 ))}
               </datalist>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button 
               type="submit" 
               className="bg-meli-blue hover:bg-blue-600 px-8 py-3 rounded-md text-sm font-bold text-white transition-colors shadow-sm"
             >
               Salvar Endereço
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
