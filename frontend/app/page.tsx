"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Upload, FileText, AlertTriangle, ShieldCheck, Loader2, ImageIcon, MessageSquare, Send, Moon, Sun } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chat State
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // 1. Dynamic API URL (Works on Localhost AND Cloud automatically)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setError("");
    setAnalysis(null);
    setChatHistory([]); // Reset chat on new file
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setChatHistory([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 2. Updated URL to use the variable
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to analyze document. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !analysis?.full_text) return;

    const userQuestion = question;
    setQuestion(""); // Clear input
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    setChatLoading(true);

    try {
      // 3. Updated URL to use the variable
      const response = await axios.post(`${API_URL}/chat`, {
        question: userQuestion,
        context: analysis.full_text // Sending contract text back to backend
      });

      setChatHistory(prev => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that question." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans p-8 transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={toggleTheme} className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-indigo-600'}`}>
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <header className="mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-block p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full mb-4 hover:scale-110 transition-transform duration-300 shadow-lg">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className={`text-5xl font-extrabold bg-gradient-to-r ${isDark ? 'from-indigo-400 via-indigo-300 to-indigo-400' : 'from-indigo-900 via-indigo-700 to-indigo-900'} bg-clip-text text-transparent mb-2`}>LeaseLens</h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AI Contract Guardian: Upload a lease to spot red flags instantly.</p>
        </header>

        {/* Upload Section */}
        <div className={`p-8 rounded-2xl shadow-lg hover:shadow-xl mb-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom delay-150 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? "border-indigo-500 scale-105 shadow-inner" + (isDark ? " bg-indigo-950" : " bg-indigo-50") : (isDark ? "border-slate-600 hover:border-indigo-400 hover:bg-slate-700" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50") + " hover:scale-[1.02]"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-indigo-700 font-medium animate-in fade-in zoom-in duration-300">
                {file.type.startsWith("image/") ? <ImageIcon className="w-8 h-8 animate-pulse" /> : <FileText className="w-8 h-8 animate-pulse" />}
                <span className="text-lg">{file.name}</span>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Upload className={`w-12 h-12 mb-2 transition-transform ${isDragActive ? 'scale-125' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className="text-lg font-medium">Drag & drop your file here</p>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Supports PDF, PNG, and JPG</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Analyzing...</> : <><ShieldCheck className="w-5 h-5" /> Analyze Contract</>}
          </button>
          
          {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center animate-in fade-in slide-in-from-top-2 border border-red-200 shadow-sm">⚠️ {error}</div>}
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Score */}
            <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] group ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div>
                <h3 className={`text-lg font-semibold group-hover:text-indigo-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Safety Score</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Based on AI risk assessment</p>
              </div>
              <div className={`text-5xl font-black transition-all duration-500 ${(analysis.rating || 0) >= 8 ? "text-green-500" : (analysis.rating || 0) >= 5 ? "text-yellow-500" : "text-red-500"} group-hover:scale-110`}>
                {analysis.rating || "?"}/10
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Summary */}
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4 text-indigo-700 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <h3 className="text-lg font-bold">Document Summary</h3>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{analysis.summary || "No summary available."}</p>
              </div>

              {/* Red Flags */}
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group ${isDark ? 'bg-slate-800 border border-red-900' : 'bg-white border border-red-100'}`}>
                <div className="flex items-center gap-2 mb-4 text-red-600 border-b border-red-50 pb-3">
                  <AlertTriangle className="w-5 h-5 group-hover:animate-pulse" />
                  <h3 className="text-lg font-bold">Risks Detected</h3>
                </div>
                <ul className="space-y-3">
                  {Array.isArray(analysis.red_flags) && analysis.red_flags.length > 0 ? (
                    analysis.red_flags.map((flag: string, index: number) => (
                      <li key={index} className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-all duration-200 cursor-default ${isDark ? 'text-slate-300 bg-red-950 border border-red-900 hover:bg-red-900' : 'text-slate-700 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200'}`}>
                        <span className="text-red-500 mt-0.5">•</span><span>{flag}</span>
                      </li>
                    ))
                  ) : (
                    <li className={`italic text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>✅ No major red flags found.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* CHAT SECTION */}
            {analysis.full_text && (
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl mt-4 transition-all duration-300 group ${isDark ? 'bg-slate-800 border border-indigo-900' : 'bg-white border border-indigo-100'}`}>
                <div className={`flex items-center gap-2 mb-6 pb-3 ${isDark ? 'text-indigo-400 border-b border-indigo-900' : 'text-indigo-800 border-b border-indigo-50'}`}>
                  <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold">Ask Lawyer AI</h3>
                </div>

                {/* Chat History */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom duration-300`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02] ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md' 
                          : isDark ? 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600 hover:bg-slate-600' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 hover:bg-slate-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className={`p-3 rounded-lg rounded-bl-none text-sm flex items-center gap-2 ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        <Loader2 className="animate-spin w-4 h-4" /> Typing...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Ex: Can I have a pet? What is the late fee?"
                    className={`flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${isDark ? 'bg-slate-700 border border-slate-600 text-slate-200 hover:border-indigo-500' : 'bg-white border border-slate-300 hover:border-indigo-400'}`}
                  />
                  <button 
                    onClick={handleAskQuestion}
                    disabled={chatLoading || !question.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white p-3 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}