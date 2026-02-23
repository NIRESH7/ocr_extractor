import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Sparkles, Loader2, Info } from 'lucide-react';

const ChatWindow = ({ activeFolder }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Neural RAG ready. Knowledge context loaded from '" + activeFolder + "'. How can I assist you?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/query/', {
                question: input,
                folder: activeFolder || "All"
            });

            setMessages(prev => [...prev, { role: 'bot', content: response.data.answer }]);
        } catch (error) {
            console.error("Query failed", error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Error: Retrieval node unreachable. Please check backend infrastructure."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative pb-24">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div className={`p-2.5 rounded-2xl shadow-lg shrink-0 ${msg.role === 'user'
                            ? 'bg-primary text-white shadow-primary/20'
                            : 'bg-white text-slate-800 shadow-sm border border-slate-100'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`px-6 py-4 rounded-[24px] rounded-theme text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'theme-gradient text-white rounded-tr-none'
                                : 'bg-white/90 text-slate-700 backdrop-blur-sm border border-white/60 rounded-tl-none font-medium'
                                }`}>
                                {msg.content}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest px-1 uppercase opacity-60">
                                {msg.role === 'user' ? 'Individual' : 'Neural Agent'}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-4 animate-pulse">
                        <div className="p-2.5 rounded-2xl bg-white text-slate-400 shadow-sm border border-slate-100">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="px-6 py-4 rounded-[24px] rounded-tl-none bg-white/70 border border-white/60 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs font-bold text-slate-500 tracking-wider">Processing Intelligence...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-transparent to-transparent z-20">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-3 bg-white/90 backdrop-blur-xl p-2.5 rounded-[28px] shadow-2xl shadow-indigo-200/40 border border-white/60 focus-within:ring-4 focus-within:ring-primary/10 transition-all group"
                >
                    <div className="pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Query ${activeFolder}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 py-3"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3.5 theme-gradient text-white rounded-[20px] hover:opacity-90 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 shadow-sm" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
