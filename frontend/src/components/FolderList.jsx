import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, Plus, ChevronRight, Hash } from 'lucide-react';

const FolderList = ({ activeFolder, onSelectFolder }) => {
    const [folders, setFolders] = useState(["default"]);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchFolders = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/folders');
            setFolders(res.data.folders);
        } catch (error) {
            console.error("Failed to fetch folders", error);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            await axios.post('http://127.0.0.1:8000/folders', { folder_name: newFolderName });
            setNewFolderName("");
            setIsCreating(false);
            fetchFolders();
        } catch (error) {
            console.error("Failed to create folder", error);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-slate-400/80">Knowledge Base</span>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-primary transition-all hover:shadow-sm"
                >
                    <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isCreating ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateFolder} className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative group">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="New folder name..."
                            autoFocus
                            className="w-full bg-white/70 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-slate-300"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1.5 p-1 bg-primary text-white rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-1">
                <button
                    onClick={() => onSelectFolder("All")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeFolder === "All"
                            ? 'theme-gradient text-white shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'text-slate-600 hover:bg-white/60 hover:shadow-sm'
                        }`}
                >
                    <Hash className={`w-4 h-4 ${activeFolder === "All" ? 'text-white/80' : 'text-slate-400 group-hover:text-primary'}`} />
                    <span className="text-xs font-bold truncate">Global Search</span>
                </button>

                {folders.map((folder) => (
                    <button
                        key={folder}
                        onClick={() => onSelectFolder(folder)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeFolder === folder
                                ? 'theme-gradient text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'text-slate-600 hover:bg-white/60 hover:shadow-sm'
                            }`}
                    >
                        <Folder className={`w-4 h-4 ${activeFolder === folder ? 'text-white/80' : 'text-slate-400 group-hover:text-primary'}`} />
                        <span className="text-xs font-bold truncate">{folder}</span>
                        {activeFolder === folder && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FolderList;
