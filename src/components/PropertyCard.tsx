import React, { useState } from 'react';
import { Property } from '../types';
import { UserData } from '../types';
import { generateWhatsAppLink } from '../services/whatsappService';
import { formatCurrency } from '../utils/formatting';
import { MapPin, Bed, Bath, Ruler, Video, Image as ImageIcon, Map as MapIcon, ExternalLink, ChevronLeft, ChevronRight, PlayCircle, ImageOff } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  userData: UserData;
  monthlyInstallment: number;
}

type TabView = 'photos' | 'map' | 'video';

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, userData, monthlyInstallment }) => {
  const [activeTab, setActiveTab] = useState<TabView>('photos');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);

  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink(userData, property);
    window.open(link, '_blank');
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 0) {
      setImgError(false); // Reset error state for new image
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 0) {
      setImgError(false); // Reset error state for new image
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  };

  // Verifica se a imagem atual é válida antes de renderizar
  const currentImageSrc = property.images[currentImageIndex];
  const isInvalidSrc = !currentImageSrc || currentImageSrc.startsWith('sandbox:') || currentImageSrc.startsWith('file:');

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-slate-200 flex flex-col h-full">
      {/* Media Section */}
      <div className="relative h-56 bg-slate-100 group">
        {activeTab === 'photos' && (
          <>
            {!imgError && !isInvalidSrc ? (
                <img 
                src={currentImageSrc} 
                alt={`${property.title}`} 
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-400">
                    <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Imagem indisponível</span>
                </div>
            )}
            
            {property.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-orange-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-orange-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={20} />
                </button>
                
                {/* Image Counter Badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </>
        )}
        
        {activeTab === 'map' && (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 flex-col gap-4 p-6 text-center">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-1">{property.location}</p>
              {property.googleMapsLink ? (
                <a 
                  href={property.googleMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  Ver localização exata <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-xs text-slate-400">Localização exata indisponível</span>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'video' && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            {property.youtubeVideoId ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${property.youtubeVideoId}`} 
                title={property.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center text-slate-400 p-4">
                <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Vídeo não disponível para este imóvel.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="absolute top-3 left-3 bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 pointer-events-none">
          {property.type}
        </div>

        {/* Tabs Controller */}
        <div className="absolute bottom-3 right-3 flex space-x-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm z-10">
          <button 
            onClick={() => setActiveTab('photos')}
            className={`p-1.5 rounded ${activeTab === 'photos' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Fotos"
          >
            <ImageIcon size={18} />
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`p-1.5 rounded ${activeTab === 'map' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Localização"
          >
            <MapIcon size={18} />
          </button>
          {property.youtubeVideoId && (
            <button 
              onClick={() => setActiveTab('video')}
              className={`p-1.5 rounded ${activeTab === 'video' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Vídeo"
            >
              <PlayCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-blue-900 leading-tight">{property.title}</h3>
          <div className="flex items-center text-slate-500 mt-1 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-orange-500" />
            <span>{property.bedrooms} <span className="text-xs">Qtos</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-orange-500" />
            <span>{property.bathrooms} <span className="text-xs">Banh</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="w-4 h-4 text-orange-500" />
            <span>{property.size}m²</span>
          </div>
        </div>

        {property.description && (
            <div className="mb-3 group/desc relative">
                <p 
                    className={`text-xs text-slate-500 transition-all duration-300 ${expandedDesc ? '' : 'line-clamp-2'}`}
                    title={!expandedDesc ? "Passe o mouse para ver mais" : ""}
                >
                    {property.description}
                </p>
                
                {/* Mostra botão se o texto for longo (+90 caracteres). 
                    Desktop: Opacidade 0 -> 100 no hover. 
                    Mobile: Sempre visível (opacidade 100). */}
                {property.description.length > 90 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDesc(!expandedDesc);
                        }}
                        className={`text-xs font-bold text-orange-600 mt-1 hover:underline focus:outline-none transition-opacity duration-200
                             ${!expandedDesc ? 'lg:opacity-0 lg:group-hover/desc:opacity-100 opacity-100' : 'opacity-100'}
                        `}
                    >
                        {expandedDesc ? 'Ler menos' : 'Ler mais...'}
                    </button>
                )}
            </div>
        )}

        <div className="border-t border-dashed border-slate-200 my-3"></div>

        <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Valor do Imóvel</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(property.price)}</p>
            <div className="mt-1 flex justify-between items-center text-sm">
                <span className="text-slate-600">Parcelas estimadas:</span>
                <span className="font-semibold text-orange-700">~ {formatCurrency(monthlyInstallment)}</span>
            </div>
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 brightness-0 invert" />
            Tenho Interesse
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};