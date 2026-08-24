import { useState, useEffect, useCallback } from 'react';
import { ALBUMES } from '../data/galeriaData';

// ── Lightbox ───────────────────────────────────────────────────────────────────
function Lightbox({ album, fotoIndex, onClose, onPrev, onNext }) {
  const foto = album.fotos[fotoIndex];
  const total = album.fotos.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-sm px-4 py-1.5 rounded-full font-semibold">
        {fotoIndex + 1} / {total}
      </div>

      {/* Album title */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 text-center">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">{album.titulo}</p>
      </div>

      {/* Prev button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
        aria-label="Foto anterior"
      >
        <span className="material-symbols-outlined text-3xl">chevron_left</span>
      </button>

      {/* Image */}
      <div className="max-w-5xl max-h-[80vh] mx-16 flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <img
          key={foto.id}
          src={foto.url}
          alt={foto.titulo}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      </div>

      {/* Next button */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
        aria-label="Foto siguiente"
      >
        <span className="material-symbols-outlined text-3xl">chevron_right</span>
      </button>

      {/* Caption */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center max-w-lg px-4">
        <p className="text-white font-semibold text-sm">{foto.titulo}</p>
        {foto.descripcion && (
          <p className="text-white/50 text-xs mt-1">{foto.descripcion}</p>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-1 max-w-xl overflow-x-auto px-4 py-2">
        {album.fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={(e) => { e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); onPrev(); onNext(); }}
            className={`w-10 h-10 rounded flex-shrink-0 overflow-hidden border-2 transition-all ${
              i === fotoIndex ? 'border-secondary scale-110' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img src={f.thumb} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tarjeta de álbum ───────────────────────────────────────────────────────────
function AlbumCard({ album, onOpen }) {
  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-100"
      onClick={() => onOpen(album, 0)}
    >
      {/* Portada con grid preview */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={album.portada}
          alt={album.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badge categoría */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            album.categoria === 'Torneo' ? 'bg-secondary text-white' : 'bg-blue-600 text-white'
          }`}>
            {album.categoria}
          </span>
          {album.resultado && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800">
              {album.resultado}
            </span>
          )}
        </div>

        {/* Cantidad de fotos */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 text-white px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
          <span className="material-symbols-outlined text-[14px]">photo_library</span>
          {album.fotos.length} fotos
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center border-2 border-white/60">
            <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
          </div>
        </div>

        {/* Info en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight">{album.titulo}</h3>
          <div className="flex items-center gap-2 mt-1 text-white/70 text-xs">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {album.fecha}
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            {album.lugar}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="p-5">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{album.descripcion}</p>
        <button className="mt-3 text-secondary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
          Ver álbum completo
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ── Vista interna de álbum (grid de fotos) ─────────────────────────────────────
function AlbumView({ album, onBack, onOpenLightbox }) {
  return (
    <div>
      {/* Header del álbum */}
      <div className="bg-primary-container py-12 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary rounded-full blur-[80px]" />
        </div>
        <div className="max-w-[1280px] mx-auto relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver a la Galería
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              album.categoria === 'Torneo' ? 'bg-secondary text-white' : 'bg-blue-600 text-white'
            }`}>
              {album.categoria}
            </span>
            {album.resultado && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                {album.resultado}
              </span>
            )}
          </div>
          <h1 className="font-headline-lg text-headline-lg text-white mb-2">{album.titulo}</h1>
          <p className="text-blue-200 text-sm max-w-xl">{album.descripcion}</p>
          <div className="flex items-center gap-4 mt-4 text-blue-300 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {album.fecha}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {album.lugar}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">photo_library</span>
              {album.fotos.length} fotos
            </span>
          </div>
        </div>
      </div>

      {/* Grid masonry-like */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {album.fotos.map((foto, i) => (
            <div
              key={foto.id}
              className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-lg transition-shadow"
              onClick={() => onOpenLightbox(i)}
            >
              <img
                src={foto.thumb}
                alt={foto.titulo}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-400"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">zoom_in</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Página principal de Galería ────────────────────────────────────────────────
export default function Galeria() {
  const [albumActivo, setAlbumActivo] = useState(null);
  const [lightboxFoto, setLightboxFoto] = useState(null); // índice de la foto

  const handleOpenAlbum = useCallback((album) => {
    setAlbumActivo(album);
    setLightboxFoto(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenLightbox = useCallback((index) => {
    setLightboxFoto(index);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxFoto(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxFoto === null || !albumActivo) return;
    setLightboxFoto(prev => (prev === 0 ? albumActivo.fotos.length - 1 : prev - 1));
  }, [lightboxFoto, albumActivo]);

  const handleNext = useCallback(() => {
    if (lightboxFoto === null || !albumActivo) return;
    setLightboxFoto(prev => (prev === albumActivo.fotos.length - 1 ? 0 : prev + 1));
  }, [lightboxFoto, albumActivo]);

  return (
    <div className="bg-background min-h-screen font-body-md">

      {/* Vista de álbum individual */}
      {albumActivo ? (
        <AlbumView
          album={albumActivo}
          onBack={() => { setAlbumActivo(null); setLightboxFoto(null); }}
          onOpenLightbox={handleOpenLightbox}
        />
      ) : (
        <>
          {/* Hero de galería */}
          <div className="bg-primary-container relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-secondary rounded-full blur-[100px]" />
            </div>
            <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-secondary inline-block" />
                <span className="font-caption text-caption text-secondary uppercase tracking-widest">Momentos Inolvidables</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-primary mb-4 leading-tight">
                Galería Multimedia
              </h1>
              <p className="font-body-lg text-body-lg text-blue-200 max-w-xl">
                Revive los mejores momentos de torneos, entrenamientos y eventos del club.
              </p>
              <p className="text-blue-300 text-sm mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                {ALBUMES.reduce((acc, a) => acc + a.fotos.length, 0)} fotos en {ALBUMES.length} álbumes
              </p>
            </div>
          </div>

          {/* Grid de álbumes */}
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ALBUMES.map(album => (
                <AlbumCard key={album.id} album={album} onOpen={handleOpenAlbum} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxFoto !== null && albumActivo && (
        <Lightbox
          album={albumActivo}
          fotoIndex={lightboxFoto}
          onClose={handleCloseLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
