export interface UserData {
  name: string;
  phone: string;
  income: number;
  propertyValue?: number;
}

export enum PropertyType {
  APARTMENT = 'Apartamento',
  HOUSE = 'Casa',
  STUDIO = 'Studio'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  type: PropertyType;
  location: string;
  images: string[]; 
  bedrooms: number;
  bathrooms: number;
  size: number; // m²
  
  // Novos campos para sua base de dados real
  youtubeVideoId?: string; // Apenas o código do vídeo (ex: dQw4w9WgXcQ)
  googleMapsLink?: string; // Link copiado do Google Maps
  description?: string; // Uma descrição curta do imóvel
}

export interface SimulationResult {
  maxFinancing: number;
  maxInstallment: number;
  eligibleProperties: Property[];
  isSpecificSimulation?: boolean; 
  targetPropertyValue?: number;   
}