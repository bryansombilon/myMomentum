
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkEntry } from '../types';
import { 
  Plus, Search, ExternalLink, Copy, Trash2, 
  Globe, Wrench, Trophy, Rocket, Building2, Package, Layers, Users,
  Check, X, Pencil, Mic
} from 'lucide-react';

interface LinksAppProps {
  links: LinkEntry[];
  onSaveLinks: (links: LinkEntry[]) => void;
}

const CATEGORIES = ['Awards', 'Makers & Movers', 'Alcott Global', 'Source to Sold', 'Supplify', 'Executive Search', 'Podcast', 'Tools'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  'Awards': 'bg-yellow-500', 'Makers & Movers': 'bg-purple-600', 'Alcott Global': 'bg-teal-500',
  'Source to Sold': 'bg-orange-500', 'Supplify': 'bg-blue-500', 'Executive Search': 'bg-emerald-600', 'Podcast': 'bg-rose-500', 'Tools': 'bg-slate-500',
};

export const LinksApp: React.FC<LinksAppProps> = ({ links, onSaveLinks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<LinkEntry['category']>('Awards');

  const filteredLinks = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return links.filter(link => {
      const matchSearch = (link.title || '').toLowerCase().includes(q) || 
                          (link.url || '').toLowerCase().includes(q);
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
      case 'Podcast': return <Mic size={14} />;
      case 'Tools': return <Wrench size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-teal-600">LinkFlow</h1>
          <button onClick={() => handleOpenModal()} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm transition-all active:scale-95">
            <Plus size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/40 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pb-32 space-y-1.5 scrollbar-hide">
          <button onClick={() => setActiveCategory('All')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[10px] font-bold uppercase transition-all ${activeCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Globe size={14} /> All Resources
          </button>
          <div className="my-3 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[10px] font-bold uppercase transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <h2 className="text-2xl font-bold uppercase text-slate-900 dark:text-white">
            {activeCategory === 'All' ? 'Global Dashboard' : activeCategory}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-32 scrollbar-hide">
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
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 min-h-[160px]"
                >
                  <div className={`w-[6px] ${CATEGORY_COLORS[link.category] || 'bg-slate-400'} shrink-0`} />
                  
                  <div className="flex-1 flex flex-col p-6 min-w-0 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[link.category] || 'bg-slate-400'}`} />
                        <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">{link.category}</span>
                      </div>
                      
                      <h3 className="font-bold text-[18px] text-slate-900 dark:text-white leading-tight mb-4">
                        {link.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-auto">
                      <button 
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        Open <ExternalLink size={12} />
                      </button>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(link.url, link.id); }} 
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          title="Copy URL"
                        >
                          {copiedId === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(link); }} 
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          title="Edit Resource"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(link.id); }} 
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 transition-all"
                          title="Delete Resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-md overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-[12px] font-bold uppercase text-slate-800 dark:text-white">{editingLink ? 'Refine' : 'New'} Hub Resource</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600 transition-colors" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Documentation..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-bold outline-none text-slate-800 dark:text-white focus:border-indigo-500 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">URL</label>
                  <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="alcott.com/hub" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-bold outline-none text-slate-800 dark:text-white focus:border-indigo-500 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Collection</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm outline-none text-slate-800 dark:text-white font-bold uppercase appearance-none cursor-pointer">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[11px] font-bold uppercase text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase active:scale-95 transition-all shadow-xl shadow-indigo-500/25">Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
