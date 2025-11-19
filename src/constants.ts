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
    id: 'gran-village-sol-1',
    title: 'Gran Village do Sol I',
    price: 210000,
    type: PropertyType.APARTMENT,
    location: 'Lagoa Redonda, Fortaleza - CE',
    description: 'Viva perto da natureza e aqueça seus dias. Condomínio fechado com piscinas adulto e infantil, salão de festas, beach tennis, churrasqueira e playground. Subsídio Minha Casa Minha Vida.',
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Piscina / Lazer
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Fachada / Condomínio
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Sala de Estar
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Quarto
      'https://images.unsplash.com/photo-1599695367380-7ff5c93d7393?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'  // Playground
    ],
    bedrooms: 2,
    bathrooms: 1,
    size: 41,
    youtubeVideoId: '', 
    googleMapsLink: 'https://maps.app.goo.gl/example'
  }
];