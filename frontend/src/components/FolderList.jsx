import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, Plus, ChevronRight, Hash, Eye, Trash2 } from 'lucide-react';

const FolderList = ({ activeFolder, onSelectFolder, onViewFiles, onDeleteFolder }) => {
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

    const handleDeleteFolder = async (e, folderName) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${folderName}" and all its contents?`)) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/folders/${folderName}`);
            if (activeFolder === folderName) onSelectFolder("All");
            fetchFolders();
            if (onDeleteFolder) onDeleteFolder(folderName);
        } catch (error) {
            console.error("Failed to delete folder", error);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Data Clusters</span>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-1.5 rounded-md hover:bg-slate-50 text-indigo-500 transition-all border border-slate-100 shadow-sm"
                >
                    <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isCreating ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateFolder} className="animate-in fade-in duration-300 px-1">
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Cluster Title..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 font-medium"
                        />
                        <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-md shadow-lg shadow-indigo-100">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-1.5">
                <button
                    onClick={() => onSelectFolder("All")}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${activeFolder === "All"
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border border-indigo-500'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <Hash className={`w-4 h-4 ${activeFolder === "All" ? 'text-indigo-200' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                    <span className="text-[13px] font-bold tracking-tight uppercase">Master Index</span>
                </button>

                {folders.map((folder) => (
                    <div key={folder} className="group relative">
                        <button
                            onClick={() => onSelectFolder(folder)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeFolder === folder
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border border-indigo-500'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Folder className={`w-4 h-4 ${activeFolder === folder ? 'text-indigo-200' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                            <span className="text-[13px] font-bold tracking-tight uppercase truncate">{folder}</span>
                        </button>

                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-opacity duration-200 ${activeFolder === folder ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                            <button
                                onClick={(e) => { e.stopPropagation(); if (onViewFiles) onViewFiles(folder); }}
                                className={`p-1.5 rounded-md transition-all ${activeFolder === folder ? 'hover:bg-indigo-700 text-indigo-100' : 'hover:bg-slate-200 text-slate-300 hover:text-slate-600'
                                    }`}
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => handleDeleteFolder(e, folder)}
                                className={`p-1.5 rounded-md transition-all ${activeFolder === folder ? 'hover:bg-indigo-700 text-indigo-100' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderList;
