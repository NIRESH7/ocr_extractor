import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Layout, Database } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import FolderList from './components/FolderList';

function App() {
    const [pointCount, setPointCount] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeFolder, setActiveFolder] = useState("default");

    const fetchCount = async () => {
        setIsRefreshing(true);
        try {
            const res = await axios.get('http://127.0.0.1:8000/debug/collection/');
            setPointCount(res.data.point_count);
        } catch {
            console.error("Failed to fetch point count");
            setPointCount(null);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    return (
        <div className="flex h-screen bg-[#b0c4de] overflow-hidden p-6 gap-6">
            {/* Sidebar */}
            <aside className="w-80 bg-[#f8fafc]/90 backdrop-blur-xl border border-white/40 flex flex-col z-20 shadow-2xl rounded-theme overflow-hidden">
                <div className="p-8 border-b border-indigo-50/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary theme-gradient rounded-xl shadow-lg shadow-primary/20">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            Neural RAG
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest pl-11">Knowledge Engine</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Status Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Infrastructure</span>
                            <button
                                onClick={fetchCount}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/50 border border-white p-3 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${pointCount !== null ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Qdrant</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{pointCount !== null ? 'Active' : 'Offline'}</p>
                            </div>
                            <div className="bg-white/50 border border-white p-3 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="w-3 h-3 text-secondary" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vectors</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{pointCount || 0}</p>
                            </div>
                        </div>
                    </div>

                    <FolderList
                        activeFolder={activeFolder}
                        onSelectFolder={setActiveFolder}
                    />
                </div>

                <div className="p-6 bg-white/20 backdrop-blur-sm border-t border-slate-100/50">
                    <FileUpload activeFolder={activeFolder} onUploadSuccess={fetchCount} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white/30 backdrop-blur-md rounded-theme border border-white/40 shadow-2xl">
                <header className="h-24 flex items-center px-10 justify-between z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1">Dashboard / Retrieval</span>
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">FMCG Workspace</h2>
                            <div className="h-4 w-[1px] bg-slate-300"></div>
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    {activeFolder === "All" ? "Global Search" : activeFolder}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden px-10 pb-10">
                    <div className="h-full max-w-6xl mx-auto flex flex-col">
                        <ChatWindow activeFolder={activeFolder} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
