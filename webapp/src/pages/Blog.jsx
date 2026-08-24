import { useState } from 'react';
import { BLOG_POSTS, CATEGORIAS } from '../data/blogData';

// ── Modal de artículo ──────────────────────────────────────────────────────────
function ArticuloModal({ post, onClose }) {
  if (!post) return null;
  const cat = CATEGORIAS[post.categoria];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen hero del artículo */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={post.imagen}
            alt={post.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="absolute bottom-4 left-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cat.bg}`}>
              {cat.label}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {post.fecha}
            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
            <span className="material-symbols-outlined text-[16px]">person</span>
            {post.autor}
            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {post.tiempoLectura}
          </div>

          <h1 className="font-headline-lg text-headline-lg text-primary mb-6 leading-tight">
            {post.titulo}
          </h1>

          <div className="space-y-4">
            {post.contenido.map((parr, i) => (
              <p key={i} className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {parr}
              </p>
            ))}
          </div>

          {/* Footer del modal */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                {post.autor.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-primary text-sm">{post.autor}</p>
                <p className="text-xs text-gray-400">Entrenador — Club Pito Pérez</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
            >
              Cerrar ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de artículo ────────────────────────────────────────────────────────
function BlogCard({ post, onRead, index }) {
  const cat = CATEGORIAS[post.categoria];
  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col"
      style={{ transitionDelay: `${index * 60}ms` }}
      onClick={() => onRead(post)}
    >
      {/* Imagen */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={post.imagen}
          alt={post.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Category badge */}
        <span className={`absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cat.bg}`}>
          {cat.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="material-symbols-outlined text-[14px] text-secondary">calendar_today</span>
          {post.fecha}
          <span className="w-1 h-1 rounded-full bg-gray-200 inline-block" />
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {post.tiempoLectura}
        </div>

        <h2 className="font-headline-md text-headline-md text-primary mb-3 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
          {post.titulo}
        </h2>

        <p className="font-body-md text-body-md text-on-surface-variant text-sm leading-relaxed line-clamp-3 flex-grow">
          {post.extracto}
        </p>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-[10px]">
              {post.autor.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <span className="text-xs font-semibold text-gray-600">{post.autor}</span>
          </div>
          <span className="text-secondary font-label-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
            Leer más
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Página principal del Blog ──────────────────────────────────────────────────
export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const categoriasFiltro = [
    { key: 'todos', label: 'Todos' },
    { key: 'torneos', label: 'Torneos' },
    { key: 'noticias', label: 'Noticias' },
    { key: 'tecnica', label: 'Técnica' },
    { key: 'club', label: 'Club' },
  ];

  const postsFiltrados = filtro === 'todos'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.categoria === filtro);

  return (
    <div className="bg-background min-h-screen font-body-md">
      {/* Hero del blog */}
      <div className="bg-primary-container relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-secondary rounded-full blur-[100px]" />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-0.5 bg-secondary inline-block" />
            <span className="font-caption text-caption text-secondary uppercase tracking-widest">Noticias y Contenido</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-primary mb-4 leading-tight">
            Blog del Club
          </h1>
          <p className="font-body-lg text-body-lg text-blue-200 max-w-xl">
            Torneos, técnica, noticias del club y todo lo que necesitas para crecer como jugadora de voleibol.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-3 flex gap-2 overflow-x-auto">
          {categoriasFiltro.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFiltro(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filtro === cat.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de artículos */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        {postsFiltrados.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-6xl block mb-3">article</span>
            <p>No hay artículos en esta categoría aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsFiltrados.map((post, i) => (
              <BlogCard key={post.id} post={post} onRead={setSelectedPost} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Modal del artículo */}
      {selectedPost && (
        <ArticuloModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
