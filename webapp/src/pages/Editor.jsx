import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ── Modal de Confirmación de Eliminación (universal) ───────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, titulo, mensaje, loading }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{titulo || '¿Estás seguro?'}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">{mensaje}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading
              ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-[16px]">delete</span>}
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast de Notificación ──────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
  const icons  = { success: 'check_circle', error: 'error', info: 'info' };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl text-sm font-semibold ${styles[type]}`}>
      <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

// ── Categorías ─────────────────────────────────────────────────────────────────
const CAT_BLOG = {
  torneos:  { label: 'Torneos',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
  noticias: { label: 'Noticias', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  tecnica:  { label: 'Técnica',  color: 'bg-green-100 text-green-700 border-green-200' },
  club:     { label: 'Club',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
};
const CAT_GALERIA = ['Club', 'Torneo', 'Entrenamiento', 'Evento', 'Otro'];

function calcReadTime(content) {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PESTAÑA BLOG ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function BlogTab({ showToast }) {
  const fileRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const FORM_INIT = {
    titulo: '', categoria: 'noticias', autor: '',
    fecha: new Date().toISOString().split('T')[0],
    extracto: '', contenido: '', imagen_url: '', publicado: true,
  };
  const [form, setForm] = useState(FORM_INIT);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoadingPosts(false);
  };

  const openNew  = () => { setForm(FORM_INIT); setEditingPost({}); };
  const openEdit = (post) => {
    setForm({
      titulo: post.titulo, categoria: post.categoria, autor: post.autor,
      fecha: post.fecha, extracto: post.extracto || '', contenido: post.contenido,
      imagen_url: post.imagen_url || '', publicado: post.publicado !== false,
    });
    setEditingPost(post);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Imagen muy grande (máx. 5 MB).', 'error'); return; }
    setUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('blog-imagenes').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('blog-imagenes').getPublicUrl(path);
      setForm(f => ({ ...f, imagen_url: urlData.publicUrl }));
      showToast('Imagen subida.', 'success');
    } else { showToast('Error al subir imagen.', 'error'); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim() || !form.autor.trim()) {
      showToast('Completa Título, Autor y Contenido.', 'error'); return;
    }
    setSaving(true);
    const payload = { ...form, tiempo_lectura: calcReadTime(form.contenido) };
    const { error } = editingPost?.id
      ? await supabase.from('blog_posts').update(payload).eq('id', editingPost.id)
      : await supabase.from('blog_posts').insert(payload);
    setSaving(false);
    if (error) { showToast('Error al guardar: ' + error.message, 'error'); return; }
    showToast(editingPost?.id ? 'Artículo actualizado.' : 'Artículo publicado.', 'success');
    setEditingPost(null);
    loadPosts();
  };

  const handleDelete = async () => {
    if (!deleteModal?.post) return;
    setDeleteModal(d => ({ ...d, loading: true }));
    const post = deleteModal.post;
    if (post.imagen_url?.includes('/blog-imagenes/')) {
      const path = decodeURIComponent(post.imagen_url.split('/blog-imagenes/')[1]?.split('?')[0]);
      if (path) await supabase.storage.from('blog-imagenes').remove([path]);
    }
    await supabase.from('blog_posts').delete().eq('id', post.id);
    setDeleteModal(null);
    showToast('Artículo eliminado.', 'info');
    loadPosts();
  };

  // ─ Vista: Editor ─
  if (editingPost !== null) {
    return (
      <div className="space-y-5 pb-8">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <button onClick={() => setEditingPost(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </button>
          <div>
            <h2 className="font-bold text-gray-900">{editingPost?.id ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
            <p className="text-xs text-gray-500">Los cambios se publican de forma inmediata.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Título *</label>
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Título del artículo..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 focus:border-[#001f3f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Resumen (extracto)</label>
              <textarea value={form.extracto} onChange={e => setForm(f => ({ ...f, extracto: e.target.value }))}
                placeholder="Breve descripción que aparece en la lista del blog..."
                rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contenido *</label>
              <p className="text-[11px] text-gray-500 mb-1.5">Separa cada párrafo con una línea en blanco.</p>
              <textarea value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
                placeholder={"Escribe el contenido aquí...\n\nSepara los párrafos con una línea en blanco."}
                rows={14} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 resize-y font-mono leading-relaxed" />
              <p className="text-[11px] text-gray-400 mt-1">Tiempo estimado: <strong>{calcReadTime(form.contenido)}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Imagen de portada</label>
              <div className="flex gap-2">
                <input value={form.imagen_url} onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                  placeholder="https://... (URL de imagen)"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50">
                  {uploading
                    ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    : <span className="material-symbols-outlined text-[16px]">upload</span>}
                  Subir
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
              </div>
              {form.imagen_url && (
                <div className="mt-2 relative group">
                  <img src={form.imagen_url} alt="Preview" className="w-full h-44 object-cover rounded-xl border border-gray-200" />
                  <button onClick={() => setForm(f => ({ ...f, imagen_url: '' }))}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Configuración</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado</span>
                <button onClick={() => setForm(f => ({ ...f, publicado: !f.publicado }))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${form.publicado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                  <span className="material-symbols-outlined text-[14px]">{form.publicado ? 'visibility' : 'visibility_off'}</span>
                  {form.publicado ? 'Publicado' : 'Borrador'}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Categoría</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 bg-white">
                  {Object.entries(CAT_BLOG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Autor *</label>
                <input value={form.autor} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))}
                  placeholder="Nombre del autor"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Fecha de publicación</label>
                <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
              {saving ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-[18px]">save</span>}
              {saving ? 'Guardando...' : (editingPost?.id ? 'Guardar Cambios' : 'Publicar Artículo')}
            </button>
            <button onClick={() => setEditingPost(null)}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─ Vista: Lista ─
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Artículos del Blog</h2>
          <p className="text-xs text-gray-500 mt-0.5">{posts.length} artículo(s)</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Artículo
        </button>
      </div>

      {loadingPosts && <div className="flex justify-center py-16"><span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span></div>}

      {!loadingPosts && posts.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">article</span>
          <p className="text-gray-500 font-semibold">No hay artículos publicados</p>
          <p className="text-gray-400 text-sm mt-1">Crea el primer artículo del blog del club.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">+ Crear Artículo</button>
        </div>
      )}

      <div className="space-y-3">
        {posts.map(post => {
          const cat = CAT_BLOG[post.categoria];
          return (
            <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 items-start hover:shadow-md hover:border-gray-300 transition-all">
              {post.imagen_url
                ? <img src={post.imagen_url} alt={post.titulo} className="w-20 h-16 object-cover rounded-xl shrink-0 bg-gray-100" />
                : <div className="w-20 h-16 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {cat && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>{cat.label}</span>}
                  {!post.publicado && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">Borrador</span>}
                </div>
                <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{post.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{post.autor} · {post.fecha} · {post.tiempo_lectura}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(post)} className="p-2 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors" title="Editar">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => setDeleteModal({ post })} className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        titulo="¿Eliminar este artículo?"
        mensaje={`Se eliminará permanentemente el artículo "${deleteModal?.post?.titulo}" y su imagen de portada. Esta acción no se puede deshacer.`}
        loading={deleteModal?.loading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PESTAÑA GALERÍA ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function GaleriaTab({ showToast }) {
  const fotosRef = useRef(null);
  const [albumes, setAlbumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteFotoModal, setDeleteFotoModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const FORM_INIT = { titulo: '', fecha: '', lugar: '', descripcion: '', categoria: 'Club', newFiles: [], newPreviews: [], keepUrls: [], keepPaths: [] };
  const [form, setForm] = useState(FORM_INIT);

  useEffect(() => { loadAlbumes(); }, []);

  const loadAlbumes = async () => {
    setLoading(true);
    const { data } = await supabase.from('galeria_albumes').select('*').order('created_at', { ascending: false });
    setAlbumes(data || []);
    setLoading(false);
  };

  const openNew  = () => { setForm(FORM_INIT); setEditingAlbum({}); };
  const openEdit = (album) => {
    setForm({
      titulo: album.titulo, fecha: album.fecha || '', lugar: album.lugar || '',
      descripcion: album.descripcion || '', categoria: album.categoria || 'Club',
      newFiles: [], newPreviews: [],
      keepUrls: album.fotos_urls || [],
      keepPaths: album.storage_paths || [],
    });
    setEditingAlbum(album);
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const previews = files.map(f => URL.createObjectURL(f));
    setForm(f => ({ ...f, newFiles: [...f.newFiles, ...files], newPreviews: [...f.newPreviews, ...previews] }));
  };

  const removeNewFoto = (i) => {
    setForm(f => {
      const files = [...f.newFiles]; const prev = [...f.newPreviews];
      files.splice(i, 1); prev.splice(i, 1);
      return { ...f, newFiles: files, newPreviews: prev };
    });
  };

  const confirmRemoveExisting = async () => {
    const { index } = deleteFotoModal;
    const path = form.keepPaths[index];
    if (path) await supabase.storage.from('galeria').remove([path]);
    setForm(f => {
      const urls = [...f.keepUrls]; const paths = [...f.keepPaths];
      urls.splice(index, 1); paths.splice(index, 1);
      return { ...f, keepUrls: urls, keepPaths: paths };
    });
    setDeleteFotoModal(null);
    showToast('Foto eliminada.', 'info');
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) { showToast('El título del álbum es obligatorio.', 'error'); return; }
    if (form.keepUrls.length + form.newFiles.length === 0) { showToast('Agrega al menos una foto.', 'error'); return; }
    setSaving(true);
    try {
      const albumId = editingAlbum?.id || crypto.randomUUID();
      const newPaths = []; const newUrls = [];
      if (form.newFiles.length > 0) {
        setIsUploading(true);
        for (let i = 0; i < form.newFiles.length; i++) {
          const file = form.newFiles[i];
          const ext  = file.name.split('.').pop();
          const path = `albumes/${albumId}/${Date.now()}-${i}.${ext}`;
          const { error } = await supabase.storage.from('galeria').upload(path, file, { upsert: true });
          if (!error) {
            newPaths.push(path);
            const { data: urlData } = supabase.storage.from('galeria').getPublicUrl(path);
            newUrls.push(urlData.publicUrl);
          }
          setUploadProgress(Math.round(((i + 1) / form.newFiles.length) * 100));
        }
        setIsUploading(false);
      }
      const allPaths = [...form.keepPaths, ...newPaths];
      const allUrls  = [...form.keepUrls, ...newUrls];
      const payload  = {
        titulo: form.titulo, fecha: form.fecha, lugar: form.lugar,
        descripcion: form.descripcion, categoria: form.categoria,
        portada_url: allUrls[0] || '', fotos_urls: allUrls, storage_paths: allPaths,
      };
      if (editingAlbum?.id) {
        await supabase.from('galeria_albumes').update(payload).eq('id', editingAlbum.id);
      } else {
        await supabase.from('galeria_albumes').insert({ ...payload, id: albumId });
      }
      showToast(editingAlbum?.id ? 'Álbum actualizado.' : 'Álbum creado.', 'success');
      setEditingAlbum(null);
      loadAlbumes();
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setSaving(false); setIsUploading(false); setUploadProgress(0);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!deleteModal?.album) return;
    setDeleteModal(d => ({ ...d, loading: true }));
    const album = deleteModal.album;
    if (album.storage_paths?.length > 0) await supabase.storage.from('galeria').remove(album.storage_paths);
    await supabase.from('galeria_albumes').delete().eq('id', album.id);
    setDeleteModal(null);
    showToast('Álbum y fotos eliminados.', 'info');
    loadAlbumes();
  };

  // ─ Vista: Editor de álbum ─
  if (editingAlbum !== null) {
    const totalFotos = form.keepUrls.length + form.newFiles.length;
    return (
      <div className="space-y-5 pb-8">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <button onClick={() => setEditingAlbum(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </button>
          <div>
            <h2 className="font-bold text-gray-900">{editingAlbum?.id ? 'Editar Álbum' : 'Nuevo Álbum'}</h2>
            <p className="text-xs text-gray-500">{totalFotos} foto(s) en el álbum</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Zona de upload */}
            <div onClick={() => fotosRef.current?.click()}
              className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined text-4xl text-orange-400 mb-2 block">add_photo_alternate</span>
              <p className="font-semibold text-gray-700 text-sm">Haz clic para agregar fotos</p>
              <p className="text-xs text-gray-500 mt-1">Puedes seleccionar varias a la vez</p>
              <input ref={fotosRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotosChange} />
            </div>

            {/* Barra de progreso */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-blue-600 animate-spin">progress_activity</span>
                  <span className="text-sm font-semibold text-blue-700">Subiendo fotos... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Fotos existentes */}
            {form.keepUrls.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fotos actuales ({form.keepUrls.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.keepUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-xl transition-all flex items-center justify-center">
                        <button onClick={() => setDeleteFotoModal({ index: i })}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                      {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500 text-white">Portada</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fotos nuevas */}
            {form.newPreviews.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fotos nuevas ({form.newPreviews.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.newPreviews.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} alt={`Nueva ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-orange-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-xl transition-all flex items-center justify-center">
                        <button onClick={() => removeNewFoto(i)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                      {form.keepUrls.length === 0 && i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500 text-white">Portada</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Información del Álbum</h3>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Título *</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Torneo Intercolegial 2025"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Categoría</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 bg-white">
                  {CAT_GALERIA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Fecha / Temporada</label>
                <input value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  placeholder="Ej: Agosto 2025"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Lugar</label>
                <input value={form.lugar} onChange={e => setForm(f => ({ ...f, lugar: e.target.value }))}
                  placeholder="Ej: Coliseo Mayor de Cuenca"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Breve descripción del álbum..."
                  rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/30 resize-none" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || isUploading}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
              {saving ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-[18px]">save</span>}
              {saving ? 'Guardando...' : (editingAlbum?.id ? 'Guardar Cambios' : 'Crear Álbum')}
            </button>
            <button onClick={() => setEditingAlbum(null)}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>

        <DeleteConfirmModal
          isOpen={!!deleteFotoModal}
          onClose={() => setDeleteFotoModal(null)}
          onConfirm={confirmRemoveExisting}
          titulo="¿Eliminar esta foto?"
          mensaje={`Se eliminará esta foto del álbum "${editingAlbum?.titulo || 'nuevo'}" de forma permanente. Esta acción no se puede deshacer.`}
          loading={false}
        />
      </div>
    );
  }

  // ─ Vista: Lista de álbumes ─
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Álbumes de Galería</h2>
          <p className="text-xs text-gray-500 mt-0.5">{albumes.length} álbum(es) publicados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md">
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          Nuevo Álbum
        </button>
      </div>

      {loading && <div className="flex justify-center py-16"><span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span></div>}

      {!loading && albumes.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">photo_library</span>
          <p className="text-gray-500 font-semibold">No hay álbumes de galería</p>
          <p className="text-gray-400 text-sm mt-1">Crea el primer álbum subiendo fotos del club.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">+ Crear Álbum</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albumes.map(album => (
          <div key={album.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group">
            <div className="relative h-44 bg-gray-100 overflow-hidden">
              {album.portada_url
                ? <img src={album.portada_url} alt={album.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-gray-300">photo</span></div>
              }
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">{album.categoria}</span>
              </div>
            </div>
            <div className="p-4">
              <p className="font-bold text-gray-900 text-sm line-clamp-1">{album.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">{album.fecha}{album.lugar ? ` · ${album.lugar}` : ''}</p>
              <p className="text-xs text-gray-400 mt-0.5">{album.fotos_urls?.length || 0} foto(s)</p>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button onClick={() => openEdit(album)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">edit</span> Editar
              </button>
              <button onClick={() => setDeleteModal({ album })}
                className="py-2 px-3 rounded-xl border border-gray-200 text-gray-500 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteAlbum}
        titulo="¿Eliminar este álbum completo?"
        mensaje={`Se eliminarán el álbum "${deleteModal?.album?.titulo}" y todas sus ${deleteModal?.album?.fotos_urls?.length || 0} foto(s) de Supabase Storage. Esta acción es irreversible.`}
        loading={deleteModal?.loading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PÁGINA PRINCIPAL EDITOR ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function Editor() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blog');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleLogout = async () => { await logout(); navigate('/'); };

  const tabs = [
    { id: 'blog',    label: 'Blog',    icon: 'article' },
    { id: 'galeria', label: 'Galería', icon: 'photo_library' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fb] overflow-hidden">
      {/* Header */}
      <header className="bg-[#001f3f] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Volver al Admin">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-orange-400 text-2xl">edit_square</span>
            <div>
              <h1 className="font-bold text-sm leading-none">Editor de Contenido</h1>
              <p className="text-[11px] text-blue-300 mt-0.5">Club Pito Pérez · Blog y Galería</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-blue-300 hidden sm:block">{user?.email}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-5 shrink-0">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-5 md:p-7">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'blog'    && <BlogTab    showToast={showToast} />}
          {activeTab === 'galeria' && <GaleriaTab showToast={showToast} />}
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
