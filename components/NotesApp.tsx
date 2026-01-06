
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Task, ProjectType } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Search, Plus, Trash2, Home, Search as SearchIcon, 
  FileText, Clock, Bold, Italic, Underline,
  List, ListOrdered, Quote, Share2, Palette, CheckSquare, ChevronDown, RemoveFormatting, Tag as TagIcon, X as XIcon, Languages,
  ChevronUp
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
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Gray', value: '#64748b' },
];

export const NotesApp: React.FC<NotesAppProps> = ({ notes, tasks, onSaveNotes, onGoHome, onNavigateToTask }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  
  // Tag Auto-complete state
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Mention State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCoords, setMentionCoords] = useState<{ top: number; left: number } | null>(null);
  const [mentionSelectionRange, setMentionSelectionRange] = useState<Range | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const colorPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(tag => tag.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  }, [notes, searchQuery]);

  // IMPORTANT: Initialize activeNote before useMemo hooks that depend on it
  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Extract all existing unique tags from all notes and projects
  const allAvailableTags = useMemo(() => {
    const noteTags = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => noteTags.add(t)));
    
    const projectTags = Object.values(PROJECT_CONFIG).map(p => p.name);
    
    // Combine and remove duplicates, case-insensitive
    const combined = Array.from(new Set([...Array.from(noteTags), ...projectTags]));
    return combined.sort();
  }, [notes]);

  const tagSuggestions = useMemo(() => {
    const q = newTagInput.toLowerCase().trim();
    // If input is empty, show all available tags that aren't already on this note
    if (!q) {
      return allAvailableTags
        .filter(t => !(activeNote?.tags.includes(t)))
        .slice(0, 8);
    }
    return allAvailableTags
      .filter(t => t.toLowerCase().includes(q) && !(activeNote?.tags.includes(t)))
      .slice(0, 8);
  }, [newTagInput, allAvailableTags, activeNote]);

  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    setPendingContent(null);
    setMentionQuery(null);
    setNewTagInput('');
    setShowTagSuggestions(false);
  }, [selectedNoteId]);

  // Handle clicks outside to close UI elements
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Handle Color Picker outside click
      if (showColorPicker) {
        const isOutsideDropdown = colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node);
        const isOutsideTrigger = colorPickerTriggerRef.current && !colorPickerTriggerRef.current.contains(e.target as Node);
        
        if (isOutsideDropdown && isOutsideTrigger) {
          setShowColorPicker(false);
        }
      }
      
      // Close tag suggestions if clicking outside input/dropdown
      if (tagInputRef.current && !tagInputRef.current.contains(e.target as Node)) {
        setShowTagSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, lastModified: new Date() } : n
    );
    onSaveNotes(updatedNotes);
  };

  const handleContentChange = () => {
    if (editorRef.current && activeNote) {
      const newContent = editorRef.current.innerHTML;
      setPendingContent(newContent);
      
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        handleUpdateNote(activeNote.id, { content: newContent });
        setPendingContent(null);
      }, 3000);
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
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '<div>Start writing...</div>',
      lastModified: new Date(),
      tags: []
    };
    onSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      onSaveNotes(updatedNotes);
      if (selectedNoteId === id) setSelectedNoteId(updatedNotes[0]?.id || null);
    }
  };

  const addTag = (tag: string) => {
    if (!activeNote) return;
    const cleanTag = tag.trim();
    if (cleanTag && !activeNote.tags.includes(cleanTag)) {
      handleUpdateNote(activeNote.id, { tags: [...activeNote.tags, cleanTag] });
    }
    setNewTagInput('');
    setShowTagSuggestions(false);
    setActiveSuggestionIndex(0);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (showTagSuggestions && tagSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev + 1) % tagSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev - 1 + tagSuggestions.length) % tagSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addTag(tagSuggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowTagSuggestions(false);
      }
    } else if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      addTag(newTagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (activeNote) {
      handleUpdateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tagToRemove) });
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    if (editorRef.current) editorRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
      }
    }

    if (e.key === '@') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMentionCoords({ 
          top: rect.bottom + window.scrollY, 
          left: rect.left + window.scrollX 
        });
        setMentionSelectionRange(range.cloneRange());
        setMentionQuery("");
      }
    } else if (mentionQuery !== null) {
      if (e.key === 'Escape' || (e.key === ' ' && mentionQuery === "")) {
        setMentionQuery(null);
      } else if (e.key === 'Backspace') {
        if (mentionQuery === "") setMentionQuery(null);
        else setMentionQuery(mentionQuery.slice(0, -1));
      } else if (e.key.length === 1) {
        setMentionQuery(mentionQuery + e.key);
      }
    }
  };

  const insertTaskTag = (task: Task) => {
    if (!mentionSelectionRange) return;
    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(mentionSelectionRange);
    
    document.execCommand('delete', false);
    for (let i = 0; i < (mentionQuery || "").length; i++) {
        document.execCommand('delete', false);
    }

    const project = PROJECT_CONFIG[task.project];
    const tagHtml = `
      <span 
        contenteditable="false" 
        data-task-id="${task.id}"
        class="task-tag inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors border border-indigo-200 dark:border-indigo-700 mx-0.5 my-0.5 align-baseline select-none"
        onclick="window.dispatchEvent(new CustomEvent('navigateToTask', { detail: '${task.id}' }))"
      >
        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${project.color}"></span>
        ${task.title}
      </span>&nbsp;`;

    document.execCommand('insertHTML', false, tagHtml);
    setMentionQuery(null);
    handleContentChange();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');

    // Robust Regex to detect URLs (http/https or www.)
    const universalUrlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

    const linkifyMatch = (url: string) => {
      const href = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">${url}</a>`;
    };

    /**
     * Sanitizes DOM elements to remove clashing styles like hardcoded colors, 
     * font families, and background colors that don't play well with Dark Mode.
     */
    const sanitizeElement = (el: HTMLElement) => {
      // List of properties to strip to ensure theme consistency
      const stylePropsToClear = [
        'backgroundColor', 'background', 'backgroundImage', 'color', 
        'fontFamily', 'fontSize', 'lineHeight'
      ];
      
      stylePropsToClear.forEach(prop => {
        (el.style as any)[prop] = '';
      });
      
      // Remove legacy background color attribute
      el.removeAttribute('bgcolor');

      // Recursively sanitize children
      Array.from(el.children).forEach(child => sanitizeElement(child as HTMLElement));
    };

    /**
     * Finds and linkifies URLs within text nodes, avoiding elements already inside <a> tags.
     */
    const linkifyTextNodes = (container: Node) => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      let node;
      const nodesToReplace: { node: Node; html: string }[] = [];

      while (node = walker.nextNode()) {
        if (node.parentElement?.tagName.toLowerCase() !== 'a') {
          const content = node.nodeValue || '';
          if (content.match(universalUrlRegex)) {
            const html = content.replace(universalUrlRegex, linkifyMatch);
            nodesToReplace.push({ node, html });
          }
        }
      }

      nodesToReplace.forEach(({ node, html }) => {
        const span = document.createElement('span');
        span.innerHTML = html;
        node.parentNode?.replaceChild(span, node);
      });
    };

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 1. Sanitize all elements
      Array.from(doc.body.children).forEach(child => {
        if (child instanceof HTMLElement) sanitizeElement(child);
      });

      // 2. Linkify any raw URLs in text nodes
      linkifyTextNodes(doc.body);

      document.execCommand('insertHTML', false, doc.body.innerHTML);
    } else {
      // Linkify plain text
      const linkifiedText = text.replace(universalUrlRegex, linkifyMatch);
      // Split into <div> lines to maintain formatting
      const finalHtml = linkifiedText.split('\n').map(line => `<div>${line || '<br>'}</div>`).join('');
      document.execCommand('insertHTML', false, finalHtml);
    }
    
    handleContentChange();
  };

  useEffect(() => {
    const handleNav = (e: any) => onNavigateToTask(e.detail);
    window.addEventListener('navigateToTask', handleNav);
    return () => window.removeEventListener('navigateToTask', handleNav);
  }, [onNavigateToTask]);

  const getTagStyle = (tag: string) => {
    // Check if tag matches any project name from Task side
    const project = Object.values(PROJECT_CONFIG).find(p => p.name.toLowerCase() === tag.toLowerCase());
    if (project) {
      return {
        backgroundColor: `${project.color}15`,
        borderColor: `${project.color}30`,
        color: project.color
      };
    }
    // Default tag aesthetic
    return {
      backgroundColor: 'var(--slate-100)',
      borderColor: 'var(--slate-200)',
      color: 'var(--slate-600)'
    };
  };

  const filteredMentionTasks = useMemo(() => {
    if (mentionQuery === null) return [];
    return tasks.filter(t => t.title.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5);
  }, [tasks, mentionQuery]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={() => { flushSave(); onGoHome(); }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <Home size={20} />
          </button>
          <h2 className="font-bold text-lg">Notes</h2>
          <button 
            onClick={handleCreateNote}
            className="p-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { flushSave(); setSelectedNoteId(note.id); }}
              className={`w-full p-4 rounded-xl text-left transition-all group relative overflow-hidden ${
                selectedNoteId === note.id 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 shadow-sm' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedNoteId === note.id ? 'text-amber-600' : 'text-slate-400'}`}>
                  {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                {selectedNoteId === note.id && (
                  <motion.div layoutId="activeNote" className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </div>
              <h3 className="font-bold text-sm truncate pr-4">{note.title || 'Untitled Note'}</h3>
              <div className="flex flex-wrap gap-1 mt-1.5 mb-1 opacity-80">
                {note.tags.map(tag => {
                  const style = getTagStyle(tag);
                  return (
                    <span 
                      key={tag} 
                      className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight border"
                      style={{ 
                        backgroundColor: style.backgroundColor, 
                        borderColor: style.borderColor, 
                        color: style.color 
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {note.content.replace(/<[^>]*>?/gm, ' ').slice(0, 100) || 'Empty note...'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors">
        {activeNote ? (
          <>
            {/* Toolbar - Removed overflow-x-auto to ensure dropdown is visible */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 transition-colors z-30">
              <div className="flex items-center gap-0.5">
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} onMouseDown={(e) => e.preventDefault()} title="Bold (Ctrl+B)" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} onMouseDown={(e) => e.preventDefault()} title="Italic (Ctrl+I)" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} onMouseDown={(e) => e.preventDefault()} title="Underline (Ctrl+U)" />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} onMouseDown={(e) => e.preventDefault()} title="Bullet List" />
                <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} onMouseDown={(e) => e.preventDefault()} title="Numbered List" />
                <ToolbarButton icon={Quote} onClick={() => execCommand('formatBlock', 'blockquote')} onMouseDown={(e) => e.preventDefault()} title="Quote" />
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                
                {/* Quick Preset Colors */}
                <div className="flex items-center gap-1.5 px-1.5">
                  {PRESET_COLORS.slice(1, 4).map(color => (
                    <button
                      key={color.name}
                      onMouseDown={(e) => e.preventDefault()} // Keep selection
                      onClick={() => execCommand('foreColor', color.value)}
                      className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 hover:scale-125 transition-transform shadow-sm cursor-pointer"
                      style={{ backgroundColor: color.value }}
                      title={`Text Color: ${color.name}`}
                    />
                  ))}
                </div>

                {/* Enhanced Color Picker */}
                <div className="relative">
                  <button 
                    ref={colorPickerTriggerRef}
                    onMouseDown={(e) => e.preventDefault()} // Preserve selection
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400 flex items-center gap-1 ${showColorPicker ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : ''}`}
                    title="Text Color Palette"
                  >
                    <Palette size={18} />
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showColorPicker ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div 
                        ref={colorPickerRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-4 w-56"
                      >
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Presets</div>
                        <div className="grid grid-cols-4 gap-2.5 mb-5">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color.name}
                              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                              onClick={() => { execCommand('foreColor', color.value); setShowColorPicker(false); }}
                              className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform shadow-sm flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900"
                              style={{ color: color.value === 'inherit' ? 'currentColor' : color.value }}
                              title={color.name}
                            >
                              {color.value === 'inherit' ? (
                                <RemoveFormatting size={18} className="text-slate-400" />
                              ) : (
                                <div className="w-6 h-6 rounded-md shadow-inner" style={{ backgroundColor: color.value }} />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                          <div className="flex items-center justify-between mb-2.5 px-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Custom Pick</span>
                          </div>
                          <div className="relative h-12 w-full rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 shadow-inner group/picker hover:border-indigo-400 transition-colors">
                            <input 
                              type="color" 
                              onMouseDown={(e) => e.stopPropagation()} // Allow interaction
                              onInput={(e) => {
                                const val = (e.target as HTMLInputElement).value;
                                execCommand('foreColor', val);
                              }}
                              className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer bg-transparent border-none p-0 outline-none"
                              title="Pick custom hex color"
                            />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-black text-white mix-blend-difference opacity-0 group-hover/picker:opacity-100 transition-opacity uppercase tracking-tighter">
                              Choose Color
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                
                {/* Spellcheck Toggle */}
                <button 
                  onClick={() => setSpellcheckEnabled(!spellcheckEnabled)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`p-1.5 rounded transition-colors flex items-center gap-1.5 ${
                    spellcheckEnabled 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={spellcheckEnabled ? "Grammar Check ON" : "Grammar Check OFF"}
                >
                  <Languages size={18} />
                  {spellcheckEnabled && <span className="text-[10px] font-black uppercase tracking-tighter">Live</span>}
                </button>
              </div>

              <div className="flex items-center gap-2 pr-2">
                {pendingContent !== null && (
                  <span className="text-[10px] font-bold text-amber-500 animate-pulse flex items-center gap-1 mr-2">
                    <Clock size={10} /> Saving...
                  </span>
                )}
                <button 
                  onClick={() => handleDeleteNote(activeNote.id)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Editing Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full relative">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                onBlur={flushSave}
                placeholder="Title"
                className="w-full text-4xl font-black bg-transparent border-none outline-none mb-4 placeholder:text-slate-200 dark:placeholder:text-slate-800"
              />

              {/* Tag Management Area */}
              <div className="flex flex-wrap items-center gap-2 mb-8 relative">
                <TagIcon size={14} className="text-slate-400" />
                {activeNote.tags.map(tag => {
                  const style = getTagStyle(tag);
                  return (
                    <span 
                      key={tag} 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border group/tag shadow-sm hover:scale-105"
                      style={{ 
                        backgroundColor: style.backgroundColor, 
                        borderColor: style.borderColor, 
                        color: style.color 
                      }}
                    >
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  );
                })}
                
                <div className="relative flex-1 min-w-[150px]" ref={tagInputRef}>
                  <input 
                    type="text"
                    placeholder="Add a new tag..."
                    value={newTagInput}
                    onFocus={() => {
                      setShowTagSuggestions(true);
                      setActiveSuggestionIndex(0);
                    }}
                    onChange={(e) => {
                      setNewTagInput(e.target.value);
                      setShowTagSuggestions(true);
                      setActiveSuggestionIndex(0);
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-500 focus:text-slate-900 dark:focus:text-slate-100 py-1"
                  />
                  
                  {/* Tag Suggestions Dropdown */}
                  <AnimatePresence>
                    {showTagSuggestions && tagSuggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions</span>
                          <ChevronUp size={10} className="text-slate-400" />
                        </div>
                        {tagSuggestions.map((suggestion, index) => {
                          const style = getTagStyle(suggestion);
                          return (
                            <button
                              key={suggestion}
                              onClick={() => addTag(suggestion)}
                              onMouseEnter={() => setActiveSuggestionIndex(index)}
                              className={`w-full flex items-center gap-2 p-2.5 text-left transition-colors ${
                                index === activeSuggestionIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: style.color }}
                              />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{suggestion}</span>
                              {index === activeSuggestionIndex && (
                                <span className="ml-auto text-[10px] text-indigo-400 font-medium">Enter</span>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-10 text-[10px] md:text-xs font-bold text-slate-400 border-y border-slate-100 dark:border-slate-900 py-4 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Clock size={14} /> Updated {new Date(activeNote.lastModified).toLocaleTimeString()}</div>
                <div className="flex items-center gap-2"><FileText size={14} /> {activeNote.content.replace(/<[^>]*>?/gm, ' ').split(/\s+/).filter(Boolean).length} words</div>
                {spellcheckEnabled && (
                  <div className="ml-auto text-indigo-500/60 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Grammar Active
                  </div>
                )}
              </div>
              
              <div 
                ref={editorRef}
                contentEditable
                spellCheck={spellcheckEnabled}
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={flushSave}
                className="w-full h-auto min-h-[60vh] bg-transparent border-none outline-none text-lg md:text-xl leading-relaxed placeholder:text-slate-200 dark:placeholder:text-slate-800 font-sans prose dark:prose-invert max-w-none pb-20"
                style={{ outline: 'none' }}
              />

              {/* Mention Dropdown with Search */}
              <AnimatePresence>
                {mentionQuery !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                      position: 'absolute', 
                      top: mentionCoords?.top ? mentionCoords.top - editorRef.current!.getBoundingClientRect().top + 20 : 0, 
                      left: mentionCoords?.left ? mentionCoords.left - editorRef.current!.getBoundingClientRect().left : 0 
                    }}
                    className="z-[100] w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 overflow-hidden"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-1 flex items-center justify-between">
                      <span>Link a Task</span>
                      <span className="text-indigo-500 lowercase font-medium">@{mentionQuery}</span>
                    </div>
                    {filteredMentionTasks.length > 0 ? (
                      filteredMentionTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => insertTaskTag(task)}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CheckSquare size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold truncate text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{task.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROJECT_CONFIG[task.project].color }} />
                              {PROJECT_CONFIG[task.project].name}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs italic">
                        No tasks found matching "{mentionQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <style>{`
                [contenteditable] {
                  min-height: 60vh;
                }
                [contenteditable] ul {
                  list-style-type: disc;
                  padding-left: 1.5rem;
                  margin: 1rem 0;
                }
                [contenteditable] ol {
                  list-style-type: decimal;
                  padding-left: 1.5rem;
                  margin: 1rem 0;
                }
                [contenteditable] blockquote {
                  border-left: 4px solid #f59e0b;
                  padding-left: 1.5rem;
                  font-style: italic;
                  color: #64748b;
                  margin: 2rem 0;
                  background: rgba(245, 158, 11, 0.05);
                  padding-top: 1rem;
                  padding-bottom: 1rem;
                  border-radius: 0 8px 8px 0;
                }
                [contenteditable] a {
                  color: #4f46e5;
                  text-decoration: underline;
                  font-weight: 500;
                }
                .dark [contenteditable] a {
                  color: #818cf8;
                }
                [contenteditable]:empty:before {
                  content: "Start writing your thoughts... Type @ to link a task.";
                  color: #94a3b8;
                  pointer-events: none;
                }
                .task-tag:hover {
                    filter: brightness(1.05);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                }
                .prose div {
                  margin-bottom: 0.5em;
                }
              `}</style>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800 shadow-inner">
              <FileText size={40} className="opacity-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Workspace Ready</h2>
            <p className="max-w-xs text-sm leading-relaxed">Select a note from the sidebar or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon: Icon, onClick, onMouseDown, title }) => (
  <button 
    onClick={onClick} 
    onMouseDown={onMouseDown}
    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400 active:scale-90" 
    title={title}
  >
    <Icon size={18} />
  </button>
);
