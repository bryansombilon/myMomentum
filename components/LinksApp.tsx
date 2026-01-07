
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkEntry, ProjectType } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Home, Search, Plus, Trash2, ExternalLink, 
  FileSpreadsheet, FileText, FolderOpen, Globe, 
  MoreVertical, Calendar, Briefcase, Filter, X
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

  // New Link State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newProject, setNewProject] = useState<ProjectType>(ProjectType.AWARDS);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          link.url.toLowerCase().includes(searchQuery.toLowerCase());
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
      project: newProject,
      dateAdded: new Date()
    };
    onSaveLinks([newEntry, ...links]);
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      onSaveLinks(links.filter(l => l.id !== id));
    }
  };

  const getSourceDetails = (url: string) => {
    if (url.includes('docs.google.com/spreadsheets')) {
      return { label: 'Google Sheet', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    }
    if (url.includes('docs.google.com/document')) {
      return { label: 'Google Doc', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
    if (url.includes('drive.google.com')) {
      return { label: 'Google Drive', icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    }
    if (url.includes('docs.google.com/presentation')) {
      return { label: 'Google Slides', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    }
    return { label: 'Website', icon: Globe, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 flex-col transition-colors overflow-hidden">
      {/* App Header */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
            <Home size={20} />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Links Hub</h1>
        </div>

        <div className="flex flex-1 max-w-2xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search links, docs, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <select 
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="hidden md:block bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Projects</option>
            {Object.values(PROJECT_CONFIG).map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 font-bold transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            Add Link
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => {
                  const source = getSourceDetails(link.url);
                  const project = PROJECT_CONFIG[link.project];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={link.id}
                      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300"
                    >
                      {/* Card Banner */}
                      <div className={`h-24 ${source.bg} flex items-center justify-center relative transition-colors`}>
                        <source.icon size={40} className={source.color} />
                        <div className="absolute top-3 right-3 flex gap-1">
                          <button 
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${source.border} ${source.color}`}>
                            {source.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(link.dateAdded).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-slate-800 dark:text-white truncate mb-1">
                            {link.title}
                          </h3>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{project.name}</span>
                          </div>
                        </div>

                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition-all group/btn"
                        >
                          <span className="truncate max-w-[120px]">{link.url.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Globe size={48} className="opacity-10 mb-4" />
              <p className="font-bold">No resources found.</p>
              <p className="text-sm">Try broadening your search or project filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Register Resource</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q4 Marketing Strategy"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL / Link</label>
                  <input 
                    type="url" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Paste link here..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Assignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PROJECT_CONFIG).map(p => (
                      <button
                        key={p.name}
                        onClick={() => setNewProject(p.name)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
                          newProject === p.name 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAddLink}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 mt-4"
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
