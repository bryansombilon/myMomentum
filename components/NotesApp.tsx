import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task } from '../types';
import { 
  Plus, Trash2, Home, Search as SearchIcon, 
  FileText, Bold, Italic, Underline, Palette, CheckSquare, Tag as TagIcon, X as XIcon,
  Strikethrough, List, IndentIncrease, IndentDecrease, ChevronDown, ChevronLeft
} from 'lucide-react';

interface NotesAppProps {
  notes: Note[];
  tasks: Task[];
  onSaveNotes: (notes: Note[]) => void;
  onGoHome: () => void;
  onNavigateToTask: (taskId: string) => void;
  isMobile?: boolean;
}

const PRESET_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#64748b' },
];

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onGoHome, onNavigateToTask, isMobile }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showColorMenu, setShowColorMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobile && selectedNoteId) setShowMobileList(false);
  }, []);

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
    if (isMobile) setShowMobileList(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      onSaveNotes(updatedNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(updatedNotes[0]?.id || null);
        if (isMobile) setShowMobileList(true);
      }
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors ${isMobile && !showMobileList ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-orange-600">NoteFlow</h2>
          <button onClick={handleCreateNote} className="p-1.5 bg-amber-500 text-white rounded-md">
            <Plus size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-md text-xs font-semibold" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-3">
          {filteredNotes.map(note => (
            <button key={note.id} onClick={() => { setSelectedNoteId(note.id); if (isMobile) setShowMobileList(false); }} className={`w-full p-4 rounded-md text-left transition-all border ${selectedNoteId === note.id ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' : 'hover:bg-slate-50 border-transparent'}`}>
              <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{note.title || 'Untitled Note'}</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-500 line-clamp-1 mt-1 font-medium">{note.content.replace(/<[^>]*>?/gm, ' ')}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors ${isMobile && showMobileList ? 'hidden' : 'flex'}`}>
        {activeNote ? (
          <>
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-0.5">
                {isMobile && (
                  <button onClick={() => setShowMobileList(true)} className="p-2 mr-2 text-indigo-600">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                <ToolbarButton icon={Palette} onClick={() => setShowColorMenu(!showColorMenu)} title="Color" />
              </div>
              <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8">
              <input type="text" value={activeNote.title} onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })} className="w-full text-3xl md:text-5xl font-bold bg-transparent border-none outline-none mb-6 text-slate-900 dark:text-white" />
              <div ref={editorRef} contentEditable onInput={handleContentChange} className="w-full min-h-[60vh] outline-none text-base leading-relaxed dark:text-slate-100" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <h2 className="text-xs font-semibold uppercase tracking-widest">Select a Note</h2>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: any; onClick: () => void; title: string }> = ({ icon: Icon, onClick, title }) => (
  <button onClick={onClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400" title={title}>
    <Icon size={16} />
  </button>
);