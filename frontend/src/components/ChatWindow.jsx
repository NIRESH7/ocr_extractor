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
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar relative pb-32">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div className={`p-3 rounded-xl shrink-0 border ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                        </div>

                        <div className={`max-w-[75%] w-fit space-y-2.5 ${msg.role === 'user' ? 'ml-auto text-right' : ''}`}>
                            <div className={`px-6 py-4.5 rounded-[22px] text-[15px] leading-[1.6] font-medium transition-all border ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200'
                                }`}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2 block">
                                {msg.role === 'user' ? 'Operator' : 'Knowledge Agent'}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-6 animate-pulse">
                        <div className="p-3 rounded-xl bg-slate-50 text-indigo-500 border border-slate-200">
                            <Bot className="w-4.5 h-4.5" />
                        </div>
                        <div className="px-8 py-5 rounded-[22px] bg-slate-50/50 border border-slate-200 flex items-center gap-5">
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Querying Deep Context...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-6 left-0 right-0 px-10 z-20">
                <form
                    onSubmit={handleSend}
                    className="max-w-4xl mx-auto flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl transition-all focus-within:border-indigo-400 focus-within:ring-8 focus-within:ring-indigo-50/50"
                >
                    <div className="pl-5 text-slate-300">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Querying database as "${activeFolder === "All" ? "Superuser" : activeFolder}"...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 py-4"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-20 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-100"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
