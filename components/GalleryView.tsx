
import React, { useState } from 'react';

interface GalleryViewProps {
  images: string[];
}

const GalleryView: React.FC<GalleryViewProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="p-8 md:p-12 text-center max-w-2xl mx-auto">
        <div className="text-8xl mb-6">🖼️</div>
        <h2 className="text-3xl font-bold font-outfit text-gray-800 mb-4">Sua Galeria está vazia!</h2>
        <p className="text-gray-500 leading-relaxed">
          Complete os desafios diários, tire fotos dos seus desenhos bíblicos e eles aparecerão aqui como um lindo museu!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold font-outfit text-gray-800">Minha Galeria de Fé</h2>
        <p className="text-gray-500">Toque em um desenho para vê-lo bem grande!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedImage(img)}
            className="group relative aspect-[3/4] bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all border-4 border-white cursor-pointer"
          >
            <img src={img} alt={`Desenho ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white font-bold text-xs">Ver Obra #{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white text-4xl">✕</button>
          <img 
            src={selectedImage} 
            className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="Desenho ampliado"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default GalleryView;
