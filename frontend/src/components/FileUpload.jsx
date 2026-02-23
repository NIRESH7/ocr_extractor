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

            <div className={`p-5 rounded-2xl border border-dashed transition-all duration-300 flex flex-col items-center gap-3 ${status === 'uploading'
                ? 'border-primary bg-rose-50/30'
                : 'border-slate-200 bg-white/50 group-hover:border-primary group-hover:bg-rose-50/50 group-hover:shadow-lg group-hover:shadow-rose-100/50'
                }`}>

                <div className={`p-2.5 rounded-xl transition-all duration-300 ${status === 'uploading' ? 'theme-gradient shadow-lg shadow-primary/20 scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-primary'}`}>
                    {status === 'uploading' ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                </div>

                <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${status === 'uploading' ? 'text-primary animate-pulse' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {status === 'uploading' ? 'Indexing...' : 'Drop Documents'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 opacity-60">PDF, DOCX, TXT</p>
                </div>

                {status === 'uploading' && (
                    <div className="w-full space-y-2 mt-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-white">
                            <div
                                className="h-full theme-gradient transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        {ocrProgress && (
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                                    style={{ width: `${ocrProgress.percent}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Feedback Overlay */}
            {(status === 'success' || status === 'error' || status === 'partial') && (
                <div className="mt-4 p-3 rounded-xl bg-white/80 border border-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        {status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                        {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        {status === 'partial' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                        <p className={`text-[10px] font-bold truncate ${status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {message}
                        </p>
                    </div>

                    {details.length > 0 && (
                        <ul className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                            {details.map((res, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-[9px] font-bold p-1 rounded-md bg-white/50 border border-slate-50">
                                    <div className={`w-1 h-1 rounded-full ${res.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                    <span className="text-slate-600 truncate flex-1">{res.filename}</span>
                                    <span className={res.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
                                        {res.status === 'success' ? 'Ready' : 'Error'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
