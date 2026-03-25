"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StarRating from "@/components/StarRating";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  city?: string;
  state?: string;
  average_rating: number;
  total_reviews: number;
}

interface Review {
  id: number;
  request_id: number;
  reviewer_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/${id}`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/reviews/user/${id}`).then(res => res.json())
    ])
    .then(([userData, reviewsData]) => {
      setProfile(userData);
      // sort reviews by newest
      setReviews(Array.isArray(reviewsData) ? reviewsData.sort((a: any,b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
    })
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="p-10 text-center text-meli-gray">Carregando perfil...</div>;
  if (!profile || (profile as any).detail) return <div className="p-10 text-center text-meli-gray">Usuário não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      {/* Profile Header */}
      <div className="bg-white border border-meli-border rounded-2xl p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 bg-meli-bg rounded-full border border-meli-border flex items-center justify-center text-5xl text-meli-blue font-bold uppercase shrink-0 shadow-sm">
          {profile.name[0]}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-meli-dark mb-2">{profile.name}</h1>
          <p className="text-meli-gray mb-4">Membro da plataforma</p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 bg-meli-bg p-4 rounded-xl border border-meli-border inline-flex">
            <div>
              <p className="text-sm text-meli-gray uppercase tracking-wider font-bold mb-1 border-b border-meli-border/50 pb-1">Reputação</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-meli-dark">{profile.average_rating ? profile.average_rating.toFixed(1) : "0.0"}</span>
                <div>
                   <StarRating rating={Math.round(profile.average_rating || 0)} readOnly size={24} />
                   <span className="text-xs text-meli-gray mt-1 block">{profile.total_reviews} avaliações</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-meli-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-meli-border bg-meli-bg">
          <h2 className="text-xl font-bold text-meli-dark">Avaliações e Comentários</h2>
        </div>
        <div className="p-6 divide-y divide-meli-border">
          {reviews.length === 0 ? (
            <p className="text-meli-gray text-center py-8">Este usuário ainda não possui avaliações.</p>
          ) : (
             reviews.map((review) => (
                <div key={review.id} className="py-6 first:pt-2 last:pb-2">
                   <div className="flex items-start justify-between mb-3">
                      <StarRating rating={review.rating} readOnly size={18} />
                      <span className="text-xs text-meli-gray font-medium">{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                   </div>
                   {review.comment ? (
                      <p className="text-meli-dark/80 bg-gray-50 border border-gray-100 p-4 rounded-lg text-sm">{review.comment}</p>
                   ) : (
                      <p className="text-meli-gray italic text-sm">Sem comentário adicional.</p>
                   )}
                </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
