
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkEntry, ProjectType } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Home, Search, Plus, Trash2, ExternalLink, 
  FileSpreadsheet, FileText, FolderOpen, Globe, 
  Presentation, MoreVertical, Calendar, Briefcase, Filter, X,
  AlignLeft, Sparkles, Command
} from 'lucide-react';

interface LinksAppProps {
  links: LinkEntry[];
  onSaveLinks: (links: LinkEntry[]) => void;
  onGoHome: () => void;
}

export const LinksApp: React.FC<LinksAppProps> = ({ links, onSaveLinks, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // New Link State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProject, setNewProject] = useState<ProjectType>(ProjectType.AWARDS);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return links.filter(link => {
      const matchesSearch = !q || 
                          link.title.toLowerCase().includes(q) || 
                          link.url.toLowerCase().includes(q) ||
                          (link.description && link.description.toLowerCase().includes(q));
      const matchesProject = filterProject === 'all' || link.project === filterProject;
      return matchesSearch && matchesProject;
    }).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [links, searchQuery, filterProject]);

  const handleAddLink = () => {
    if (!newTitle || !newUrl) return;
    const newEntry: LinkEntry = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl,
      description: newDescription,
      project: newProject,
      dateAdded: new Date()
    };
    onSaveLinks([newEntry, ...links]);
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      onSaveLinks(links.filter(l => l.id !== id));
    }
  };

  const getSourceDetails = (url: string) => {
    const isSheet = url.includes('docs.google.com/spreadsheets');
    const isDoc = url.includes('docs.google.com/document');
    const isDrive = url.includes('drive.google.com');
    const isSlide = url.includes('docs.google.com/presentation');

    if (isSheet) {
      return { 
        label: 'Google Sheet', 
        icon: FileSpreadsheet, 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-50/30 dark:bg-emerald-950/20', 
        accent: 'bg-emerald-500',
        border: 'border-emerald-100 dark:border-emerald-800/40',
        bannerBg: 'bg-emerald-100/40 dark:bg-emerald-900/20',
        bannerIconColor: 'text-emerald-500',
        glow: 'shadow-emerald-500/10'
      };
    }
    if (isDoc) {
      return { 
        label: 'Google Doc', 
        icon: FileText, 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-50/30 dark:bg-blue-950/20', 
        accent: 'bg-blue-500',
        border: 'border-blue-100 dark:border-blue-800/40',
        bannerBg: 'bg-blue-100/40 dark:bg-blue-900/20',
        bannerIconColor: 'text-blue-500',
        glow: 'shadow-blue-500/10'
      };
    }
    if (isDrive) {
      return { 
        label: 'Google Drive', 
        icon: FolderOpen, 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-50/30 dark:bg-amber-950/20', 
        accent: 'bg-amber-500',
        border: 'border-amber-100 dark:border-amber-800/40',
        bannerBg: 'bg-amber-100/40 dark:bg-amber-900/20',
        bannerIconColor: 'text-amber-500',
        glow: 'shadow-amber-500/10'
      };
    }
    if (isSlide) {
      return { 
        label: 'Google Slides', 
        icon: Presentation, 
        color: 'text-orange-600 dark:text-orange-400', 
        bg: 'bg-orange-50/30 dark:bg-orange-950/20', 
        accent: 'bg-orange-500',
        border: 'border-orange-100 dark:border-orange-800/40',
        bannerBg: 'bg-orange-100/40 dark:bg-orange-900/20',
        bannerIconColor: 'text-orange-500',
        glow: 'shadow-orange-500/10'
      };
    }
    return { 
      label: 'Website', 
      icon: Globe, 
      color: 'text-slate-600 dark:text-slate-400', 
      bg: 'bg-white dark:bg-slate-900/40', 
      accent: 'bg-slate-400',
      border: 'border-slate-200 dark:border-slate-800/40',
      bannerBg: 'bg-slate-50 dark:bg-slate-800/20',
      bannerIconColor: 'text-slate-400',
      glow: 'shadow-slate-500/5'
    };
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 flex-col transition-colors overflow-hidden font-inter">
      {/* App Header */}
      <div className="p-4 md:p-6 lg:px-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-6 z-20 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onGoHome} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all active:scale-95 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <Home size={22} />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Links Hub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resource Repository</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
              <Sparkles size={12} className="text-amber-500" />
              {filteredLinks.length} Items
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xl shadow-emerald-500/20 font-black transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} />
              Add New
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Filter resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 focus:border-emerald-500/30 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full lg:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
            >
              <option value="all">All Projects</option>
              {Object.values(PROJECT_CONFIG).map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Link Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => {
                  const source = getSourceDetails(link.url);
                  const project = PROJECT_CONFIG[link.project];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={link.id}
                      className={`group relative flex flex-col ${source.bg} border ${source.border} rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-sm`}
                    >
                      {/* Source Dynamic Banner Area */}
                      <div className={`h-28 ${source.bannerBg} flex items-center justify-center relative`}>
                        <source.icon size={44} className={`${source.bannerIconColor} opacity-80 group-hover:scale-110 transition-transform duration-500`} />
                        
                        {/* Hover Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }}
                            className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-lg text-slate-500 hover:text-red-500 transition-all shadow-sm border border-white/20 active:scale-90"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Source Tag above title */}
                        <div className="mb-3">
                           <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${source.bg} ${source.color} border ${source.border}`}>
                            <source.icon size={10} className="shrink-0" />
                            {source.label}
                          </span>
                        </div>

                        <h3 className="font-black text-slate-900 dark:text-white text-base mb-2 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {link.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                           <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{project.name}</span>
                        </div>

                        {link.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-6 flex-1 italic opacity-80">
                            {link.description}
                          </p>
                        )}
                        {!link.description && <div className="flex-1 mb-6" />}

                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`mt-auto flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 dark:bg-slate-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 hover:text-white dark:hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95`}
                        >
                          <span>Open Resource</span>
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-100 dark:border-slate-800">
                <Globe size={32} className="text-slate-300 dark:text-slate-700" />
              </div>
              <p className="font-black text-slate-900 dark:text-slate-100 text-lg">No Items Found</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Refine your search parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource Registration Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 pb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Register Resource</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 pt-2 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                  <textarea 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all shadow-inner resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL</label>
                  <input 
                    type="url" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PROJECT_CONFIG).map(p => (
                      <button
                        key={p.name}
                        onClick={() => setNewProject(p.name)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          newProject === p.name 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAddLink}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.97] mt-4"
                >
                  Save Resource
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
