import { Property, PropertyType } from './types';

export const BROKER_PHONE_NUMBER = "5585981211819";

/* 
  COMO PREENCHER SUA BASE DE DADOS:
  
  1. IMAGENS: Use links de imagens hospedadas (pode ser do seu site, imgur, ou bucket).
  2. YOUTUBE: Pegue apenas o código final do link. 
     Exemplo: Se o link é https://www.youtube.com/watch?v=ABC12345, o ID é "ABC12345".
  3. MAPA: Vá no Google Maps, ache o local, clique em "Compartilhar" e "Copiar Link".
*/

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '101',
    title: 'Residencial Exemplo Real',
    price: 190000,
    type: PropertyType.APARTMENT,
    location: 'Centro, Fortaleza',
    description: 'Apartamento ventilado, próximo a escolas e supermercados.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    bedrooms: 2,
    bathrooms: 1,
    size: 55,
    youtubeVideoId: '', // Cole o ID do vídeo aqui se tiver
    googleMapsLink: 'https://goo.gl/maps/exemplo'
  },
  {
    id: '102',
    title: 'Casa Verde e Amarela',
    price: 250000,
    type: PropertyType.HOUSE,
    location: 'Eusébio, CE',
    description: 'Casa em condomínio fechado com segurança 24h.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    bedrooms: 3,
    bathrooms: 2,
    size: 89,
    youtubeVideoId: '', 
    googleMapsLink: ''
  },
  // COPIE E COLE O BLOCO ACIMA PARA ADICIONAR MAIS IMÓVEIS
];