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

const CATEGORIES = [
  'Awards', 
  'Makers & Movers', 
  'Alcott Global', 
  'Source to Sold', 
  'Supplify', 
  'Executive Search', 
  'Tools'
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Awards': 'bg-yellow-500',
  'Makers & Movers': 'bg-purple-600',
  'Alcott Global': 'bg-teal-500',
  'Source to Sold': 'bg-orange-500',
  'Supplify': 'bg-blue-500',
  'Executive Search': 'bg-emerald-600',
  'Tools': 'bg-slate-500',
};

export const LinksApp: React.FC<LinksAppProps> = ({ links, onSaveLinks, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
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
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url);
      setCategory(link.category);
    } else {
      setEditingLink(null);
      setTitle('');
      setUrl('');
      setCategory('Awards');
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
      const newLink: LinkEntry = {
        id: Date.now().toString(),
        title,
        url: formattedUrl,
        category,
        dateAdded: new Date()
      };
      onSaveLinks([newLink, ...links]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this link from your collection?')) {
      onSaveLinks(links.filter(l => l.id !== id));
    }
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
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-inter transition-colors">
      {/* Left Panel Sidebar */}
      <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-4 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <button onClick={onGoHome} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <Home size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase text-[15px]">Link Hub</h1>
        </div>

        <div className="space-y-1 overflow-y-auto pr-2 no-scrollbar">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={16} /> All Links
          </button>
          <div className="my-4 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-lg shadow-indigo-500/20 font-bold transition-all active:scale-95 text-sm"
          >
            <Plus size={18} /> New Link
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredLinks.map(link => (
                <motion.div 
                  layout
                  key={link.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex shadow-sm hover:shadow-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Banner Stripe on Absolute Left */}
                  <div className={`w-[6px] ${CATEGORY_COLORS[link.category] || 'bg-slate-400'} shrink-0`} />
                  
                  <div className="flex-1 p-4 flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-bold text-[16px] text-slate-900 dark:text-white truncate flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {link.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleCopy(link.url, link.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          title="Copy Link"
                        >
                          {copiedId === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        <button 
                          onClick={() => handleOpenModal(link)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          title="Edit Link"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-600 transition-all"
                          title="Delete Link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Category Tag Below Title */}
                    <div className="flex items-center gap-1.5 mb-5">
                      <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[link.category] || 'bg-slate-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400/80">
                        {link.category}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate italic max-w-[80%] font-medium">
                        {link.url.replace('https://', '').replace('http://', '')}
                      </p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-indigo-600 hover:text-white rounded transition-all flex items-center justify-center shadow-sm"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-80 text-slate-400">
              <Globe size={64} className="mb-6 opacity-5 animate-pulse" />
              <p className="text-sm font-black uppercase tracking-[0.2em] opacity-30">Collection Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  {editingLink ? 'Update Entry' : 'Create New Entry'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Display Title</label>
                  <input 
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Alcott Global Portal"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target URL</label>
                  <input 
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. alcottglobal.com"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category Assignment</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as LinkEntry['category'])}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer dark:text-white font-medium"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-lg shadow-indigo-500/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    {editingLink ? 'Update Entry' : 'Save Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ChevronDownProps { size: number; className?: string }
const ChevronDown: React.FC<ChevronDownProps> = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);