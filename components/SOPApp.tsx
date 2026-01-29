
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { SOP, SOPStep } from '../types';
import { 
  Plus, Search, FileText, Trash2, 
  Download, Sparkles, Pencil, X, 
  ChevronRight, Wrench, ListOrdered, Save, 
  Loader2, GripVertical, PlusCircle,
  Bold, Italic, Underline
} from 'lucide-react';
import { generateSOPContent } from '../services/geminiService';

interface SOPAppProps {
  sops: SOP[];
  onSaveSops: (sops: SOP[]) => void;
}

const SPRING_TRANSITION = { 
  type: "spring" as const, 
  stiffness: 450, 
  damping: 38, 
  mass: 0.8 
};

export const SOPApp: React.FC<SOPAppProps> = ({ sops, onSaveSops }) => {
  const [selectedSopId, setSelectedSopId] = useState<string | null>(sops[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Form states for new/editing
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');

  const activeSop = useMemo(() => sops.find(s => s.id === selectedSopId), [sops, selectedSopId]);

  const filteredSops = useMemo(() => {
    return sops.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
               .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  }, [sops, searchQuery]);

  const handleCreateSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    let tools: string[] = [];
    let steps: SOPStep[] = [];

    if (context.trim()) {
      setIsAiGenerating(true);
      const aiData = await generateSOPContent(title, context);
      tools = aiData.toolsUsed;
      steps = aiData.steps.map(s => ({ id: Math.random().toString(36).substr(2, 9), text: s }));
      setIsAiGenerating(false);
    }

    const newSop: SOP = {
      id: Date.now().toString(),
      title,
      toolsUsed: tools,
      steps: steps.length > 0 ? steps : [{ id: '1', text: 'Step 1: Define initial action...' }],
      lastModified: new Date()
    };

    onSaveSops([newSop, ...sops]);
    setSelectedSopId(newSop.id);
    setShowCreateModal(false);
    setTitle('');
    setContext('');
  };

  const handleUpdateSop = (id: string, updates: Partial<SOP>) => {
    onSaveSops(sops.map(s => s.id === id ? { ...s, ...updates, lastModified: new Date() } : s));
  };

  const handleDeleteSop = (id: string) => {
    if (confirm('Delete this SOP permanently?')) {
      const updated = sops.filter(s => s.id !== id);
      onSaveSops(updated);
      if (selectedSopId === id) setSelectedSopId(updated[0]?.id || null);
    }
  };

  const handleReorderSteps = (newSteps: SOPStep[]) => {
    if (!activeSop) return;
    handleUpdateSop(activeSop.id, { steps: newSteps });
  };

  const handleAddStep = () => {
    if (!activeSop) return;
    const newSteps = [...activeSop.steps, { id: Date.now().toString(), text: '' }];
    handleUpdateSop(activeSop.id, { steps: newSteps });
  };

  const handleUpdateStep = (stepId: string, text: string) => {
    if (!activeSop) return;
    const newSteps = activeSop.steps.map(s => s.id === stepId ? { ...s, text } : s);
    handleUpdateSop(activeSop.id, { steps: newSteps });
  };

  const handleDeleteStep = (stepId: string) => {
    if (!activeSop) return;
    const newSteps = activeSop.steps.filter(s => s.id !== stepId);
    handleUpdateSop(activeSop.id, { steps: newSteps });
  };

  const handleAddTool = (tool: string) => {
    if (!activeSop || !tool.trim()) return;
    if (activeSop.toolsUsed.includes(tool.trim())) return;
    handleUpdateSop(activeSop.id, { toolsUsed: [...activeSop.toolsUsed, tool.trim()] });
  };

  const handleRemoveTool = (tool: string) => {
    if (!activeSop) return;
    handleUpdateSop(activeSop.id, { toolsUsed: activeSop.toolsUsed.filter(t => t !== tool) });
  };

  const execFormatting = (cmd: string) => {
    document.execCommand(cmd, false);
  };

  const exportToDoc = () => {
    if (!activeSop) return;
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>${activeSop.title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; }
        h1 { color: #e11d48; border-bottom: 2px solid #e11d48; padding-bottom: 10px; }
        h2 { color: #475569; margin-top: 25px; }
        .tools { background: #f8fafc; padding: 10px; border-left: 5px solid #cbd5e1; }
        ol { margin-left: 20px; }
        li { margin-bottom: 12px; }
      </style>
      </head>
      <body>
        <h1>STANDARD OPERATING PROCEDURE</h1>
        <h2>TITLE: ${activeSop.title.toUpperCase()}</h2>
        <p><strong>Last Modified:</strong> ${activeSop.lastModified.toLocaleDateString()}</p>
        
        <h2>TOOLS USED</h2>
        <div class="tools">
          <p>${activeSop.toolsUsed.join(', ') || 'N/A'}</p>
        </div>
        
        <h2>STEP-BY-STEP PROCEDURE</h2>
        <ol>
          ${activeSop.steps.map(s => `<li>${s.text}</li>`).join('')}
        </ol>
        
        <br><br>
        <p><em>This document is ready for endorsement.</em></p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSop.title.replace(/\s+/g, '_')}_SOP.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-br from-rose-500 to-pink-600">DocFlow</h1>
          <button onClick={() => setShowCreateModal(true)} className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow-sm active:scale-95 transition-all">
            <Plus size={18} />
          </button>
        </div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
          {filteredSops.map(sop => (
            <button
              key={sop.id}
              onClick={() => setSelectedSopId(sop.id)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${selectedSopId === sop.id ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'}`}
            >
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{new Date(sop.lastModified).toLocaleDateString()}</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{sop.title}</h3>
              <div className="mt-2 flex items-center gap-1.5">
                 <ListOrdered size={10} className="text-slate-400" />
                 <span className="text-[9px] font-bold text-slate-500">{sop.steps.length} Steps</span>
              </div>
            </button>
          ))}
          {filteredSops.length === 0 && (
            <div className="py-20 text-center opacity-30">
               <FileText size={40} className="mx-auto mb-4" />
               <p className="text-[10px] font-bold uppercase tracking-widest">No SOPs found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeSop ? (
          <>
            <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl shadow-sm">
                   <FileText size={24} />
                </div>
                <div className="min-w-0">
                   <input 
                     value={activeSop.title} 
                     onChange={(e) => handleUpdateSop(activeSop.id, { title: e.target.value })}
                     className="text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white uppercase tracking-tight w-full max-w-lg truncate"
                   />
                   <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Standard Operating Procedure • Last Modified {activeSop.lastModified.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={exportToDoc} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                   <Download size={16} /> Export .doc
                 </button>
                 <button onClick={() => handleDeleteSop(activeSop.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all rounded-xl">
                   <Trash2 size={20} />
                 </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 pb-40 no-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12">
                
                {/* Tools Used Section */}
                <section>
                   <div className="flex items-center gap-3 mb-6">
                      <Wrench size={18} className="text-rose-500" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tools & Resources Used</h3>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-[2rem] p-8">
                      <div className="flex flex-wrap gap-2">
                         {activeSop.toolsUsed.map(tool => (
                           <span key={tool} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                             {tool}
                             <button onClick={() => handleRemoveTool(tool)} className="p-0.5 hover:text-red-500"><X size={12} /></button>
                           </span>
                         ))}
                         <input 
                           placeholder="Add tool..."
                           className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest text-slate-400 p-2 w-32"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               handleAddTool(e.currentTarget.value);
                               e.currentTarget.value = '';
                             }
                           }}
                         />
                      </div>
                   </div>
                </section>

                {/* Steps Section */}
                <section>
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <ListOrdered size={18} className="text-rose-500" />
                         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Step-by-Step Procedure</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                          <button onMouseDown={(e) => { e.preventDefault(); execFormatting('bold'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Bold"><Bold size={14} /></button>
                          <button onMouseDown={(e) => { e.preventDefault(); execFormatting('italic'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Italic"><Italic size={14} /></button>
                          <button onMouseDown={(e) => { e.preventDefault(); execFormatting('underline'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Underline"><Underline size={14} /></button>
                        </div>
                        <button onClick={handleAddStep} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-500 transition-colors">
                          <PlusCircle size={14} /> Add Step
                        </button>
                      </div>
                   </div>
                   
                   <Reorder.Group axis="y" values={activeSop.steps} onReorder={handleReorderSteps} className="space-y-4">
                      {activeSop.steps.map((step, index) => (
                        <Reorder.Item 
                          key={step.id} 
                          value={step}
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={SPRING_TRANSITION}
                          className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-rose-500/50 shadow-sm transition-all"
                        >
                           <div className="mt-2 text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing hover:text-rose-500 transition-colors">
                              <GripVertical size={20} />
                           </div>
                           <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-black text-lg shrink-0">
                             {index + 1}
                           </div>
                           <div className="flex-1 pt-2">
                              <div 
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => handleUpdateStep(step.id, e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{ __html: step.text }}
                                className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 font-medium min-h-[40px] focus:ring-0 focus:outline-none"
                              />
                           </div>
                           <button onClick={() => handleDeleteStep(step.id)} className="mt-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 size={16} />
                           </button>
                        </Reorder.Item>
                      ))}
                   </Reorder.Group>
                </section>
                
                <div className="pt-20 border-t border-slate-100 dark:border-slate-800 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Ready for Endorsement</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-20 opacity-20 select-none">
            <FileText size={80} strokeWidth={1} className="mb-6" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Draft Your Protocol</h2>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Initialize New SOP</h2>
                  <button onClick={() => setShowCreateModal(false)}><X size={24} className="text-slate-400" /></button>
               </div>
               <form onSubmit={handleCreateSOP} className="p-10 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Procedure Title</label>
                    <input 
                      required 
                      autoFocus
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. Weekly Reporting Structure" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:border-rose-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                       <Sparkles size={12} className="text-rose-500" /> AI Assistance Context (Optional)
                    </label>
                    <textarea 
                      value={context} 
                      onChange={(e) => setContext(e.target.value)} 
                      placeholder="Describe what this SOP covers. AI will draft tools and steps for you." 
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white outline-none focus:border-rose-500 resize-none" 
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Abort</button>
                    <button disabled={isAiGenerating} type="submit" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2">
                      {isAiGenerating ? <><Loader2 size={16} className="animate-spin" /> Drafting...</> : 'Create SOP'}
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
