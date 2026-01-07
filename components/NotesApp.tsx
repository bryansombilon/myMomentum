import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Plus, Trash2, Home, Search as SearchIcon, 
  FileText, Bold, Italic, Underline, Palette, CheckSquare, Tag as TagIcon, X as XIcon,
  Strikethrough, List, IndentIncrease, IndentDecrease, ChevronDown
} from 'lucide-react';

interface NotesAppProps {
  notes: Note[];
  tasks: Task[];
  onSaveNotes: (notes: Note[]) => void;
  onGoHome: () => void;
  onNavigateToTask: (taskId: string) => void;
}

const PRESET_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#64748b' },
];

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onGoHome, onNavigateToTask }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showColorMenu, setShowColorMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(tag => tag.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  }, [notes, searchQuery]);

  const activeNote = notes.find(n => n.id === selectedNoteId);

  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
    setPendingContent(null);
  }, [selectedNoteId]);

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    onSaveNotes(notes.map(n => n.id === id ? { ...n, ...updates, lastModified: new Date() } : n));
  };

  const handleContentChange = () => {
    if (editorRef.current && activeNote) {
      const newContent = editorRef.current.innerHTML;
      setPendingContent(newContent);
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        handleUpdateNote(activeNote.id, { content: newContent });
        setPendingContent(null);
      }, 2000);
    }
  };

  const flushSave = () => {
    if (pendingContent !== null && activeNote) {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      handleUpdateNote(activeNote.id, { content: pendingContent });
      setPendingContent(null);
    }
  };

  const handleCreateNote = () => {
    flushSave();
    const newNote: Note = { id: Date.now().toString(), title: 'New Note', content: '<div>Start writing...</div>', lastModified: new Date(), tags: [] };
    onSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      onSaveNotes(updatedNotes);
      if (selectedNoteId === id) setSelectedNoteId(updatedNotes[0]?.id || null);
    }
  };

  const addTag = (tag: string) => {
    if (!activeNote || !tag.trim() || activeNote.tags.includes(tag.trim())) return;
    handleUpdateNote(activeNote.id, { tags: [...activeNote.tags, tag.trim()] });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    handleUpdateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tagToRemove) });
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { flushSave(); onGoHome(); }} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Return Home"
            >
              <Home size={18} />
            </button>
            <h2 className="text-2xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-orange-600">NoteFlow</h2>
          </div>
          <button onClick={handleCreateNote} className="p-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md shadow-sm transition-all active:scale-95">
            <Plus size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-md text-xs focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-3">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { flushSave(); setSelectedNoteId(note.id); }}
              className={`w-full p-4 rounded-md text-left transition-all border ${
                selectedNoteId === note.id 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 shadow-sm' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h3 className="font-bold text-sm truncate text-slate-900 dark:text-slate-100 leading-tight">{note.title || 'Untitled Note'}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-1 mt-2 font-medium italic opacity-70">
                {note.content.replace(/<[^>]*>?/gm, ' ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors">
        {activeNote ? (
          <>
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-30">
              <div className="flex items-center gap-0.5">
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
                <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikethrough')} title="Strikethrough" />
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />
                
                <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                <ToolbarButton icon={CheckSquare} onClick={() => execCommand('insertHTML', '<div class="checklist-item" style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" style="width: 14px; height: 14px; cursor: pointer;"><span>&nbsp;</span></div>')} title="Checklist" />
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />

                <ToolbarButton icon={IndentDecrease} onClick={() => execCommand('outdent')} title="Reverse Indent" />
                <ToolbarButton icon={IndentIncrease} onClick={() => execCommand('indent')} title="Indent" />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />

                <div className="relative">
                  <button 
                    onClick={() => setShowColorMenu(!showColorMenu)}
                    className={`flex items-center gap-1 p-2 rounded-lg transition-all ${showColorMenu ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    title="Text Color"
                  >
                    <Palette size={16} />
                    <ChevronDown size={10} className={`transition-transform duration-200 ${showColorMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showColorMenu && (
                      <>
                        {/* Transparent Backdrop to close on click outside */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowColorMenu(false)} />
                        
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 4, transformOrigin: 'top left' }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 4 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                          className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 grid grid-cols-3 gap-2 min-w-[140px]"
                        >
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.name}
                              onClick={() => { execCommand('foreColor', c.value); setShowColorMenu(false); }}
                              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: c.value === 'inherit' ? 'transparent' : c.value }}
                              title={c.name}
                            >
                              {c.value === 'inherit' && <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900">X</div>}
                            </button>
                          ))}
                          <button 
                            onClick={() => { colorInputRef.current?.click(); }}
                            className="col-span-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
                          >
                            Custom Color
                          </button>
                          <input 
                            type="color" 
                            ref={colorInputRef} 
                            className="sr-only" 
                            onChange={(e) => { execCommand('foreColor', e.target.value); setShowColorMenu(false); }} 
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-4 pr-3 shrink-0">
                {pendingContent !== null && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse">Syncing</span>}
                <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-12 max-w-5xl mx-auto w-full">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                onBlur={flushSave}
                placeholder="Title"
                className="w-full text-5xl font-bold bg-transparent border-none outline-none mb-10 placeholder:text-slate-100 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tight"
              />

              <div className="flex flex-wrap items-center gap-3 mb-12 relative">
                <TagIcon size={14} className="text-slate-400" />
                {activeNote.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="opacity-40 hover:opacity-100"><XIcon size={10} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="Add Tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(newTagInput)}
                  className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-wider text-slate-400 w-24 focus:text-slate-600 dark:focus:text-slate-200 transition-colors"
                />
              </div>

              <div 
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onBlur={flushSave}
                className="w-full h-auto min-h-[60vh] bg-transparent border-none outline-none text-lg leading-relaxed prose dark:prose-invert max-w-none pb-40 dark:text-slate-200"
                style={{ outline: 'none' }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 opacity-20 select-none">
            <FileText size={80} strokeWidth={1} className="mb-6" />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">Select a workspace</h2>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ElementType; onClick: () => void; title: string }> = ({ icon: Icon, onClick, title }) => (
  <button onClick={onClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400" title={title}>
    <Icon size={16} />
  </button>
);