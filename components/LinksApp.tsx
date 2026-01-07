
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LinkEntry, ProjectType } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Home, Search, Plus, Trash2, ExternalLink, 
  FileSpreadsheet, FileText, FolderOpen, Globe, 
  Presentation, X, Sparkles, Pencil
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
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Form State
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

  // Sync form state when editing
  useEffect(() => {
    if (editingLink) {
      setNewTitle(editingLink.title);
      setNewUrl(editingLink.url);
      setNewDescription(editingLink.description || '');
      setNewProject(editingLink.project);
    } else {
      setNewTitle('');
      setNewUrl('');
      setNewDescription('');
      setNewProject(ProjectType.AWARDS);
    }
  }, [editingLink]);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return links.filter(link => {
      const matchesSearch = !q || 
                          link.title.toLowerCase().includes(q) || 
                          link.url.toLowerCase().includes(q) ||
                          (link.description && link.description.toLowerCase().includes(q));
      const matchesProject = filterProject === 'all' || link.project === filterProject;
      return matchesSearch && matchesProject;
    });
  }, [links, searchQuery, filterProject]);

  const handleSaveLink = () => {
    if (!newTitle || !newUrl) return;
    
    if (editingLink) {
      const updatedLinks = links.map(l => 
        l.id === editingLink.id 
          ? { ...l, title: newTitle, url: newUrl, description: newDescription, project: newProject } 
          : l
      );
      onSaveLinks(updatedLinks);
    } else {
      const newEntry: LinkEntry = {
        id: Date.now().toString(),
        title: newTitle,
        url: newUrl,
        description: newDescription,
        project: newProject,
        dateAdded: new Date()
      };
      onSaveLinks([newEntry, ...links]);
    }
    
    setShowAddModal(false);
    setEditingLink(null);
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
        label: 'Sheet', 
        icon: FileSpreadsheet, 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', 
        border: 'border-emerald-200 dark:border-emerald-800',
        bannerBg: 'bg-emerald-100/40 dark:bg-emerald-800/20',
        bannerIconColor: 'text-emerald-500',
      };
    }
    if (isDoc) {
      return { 
        label: 'Doc', 
        icon: FileText, 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
        border: 'border-blue-200 dark:border-blue-800',
        bannerBg: 'bg-blue-100/40 dark:bg-blue-800/20',
        bannerIconColor: 'text-blue-500',
      };
    }
    if (isDrive) {
      return { 
        label: 'Drive', 
        icon: FolderOpen, 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-50/50 dark:bg-amber-900/10', 
        border: 'border-amber-200 dark:border-amber-800',
        bannerBg: 'bg-amber-100/40 dark:bg-amber-800/20',
        bannerIconColor: 'text-amber-500',
      };
    }
    if (isSlide) {
      return { 
        label: 'Slides', 
        icon: Presentation, 
        color: 'text-orange-600 dark:text-orange-400', 
        bg: 'bg-orange-50/50 dark:bg-orange-900/10', 
        border: 'border-orange-200 dark:border-orange-800',
        bannerBg: 'bg-orange-100/40 dark:bg-orange-800/20',
        bannerIconColor: 'text-orange-500',
      };
    }
    return { 
      label: 'Site', 
      icon: Globe, 
      color: 'text-slate-600 dark:text-slate-400', 
      bg: 'bg-white dark:bg-slate-900', 
      border: 'border-slate-200 dark:border-slate-800',
      bannerBg: 'bg-slate-50 dark:bg-slate-800/20',
      bannerIconColor: 'text-slate-400',
    };
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 flex-col transition-colors overflow-hidden font-inter">
      {/* App Header */}
      <div className="p-4 md:p-6 lg:px-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-6 z-20 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onGoHome} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-all active:scale-95 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <Home size={22} />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Links Hub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resource Repository</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
              <Sparkles size={12} className="text-amber-500" />
              {filteredLinks.length} Items
            </div>
            <button 
              onClick={() => { setEditingLink(null); setShowAddModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xl shadow-emerald-500/20 font-black transition-all active:scale-95 whitespace-nowrap"
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
              placeholder="Filter resources (Press / to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-md text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 focus:border-emerald-500/30 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full lg:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-md text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
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
        <div className="max-w-6xl mx-auto">
          {filteredLinks.length > 0 ? (
            <Reorder.Group 
              axis="y" 
              values={links} 
              onReorder={onSaveLinks}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => {
                  const source = getSourceDetails(link.url);
                  const project = PROJECT_CONFIG[link.project];
                  return (
                    <Reorder.Item
                      key={link.id}
                      value={link}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`group relative flex ${source.bg} border-2 ${source.border} rounded-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg`}
                    >
                      {/* Left Side Banner */}
                      <div className={`w-20 md:w-24 ${source.bannerBg} flex flex-col items-center justify-center relative transition-colors shrink-0 border-r border-black/5 dark:border-white/10`}>
                        <div className={`p-3 rounded-md bg-white/80 dark:bg-slate-800/80 shadow-md border border-white/50 dark:border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                          <source.icon size={24} className={`${source.bannerIconColor}`} />
                        </div>
                        <div className="mt-3">
                          <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${source.color} text-center px-1.5 leading-tight`}>
                            {source.label}
                          </span>
                        </div>
                      </div>

                      {/* Right Side Content Section */}
                      <div className="p-4 md:p-5 flex-1 flex flex-col min-w-0 bg-transparent relative">
                        {/* Title and Actions Row */}
                        <div className="flex items-center justify-between mb-1 gap-4">
                           <h3 className="font-black text-slate-900 dark:text-white text-lg truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight leading-tight">
                            {link.title}
                           </h3>
                           
                           <div className="flex items-center gap-1.5 shrink-0">
                             <button 
                                onClick={(e) => { e.stopPropagation(); setEditingLink(link); setShowAddModal(true); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors bg-white/60 dark:bg-slate-800/60 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors bg-white/60 dark:bg-slate-800/60 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                           </div>
                        </div>

                        {/* Project Tag Row - Below Title */}
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: project.color }} />
                          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{project.name}</span>
                        </div>

                        {/* Description Section */}
                        {link.description ? (
                          <div className="flex-1 mb-5">
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic opacity-90 border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-0.5">
                              {link.description}
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 mb-5 text-[10px] text-slate-300 dark:text-slate-700 italic opacity-40 py-0.5">No context notes provided.</div>
                        )}

                        {/* Button Row - Left Aligned */}
                        <div className="flex items-center justify-start mt-auto">
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 hover:text-white dark:hover:text-white rounded-md text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 group/btn shadow-md shadow-black/10 dark:shadow-none`}
                          >
                            <span>Access Now</span>
                            <ExternalLink size={12} className="shrink-0 transition-transform group-hover/btn:translate-x-1" />
                          </a>
                        </div>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-md flex items-center justify-center mb-6 shadow-lg border border-slate-100 dark:border-slate-800">
                <Globe size={28} className="text-slate-200 dark:text-slate-800" />
              </div>
              <p className="font-black text-slate-900 dark:text-slate-100 text-lg tracking-tight">No resources found</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration / Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    {editingLink ? 'Edit Resource' : 'Register Resource'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Update shared repository</p>
                </div>
                <button onClick={() => { setShowAddModal(false); setEditingLink(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pt-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Document or Site Name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context Notes</label>
                  <textarea 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What is this for? Any quick tips..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all resize-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource URL</label>
                  <input 
                    type="url" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Association</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PROJECT_CONFIG).map(p => (
                      <button
                        key={p.name}
                        onClick={() => setNewProject(p.name)}
                        className={`flex items-center gap-3 p-2.5 rounded-md border text-left transition-all ${
                          newProject === p.name 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-[10px] font-black uppercase tracking-tight truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSaveLink}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-md shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] mt-4 text-xs uppercase tracking-widest"
                >
                  {editingLink ? 'Update Entry' : 'Save to Repository'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
