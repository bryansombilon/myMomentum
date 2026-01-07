import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Plus, Trash2, Home, Search as SearchIcon, 
  FileText, Bold, Italic, Underline, Palette, CheckSquare, Tag as TagIcon, X as XIcon
} from 'lucide-react';

interface NotesAppProps {
  notes: Note[];
  tasks: Task[];
  onSaveNotes: (notes: Note[]) => void;
  onGoHome: () => void;
  onNavigateToTask: (taskId: string) => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onGoHome, onNavigateToTask }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

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
            <button onClick={() => { flushSave(); onGoHome(); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <Home size={18} />
            </button>
            <h2 className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600">NoteFlow</h2>
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
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-30">
              <div className="flex items-center gap-1">
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                <ToolbarButton icon={Palette} onClick={() => {}} title="Color" />
                <ToolbarButton icon={CheckSquare} onClick={() => execCommand('insertHTML', '<div class="checklist-item"><input type="checkbox" class="checklist-checkbox"><span>&nbsp;</span></div>')} title="Checklist" />
              </div>
              <div className="flex items-center gap-4 pr-3">
                {pendingContent !== null && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse">Syncing</span>}
                <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-12 max-w-5xl mx-auto w-full">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                onBlur={flushSave}
                placeholder="Title"
                className="w-full text-5xl font-black bg-transparent border-none outline-none mb-10 placeholder:text-slate-100 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tight"
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
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em]">Select a workspace</h2>
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