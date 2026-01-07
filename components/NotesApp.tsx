import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task, ProjectType } from '../types';
import { 
  Plus, Trash2, Home, Search as SearchIcon, 
  FileText, Bold, Italic, Underline, Palette, CheckSquare, Tag as TagIcon, X as XIcon,
  Strikethrough, List, IndentIncrease, IndentDecrease, ChevronDown, Briefcase,
  Pin, PinOff, Link as LinkIcon, Filter, Sparkles, Check
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

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onGoHome, onNavigateToTask }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showColorMenu, setShowColorMenu] = useState(false);
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

  // Helper to save and restore cursor position when modifying content
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
    // Fix: Explicitly type nodeStack as Node[] to avoid "ChildNode not assignable to HTMLElement" error
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

  const handleDetectLinks = (isAutomatic = false) => {
    if (!editorRef.current || !activeNote) return;
    const content = editorRef.current.innerHTML;
    const urlRegex = /(?<!href="|">|src=")(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    const newContent = content.replace(urlRegex, (match) => {
      const href = match.toLowerCase().startsWith('http') ? match : `https://${match}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; text-decoration: underline;">${match}</a>`;
    });
    
    if (newContent !== content) {
      // Automatic detection should preserve the cursor
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

  const handleContentChange = () => {
    if (editorRef.current && activeNote) {
      const newContent = editorRef.current.innerHTML;
      setPendingContent(newContent);
      
      // Clear existing timeouts
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      if (autoLinkTimeoutRef.current) window.clearTimeout(autoLinkTimeoutRef.current);

      // Save content after 2s of inactivity
      saveTimeoutRef.current = window.setTimeout(() => {
        handleUpdateNote(activeNote.id, { content: newContent });
        setPendingContent(null);
      }, 2000);

      // Auto-detect links after 1s of inactivity
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

        // If checklist item is essentially empty, convert to regular line
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
          // Create new checklist item
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

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { flushSave(); onGoHome(); }} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
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

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search notes..."
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
              <div className="flex items-center gap-2">
                <Filter size={12} className="text-amber-500" />
                <span>{activeTagFilter || 'All Tags'}</span>
              </div>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
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

        <div className="flex-1 overflow-y-auto space-y-1 p-3 scrollbar-hide">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { flushSave(); setSelectedNoteId(note.id); }}
              className={`w-full p-4 rounded-md text-left group transition-all border relative ${
                selectedNoteId === note.id 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 shadow-sm' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                {note.isPinned && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Pin size={10} className="fill-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Pinned</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 leading-tight pr-4">
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-500 line-clamp-1 mt-2 font-semibold italic opacity-70">
                {renderPreviewWithLinks(note.content.replace(/<[^>]*>?/gm, ' '))}
              </p>
              
              <div 
                onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all opacity-0 group-hover:opacity-100 ${note.isPinned ? 'text-amber-600' : 'text-slate-400'}`}
                title={note.isPinned ? "Unpin Note" : "Pin Note"}
              >
                {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              </div>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="py-12 text-center opacity-30">
               <FileText size={24} className="mx-auto mb-2" />
               <p className="text-[10px] font-bold uppercase tracking-widest">No notes found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors">
        {activeNote ? (
          <>
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-30 shadow-sm">
              <div className="flex items-center gap-0.5">
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
                <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikethrough')} title="Strikethrough" />
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />
                
                <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                <ToolbarButton icon={CheckSquare} onClick={() => execCommand('insertHTML', '<div class="checklist-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><input type="checkbox" style="width: 14px; height: 14px; cursor: pointer;"><span>&nbsp;</span></div>')} title="Checklist" />
                <ToolbarButton icon={LinkIcon} onClick={() => execCommand('createLink')} title="Insert Manual Link" />
                <button 
                  onClick={() => handleDetectLinks(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-all border border-indigo-100 dark:border-indigo-900/50 ml-1"
                  title="Force Detect Hyperlinks"
                >
                  <Sparkles size={12} /> Scan Links
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />

                <ToolbarButton icon={IndentDecrease} onClick={() => execCommand('outdent')} title="Reverse Indent" />
                <ToolbarButton icon={IndentIncrease} onClick={() => execCommand('indent')} title="Indent" />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1.5" />

                <div className="relative">
                  <button 
                    onClick={() => setShowColorMenu(!showColorMenu)}
                    className={`flex items-center gap-1 p-2 rounded-lg transition-all ${showColorMenu ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    title="Text Color"
                  >
                    <Palette size={16} />
                    <ChevronDown size={10} className={`transition-transform duration-200 ${showColorMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showColorMenu && (
                      <>
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
                              {c.value === 'inherit' && <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-900">X</div>}
                            </button>
                          ))}
                          <button 
                            onClick={() => { colorInputRef.current?.click(); }}
                            className="col-span-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
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
              <div className="flex items-center gap-2 pr-3 shrink-0">
                <button 
                  onClick={() => togglePin(activeNote.id)}
                  className={`p-2 rounded-lg transition-all ${activeNote.isPinned ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={activeNote.isPinned ? "Unpin Note" : "Pin Note"}
                >
                  <Pin size={18} className={activeNote.isPinned ? 'fill-amber-600' : ''} />
                </button>
                {pendingContent !== null && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 animate-pulse bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Syncing</span>}
                <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 md:px-24 lg:px-32 py-8 w-full">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                onBlur={flushSave}
                placeholder="Untitled Note"
                className="w-full text-5xl font-bold bg-transparent border-none outline-none mb-6 placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tight"
              />

              <div className="space-y-4 mb-10">
                <div className="flex flex-wrap items-center gap-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2">
                     <Briefcase size={10} /> Project Tags:
                   </div>
                   {projectTags.map(proj => (
                     <button
                       key={proj}
                       onClick={() => toggleTag(proj)}
                       className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter transition-all ${activeNote.tags.includes(proj) ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}
                     >
                       {proj}
                     </button>
                   ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 relative">
                  <TagIcon size={14} className="text-slate-500 dark:text-slate-400" />
                  {activeNote.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="opacity-40 hover:opacity-100 transition-opacity p-0.5"><XIcon size={10} /></button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    placeholder="Add custom tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag(newTagInput)}
                    className="bg-transparent border-none outline-none text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-32 focus:text-slate-800 dark:focus:text-slate-200 transition-colors"
                  />
                </div>
              </div>

              <div 
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={flushSave}
                className="w-full h-auto min-h-[60vh] bg-transparent border-none outline-none text-lg leading-relaxed prose dark:prose-invert max-w-none pb-40 text-slate-800 dark:text-slate-100"
                style={{ outline: 'none' }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-10 opacity-20 select-none">
            <FileText size={80} strokeWidth={1} className="mb-6" />
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em]">Select a workspace</h2>
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