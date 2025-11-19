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
  size: number; 
  
  youtubeVideoId?: string;
  googleMapsLink?: string;
  description?: string;
}

export interface SimulationResult {
  maxFinancing: number;
  maxInstallment: number;
  eligibleProperties: Property[];
  isSpecificSimulation?: boolean; 
  targetPropertyValue?: number;   
}