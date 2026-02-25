import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FileUpload = ({ onUploadSuccess, activeFolder }) => {
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error, partial
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState([]);
    const [progress, setProgress] = useState(0);
    const [ocrProgress, setOcrProgress] = useState(null); // { current, total, percent }

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const jobId = `job_${Date.now()}`;
            setStatus('uploading');
            setMessage(`Uploading ${selectedFiles.length} file(s)...`);
            setProgress(0);
            setOcrProgress(null);
            setDetails([]);

            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('folder', activeFolder || "default");
            formData.append('job_id', jobId);

            // Start polling for OCR progress
            const pollInterval = setInterval(async () => {
                try {
                    const res = await axios.get(`http://127.0.0.1:8000/upload-status/${jobId}`);
                    if (res.data && res.data.status === 'processing') {
                        setOcrProgress({
                            current: res.data.current_page,
                            total: res.data.total_pages,
                            percent: res.data.progress
                        });
                        setMessage(`OCR Processing: Page ${res.data.current_page}/${res.data.total_pages} (${res.data.progress}%)`);
                    } else if (res.data.status === 'completed') {
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 1000);

            try {
                const response = await axios.post('http://127.0.0.1:8000/upload/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                        if (percentCompleted === 100) {
                            setMessage("Upload complete. Waiting for OCR extraction...");
                        }
                    }
                });

                clearInterval(pollInterval);
                const results = response.data.results;
                const failures = results.filter(r => r.status === 'failed' || r.status === 'error');
                const successes = results.filter(r => r.status === 'success');

                if (failures.length === 0) {
                    setStatus('success');
                    setMessage(`Successfully uploaded ${successes.length} file(s) to "${activeFolder || "default"}"`);
                } else if (successes.length === 0) {
                    setStatus('error');
                    setMessage(`Failed to upload any files. Check errors below.`);
                } else {
                    setStatus('partial');
                    setMessage(`Uploaded ${successes.length} file(s), but ${failures.length} failed.`);
                }

                setDetails(results);

                if (successes.length > 0 && onUploadSuccess) onUploadSuccess();

            } catch (error) {
                console.error(error);
                setStatus('error');
                const errorMsg = error.response?.data?.detail || error.message;
                setMessage(`Upload failed: ${errorMsg}`);
            }
        }
    };

    return (
        <div className="relative group">
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={status === 'uploading'}
            />

            <div className={`p-8 rounded-2xl border border-slate-200 transition-all duration-300 flex flex-col items-center justify-center gap-5 ${status === 'uploading'
                ? 'bg-indigo-50/50 border-indigo-200'
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                }`}>

                <div className={`p-4 rounded-xl transition-all duration-300 ${status === 'uploading' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white border border-slate-100 text-slate-300 group-hover:text-indigo-600 shadow-sm'}`}>
                    {status === 'uploading' ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Upload className="w-6 h-6" />
                    )}
                </div>

                <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${status === 'uploading' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {status === 'uploading' ? 'Ingestion Active' : 'Import Documents'}
                    </p>
                    <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-widest">System Protocols Enabled</p>
                </div>

                {status === 'uploading' && (
                    <div className="w-full space-y-4 mt-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 shadow-lg shadow-indigo-100"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Feedback Overlay */}
            {(status === 'success' || status === 'error' || status === 'partial') && (
                <div className="mt-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-3 z-30">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-2.5 rounded-lg ${status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                {status === 'success' ? 'Ingestion Complete' : 'Network Notification'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{message}</p>
                        </div>
                    </div>

                    {details.length > 0 && (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1 border-t border-slate-100 pt-4">
                            {details.map((res, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-[10px] font-bold py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className={`w-2 h-2 rounded-full ${res.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    <span className="text-slate-500 truncate flex-1">{res.filename}</span>
                                    <span className={`${res.status === 'success' ? 'text-emerald-600' : 'text-rose-600'} uppercase text-[9px] tracking-tight`}>
                                        {res.status === 'success' ? 'Synced' : 'Error'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setStatus('idle')}
                        className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200"
                    >
                        Dismiss Overlay
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
