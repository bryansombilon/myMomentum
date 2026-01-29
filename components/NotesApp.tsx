
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task, ProjectType } from '../types';
import { 
  Plus, Trash2, Search as SearchIcon, 
  FileText, Bold, Italic, Underline, Palette, CheckSquare, Tag as TagIcon, X as XIcon,
  Strikethrough, List, IndentIncrease, IndentDecrease, ChevronDown, Briefcase,
  Pin, PinOff, Link as LinkIcon, Filter, Sparkles, Check, ListOrdered, Menu, ChevronLeft
} from 'lucide-react';

interface NotesAppProps {
  notes: Note[];
  tasks: Task[];
  onSaveNotes: (notes: Note[]) => void;
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

const renderPreviewWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return <span key={index} className="text-amber-600 dark:text-amber-400 underline">{part}</span>;
    }
    return part;
  });
};

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onNavigateToTask }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const autoLinkTimeoutRef = useRef<number | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const projectTags = useMemo(() => Object.values(ProjectType), []);

  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagsSet.add(t)));
    projectTags.forEach(t => tagsSet.add(t));
    return Array.from(tagsSet).sort();
  }, [notes, projectTags]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(tag => tag.toLowerCase().includes(q));
      
      const matchesTag = !activeTagFilter || n.tags.includes(activeTagFilter);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });
  }, [notes, searchQuery, activeTagFilter]);

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

  const handleDetectLinks = (isAutomatic = false) => {
    if (!editorRef.current || !activeNote) return;
    const content = editorRef.current.innerHTML;
    const urlRegex = /(?<!href="|">|src=")(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    const newContent = content.replace(urlRegex, (match) => {
      const href = match.toLowerCase().startsWith('http') ? match : `https://${match}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; text-decoration: underline;">${match}</a>`;
    });
    
    if (newContent !== content) {
      if (isAutomatic) {
        const savedPos = saveCaretPosition(editorRef.current);
        editorRef.current.innerHTML = newContent;
        restoreCaretPosition(editorRef.current, savedPos);
      } else {
        editorRef.current.innerHTML = newContent;
      }
      handleContentChange();
    }
  };

  const saveCaretPosition = (el: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(el);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return {
      start: start,
      end: start + range.toString().length
    };
  };

  const restoreCaretPosition = (el: HTMLElement, savedSel: { start: number, end: number } | null) => {
    if (!savedSel) return;
    const selection = window.getSelection();
    if (!selection) return;
    
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(el, 0);
    range.collapse(true);
    const nodeStack: Node[] = [el];
    let node: Node | undefined;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const nextCharIndex = charIndex + (node as Text).length;
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleContentChange = () => {
    if (editorRef.current && activeNote) {
      const newContent = editorRef.current.innerHTML;
      setPendingContent(newContent);
      
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      if (autoLinkTimeoutRef.current) window.clearTimeout(autoLinkTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        handleUpdateNote(activeNote.id, { content: newContent });
        setPendingContent(null);
      }, 2000);

      autoLinkTimeoutRef.current = window.setTimeout(() => {
        handleDetectLinks(true);
      }, 1000);
    }
  };

  const flushSave = () => {
    if (pendingContent !== null && activeNote) {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      if (autoLinkTimeoutRef.current) window.clearTimeout(autoLinkTimeoutRef.current);
      handleUpdateNote(activeNote.id, { content: pendingContent });
      setPendingContent(null);
    }
  };

  const handleCreateNote = () => {
    flushSave();
    const newNote: Note = { id: Date.now().toString(), title: '', content: '<div>Start writing...</div>', lastModified: new Date(), tags: [], isPinned: false };
    onSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      onSaveNotes(updatedNotes);
      if (selectedNoteId === id) setSelectedNoteId(updatedNotes[0]?.id || null);
    }
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) handleUpdateNote(id, { isPinned: !note.isPinned });
  };

  const toggleTag = (tag: string) => {
    if (!activeNote) return;
    const cleanTag = tag.trim();
    if (activeNote.tags.includes(cleanTag)) {
      handleUpdateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== cleanTag) });
    } else {
      handleUpdateNote(activeNote.id, { tags: [...activeNote.tags, cleanTag] });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer as HTMLElement;
      if (container.nodeType === Node.TEXT_NODE) container = container.parentElement!;

      const checklistItem = container.closest('.checklist-item');

      if (checklistItem) {
        e.preventDefault();
        const textContent = (checklistItem as HTMLElement).innerText.trim();

        if (textContent === '' || textContent === '\u00A0') {
          const newLine = document.createElement('div');
          newLine.innerHTML = '<br>';
          checklistItem.replaceWith(newLine);
          
          const newRange = document.createRange();
          newRange.setStart(newLine, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          const newItem = document.createElement('div');
          newItem.className = 'checklist-item';
          newItem.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 4px;';
          newItem.innerHTML = '<input type="checkbox" style="width: 14px; height: 14px; cursor: pointer;"><span>&nbsp;</span>';
          
          checklistItem.after(newItem);

          const span = newItem.querySelector('span')!;
          const newRange = document.createRange();
          newRange.setStart(span, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        handleContentChange();
      }
    }
  };

  const execCommand = (command: string, value: string = '') => {
    if (command === 'createLink') {
      const url = prompt('Enter the URL:');
      if (!url) return;
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, value);
    }
    handleContentChange();
    editorRef.current?.focus();
  };

  const selectNote = (id: string) => {
    flushSave();
    setSelectedNoteId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className={`transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden md:w-16'}`}>
        <div className={`flex flex-col h-full ${!isSidebarOpen && 'md:opacity-0'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-orange-600 truncate">NoteFlow</h2>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={handleCreateNote} className="p-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md shadow-sm transition-all active:scale-95">
                <Plus size={18} />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md">
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-md text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter size={12} className="text-amber-500 shrink-0" />
                  <span className="truncate">{activeTagFilter || 'All Tags'}</span>
                </div>
                <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar"
                    >
                      <button 
                        onClick={() => { setActiveTagFilter(null); setIsFilterDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-left transition-colors ${!activeTagFilter ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                        All Tags
                        {!activeTagFilter && <Check size={12} />}
                      </button>
                      {allAvailableTags.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => { setActiveTagFilter(tag); setIsFilterDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-left transition-colors ${activeTagFilter === tag ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                          {tag}
                          {activeTagFilter === tag && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-3 pb-32 scrollbar-hide">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={`w-full p-4 rounded-md text-left group transition-all border relative ${
                  selectedNoteId === note.id 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 shadow-sm' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(note.lastModified))}
                  </span>
                  {note.isPinned && <Pin size={10} className="fill-amber-500 text-amber-500" />}
                </div>
                <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 leading-tight pr-4">
                  {note.title || 'Untitled'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-500 line-clamp-1 mt-2 font-semibold italic opacity-70">
                  {renderPreviewWithLinks(note.content.replace(/<[^>]*>?/gm, ' '))}
                </p>
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <div className="py-12 text-center opacity-30">
                 <FileText size={24} className="mx-auto mb-2" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">No notes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors relative">
        {activeNote ? (
          <>
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-30 shadow-sm">
              <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar max-w-[70%]">
                {!isSidebarOpen && (
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:text-amber-600">
                    <Menu size={18} />
                  </button>
                )}
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
                <ToolbarButton icon={CheckSquare} onClick={() => execCommand('insertHTML', '<div class="checklist-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><input type="checkbox" style="width: 14px; height: 14px; cursor: pointer;"><span>&nbsp;</span></div>')} title="Checklist" />
                <ToolbarButton icon={Palette} onClick={() => setShowColorMenu(!showColorMenu)} title="Color" />
              </div>
              <div className="flex items-center gap-1 md:gap-2 pr-2 shrink-0">
                <button 
                  onClick={() => togglePin(activeNote.id)}
                  className={`p-2 rounded-lg transition-all ${activeNote.isPinned ? 'text-amber-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Pin size={18} className={activeNote.isPinned ? 'fill-amber-600' : ''} />
                </button>
                <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-500 hover:text-red-500 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-24 lg:px-32 py-8 pb-48 w-full">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                onBlur={flushSave}
                placeholder="Untitled Note"
                className="w-full text-3xl md:text-5xl font-bold bg-transparent border-none outline-none mb-6 placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tight"
              />

              <div className="flex flex-wrap items-center gap-2 mb-8">
                 <TagIcon size={14} className="text-slate-400" />
                 {activeNote.tags.map(tag => (
                   <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                     {tag}
                     <button onClick={() => handleRemoveTag(tag)} className="opacity-40 hover:opacity-100"><XIcon size={10} /></button>
                   </span>
                 ))}
                 <input 
                   type="text"
                   placeholder="+"
                   value={newTagInput}
                   onChange={(e) => setNewTagInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && addTag(newTagInput)}
                   className="bg-transparent border-none outline-none text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-12"
                 />
              </div>

              <div 
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={flushSave}
                className="note-editor w-full min-h-[50vh] bg-transparent border-none outline-none text-[16px] md:text-lg leading-relaxed max-w-none text-slate-800 dark:text-slate-100"
                style={{ outline: 'none' }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 opacity-20 select-none">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 p-3 bg-indigo-600 text-white rounded-full">
                <Menu size={20} />
              </button>
            )}
            <FileText size={80} strokeWidth={1} className="mb-6" />
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em]">Select a workspace</h2>
          </div>
        )}
        
        {/* Color Menu Positioned for Mobile */}
        <AnimatePresence>
          {showColorMenu && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:justify-start p-4 bg-black/20 sm:bg-transparent" onClick={() => setShowColorMenu(false)}>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-40 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-xl shadow-2xl grid grid-cols-3 gap-3 sm:gap-2 mb-20 sm:mb-0"
              >
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => { execCommand('foreColor', c.value); setShowColorMenu(false); }}
                    className="w-full aspect-square rounded-full border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: c.value === 'inherit' ? 'transparent' : c.value }}
                  >
                    {c.value === 'inherit' && <XIcon size={12} className="text-slate-400" />}
                  </button>
                ))}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ElementType; onClick: () => void; title: string }> = ({ icon: Icon, onClick, title }) => (
  <button onClick={onClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400" title={title}>
    <Icon size={16} />
  </button>
);
