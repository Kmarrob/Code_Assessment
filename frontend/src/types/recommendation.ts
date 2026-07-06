// frontend/src/types/recommendation.ts

export interface Recommendation {
  _id: string;
  controlId: string;
  controlObjectId: string;
  titulo: string;
  dominio: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationWithResponse {
  controlId: string;
  titulo: string;
  dominio: string;
  status: string;
  cenarioIdentificado: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
  maturityLevel: number;
}

export interface CreateRecommendationData {
  controlId: string;
  titulo: string;
  dominio: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
}

export interface UpdateRecommendationData {
  titulo?: string;
  dominio?: string;
  recomendacoes?: string[];
  solucoesTecnicas?: string[];
}

export interface RecommendationListResponse {
  recommendations: Recommendation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}