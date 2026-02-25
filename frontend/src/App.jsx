import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Layout, Database } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import FolderList from './components/FolderList';
import FileViewerModal from './components/FileViewerModal';

function App() {
    const [pointCount, setPointCount] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeFolder, setActiveFolder] = useState("default");
    const [viewerState, setViewerState] = useState({ isOpen: false, folder: null });

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
        <div className="flex h-screen bg-slate-50 overflow-hidden p-6 gap-6">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-600 rounded-lg shadow-sm text-white">
                            <Layout className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                NeuralRAG
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Knowledge Interface</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-10 custom-scrollbar">
                    {/* Status Section */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</span>
                            <button
                                onClick={fetchCount}
                                className={`p-1.5 rounded-md hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin' : ''} text-slate-400`}
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-tight">Latency</span>
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${pointCount !== null ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <p className="text-[11px] font-bold text-slate-700">{pointCount !== null ? 'Nominal' : 'Searching'}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-tight">Vectors</span>
                                <div className="flex items-center gap-2.5">
                                    <Database className="w-3.5 h-3.5 text-slate-300" />
                                    <p className="text-[11px] font-bold text-slate-700">{pointCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <FolderList
                        activeFolder={activeFolder}
                        onSelectFolder={setActiveFolder}
                        onViewFiles={(folder) => setViewerState({ isOpen: true, folder })}
                    />
                </div>

                <div className="p-8 border-t border-slate-100 bg-white">
                    <FileUpload activeFolder={activeFolder} onUploadSuccess={fetchCount} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white border border-slate-200 rounded-3xl workspace-shadow">
                <header className="h-20 flex items-center px-12 justify-between z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">
                            {activeFolder === "All" ? "Enterprise Workspace" : activeFolder}
                        </h2>
                        <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-700 flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            {activeFolder === "All" ? "SYSTEM CONTEXT" : "LOCAL SCOPE"}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden px-12 pb-8">
                    <div className="h-full max-w-5xl mx-auto flex flex-col">
                        <ChatWindow activeFolder={activeFolder} />
                    </div>
                </div>
            </main>

            <FileViewerModal
                isOpen={viewerState.isOpen}
                onClose={() => setViewerState({ isOpen: false, folder: null })}
                folderName={viewerState.folder}
            />
        </div>
    );
}

export default App;
