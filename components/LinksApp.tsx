
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkEntry } from '../types';
import { 
  Plus, Search, ExternalLink, Copy, Trash2, Home, 
  Globe, Wrench, Trophy, Rocket, Building2, Package, Layers, Users,
  Check, X, Pencil, ChevronDown
} from 'lucide-react';

interface LinksAppProps {
  links: LinkEntry[];
  onSaveLinks: (links: LinkEntry[]) => void;
  onGoHome: () => void;
  isMobile?: boolean;
}

const CATEGORIES = ['Awards', 'Makers & Movers', 'Alcott Global', 'Source to Sold', 'Supplify', 'Executive Search', 'Tools'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  'Awards': 'bg-yellow-500', 'Makers & Movers': 'bg-purple-600', 'Alcott Global': 'bg-teal-500',
  'Source to Sold': 'bg-orange-500', 'Supplify': 'bg-blue-500', 'Executive Search': 'bg-emerald-600', 'Tools': 'bg-slate-500',
};

export const LinksApp: React.FC<LinksAppProps> = ({ links, onSaveLinks, onGoHome, isMobile }) => {
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
      case 'Tools': return <Wrench size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex-col md:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-teal-600">LinkFlow</h1>
            <button onClick={() => handleOpenModal()} className="p-1.5 bg-indigo-600 text-white rounded-md shadow-sm">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
            <CategoryItem active={activeCategory === 'All'} label="All Resources" onClick={() => setActiveCategory('All')} icon={<Globe size={14} />} />
            {CATEGORIES.map(cat => (
              <CategoryItem key={cat} active={activeCategory === cat} label={cat} onClick={() => setActiveCategory(cat)} icon={getCategoryIcon(cat)} />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-4 py-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
              {activeCategory}
            </h2>
            {isMobile && (
              <button onClick={() => handleOpenModal()} className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg">
                <Plus size={20} />
              </button>
            )}
          </div>
          
          {/* Mobile Horizontal Category Chips */}
          {isMobile && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              <Chip active={activeCategory === 'All'} onClick={() => setActiveCategory('All')} label="All" />
              {CATEGORIES.map(cat => (
                <Chip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} label={cat} />
              ))}
            </div>
          )}

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter hub..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredLinks.map(link => (
                /* Fix: Using as any to bypass layout type check on motion.div which is valid in framer-motion */
                <motion.div 
                  {...({ layout: true } as any)}
                  key={link.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-[6px] ${CATEGORY_COLORS[link.category] || 'bg-slate-400'} shrink-0`} />
                  <div className="flex-1 flex flex-col p-5 md:p-6 justify-between">
                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">{link.category}</span>
                      <h3 className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight mb-4 line-clamp-2">{link.title}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <button onClick={() => window.open(link.url, '_blank')} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20">Open</button>
                      <div className="flex gap-1">
                        <IconButton onClick={() => handleCopy(link.url, link.id)} icon={copiedId === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} />
                        <IconButton onClick={() => handleOpenModal(link)} icon={<Pencil size={14} />} />
                        <IconButton onClick={() => confirm('Delete?') && onSaveLinks(links.filter(l => l.id !== link.id))} icon={<Trash2 size={14} />} />
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
            {/* Fix: Using as any to bypass initial/animate type check on motion.div */}
            <motion.div {...({ initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } } as any)} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest">{editingLink ? 'Refine' : 'New'} Hub Item</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">URL</label>
                  <input required value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Collection</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider appearance-none">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/30">Confirm</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Chip: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
    {label}
  </button>
);

const IconButton: React.FC<{ icon: any; onClick: () => void }> = ({ icon, onClick }) => (
  <button onClick={onClick} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl transition-all">
    {icon}
  </button>
);

const CategoryItem: React.FC<{ active: boolean; label: string; onClick: () => void; icon: any }> = ({ active, label, onClick, icon }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);
