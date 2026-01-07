import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkEntry } from '../types';
import { 
  Plus, Search, ExternalLink, Copy, Trash2, Home, 
  Globe, Wrench, Trophy, Rocket, Building2, Package, Layers, Users,
  Check, X, Pencil
} from 'lucide-react';

interface LinksAppProps {
  links: LinkEntry[];
  onSaveLinks: (links: LinkEntry[]) => void;
  onGoHome: () => void;
}

const CATEGORIES = ['Awards', 'Makers & Movers', 'Alcott Global', 'Source to Sold', 'Supplify', 'Executive Search', 'Tools'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  'Awards': 'bg-yellow-500', 'Makers & Movers': 'bg-purple-600', 'Alcott Global': 'bg-teal-500',
  'Source to Sold': 'bg-orange-500', 'Supplify': 'bg-blue-500', 'Executive Search': 'bg-emerald-600', 'Tools': 'bg-slate-500',
};

export const LinksApp: React.FC<LinksAppProps> = ({ links, onSaveLinks, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<LinkEntry['category']>('Awards');

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          link.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || link.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [links, searchQuery, activeCategory]);

  const handleOpenModal = (link?: LinkEntry) => {
    if (link) {
      setEditingLink(link); setTitle(link.title); setUrl(link.url); setCategory(link.category);
    } else {
      setEditingLink(null); setTitle(''); setUrl(''); setCategory('Awards');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    if (editingLink) {
      onSaveLinks(links.map(l => l.id === editingLink.id ? { ...l, title, url: formattedUrl, category } : l));
    } else {
      onSaveLinks([{ id: Date.now().toString(), title, url: formattedUrl, category, dateAdded: new Date() }, ...links]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this resource?')) onSaveLinks(links.filter(l => l.id !== id));
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Awards': return <Trophy size={14} />;
      case 'Makers & Movers': return <Rocket size={14} />;
      case 'Alcott Global': return <Building2 size={14} />;
      case 'Source to Sold': return <Package size={14} />;
      case 'Supplify': return <Layers size={14} />;
      case 'Executive Search': return <Users size={14} />;
      case 'Tools': return <Wrench size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button onClick={onGoHome} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <Home size={18} />
            </button>
            <h1 className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">LinkFlow</h1>
          </div>
          <button onClick={() => handleOpenModal()} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm transition-all active:scale-95">
            <Plus size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
          <button onClick={() => setActiveCategory('All')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Globe size={14} /> All Resources
          </button>
          <div className="my-3 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {activeCategory === 'All' ? 'Global Dashboard' : activeCategory}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredLinks.map(link => (
                <motion.div 
                  layout
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all duration-300"
                >
                  <div className={`w-[6px] ${CATEGORY_COLORS[link.category] || 'bg-slate-400'} shrink-0`} />
                  
                  {/* Entire content behaves as a primary launch button */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <button 
                      onClick={() => window.open(link.url, '_blank')}
                      className="flex-1 text-left p-6 outline-none focus:bg-slate-50 dark:focus:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="font-bold text-[17px] text-slate-900 dark:text-white truncate flex-1 group-hover:text-indigo-600 transition-colors tracking-tight">
                          {link.title}
                        </h3>
                        <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[link.category] || 'bg-slate-400'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{link.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate italic font-medium opacity-60">
                        {link.url.replace('https://', '').replace('http://', '')}
                      </p>
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(link.url, link.id); }} 
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                        title="Copy URL"
                      >
                        {copiedId === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(link); }} 
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                        title="Edit Resource"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(link.id); }} 
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-slate-400 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900 shadow-sm"
                        title="Delete Resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredLinks.length === 0 && <div className="text-center py-40 text-slate-400 text-[12px] font-black uppercase tracking-[0.4em] opacity-10">No entries found</div>}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{editingLink ? 'Refine' : 'New'} Hub Resource</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600 transition-colors" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Documentation..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm outline-none dark:text-white focus:border-indigo-500 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">URL</label>
                  <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="alcott.com/hub" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm outline-none dark:text-white focus:border-indigo-500 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collection</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm outline-none dark:text-white font-bold uppercase tracking-wider appearance-none cursor-pointer">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-500/25">Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};