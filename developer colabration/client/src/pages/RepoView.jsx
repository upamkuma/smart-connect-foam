import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useAuthStore } from "../store/useAuthStore";
import { FileCode2, MessageSquare, Users, Send, Plus, Trash2, Search, UserPlus } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export default function RepoView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef();
  const navigate = useNavigate();

  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Professional IDE States
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);

  const [showCollabSearch, setShowCollabSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Fetch repo details
    const fetchRepo = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/repos/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRepo(data);
        setFiles(data.files);
        if (data.files.length > 0) {
          const firstFile = data.files[0];
          setActiveFile(firstFile);
          setCode(firstFile.content);
          setOpenTabs([firstFile]);
          setActiveTabId(firstFile.path);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/repos/${id}/messages`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRepo();
    fetchMessages();

    // Socket logic
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join-repo", id);

    socketRef.current.on("code-update", ({ path, content }) => {
      if (activeFile && path === activeFile.path) {
        setCode(content);
      }
      setFiles((prev) => {
        const fileIndex = prev.findIndex((f) => f.path === path);
        if (fileIndex > -1) {
          const newFiles = [...prev];
          newFiles[fileIndex].content = content;
          return newFiles;
        } else {
          return [...prev, { path, content }];
        }
      });
    });

    socketRef.current.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, user.token]);

  // Handle User Search for Collaborators
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const searchDelay = setTimeout(async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(searchDelay);
  }, [searchQuery, user.token]);

  const handleAddCollaborator = async (collabId) => {
    try {
      await axios.post(`http://localhost:5000/api/repos/${id}/collaborate`, { collaboratorId: collabId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShowCollabSearch(false);
      setSearchQuery("");
      const { data } = await axios.get(`http://localhost:5000/api/repos/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRepo(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRepo = async () => {
    if (window.confirm("Are you sure you want to delete this repository?")) {
      try {
        await axios.delete(`http://localhost:5000/api/repos/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const exists = files.find(f => f.path === newFileName);
    if (!exists) {
      const newFile = { path: newFileName, content: "" };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      handleFileClick(newFile);
      socketRef.current.emit("code-change", { repoId: id, path: newFileName, content: "" });
    }
    setNewFileName("");
    setShowNewFile(false);
  };

  const handleFileClick = (file) => {
    if (!openTabs.find(t => t.path === file.path)) {
      setOpenTabs([...openTabs, file]);
    }
    setActiveFile(file);
    setActiveTabId(file.path);
    setCode(file.content);
  };

  const closeTab = (e, path) => {
    e.stopPropagation();
    const filteredTabs = openTabs.filter(t => t.path !== path);
    setOpenTabs(filteredTabs);
    if (activeTabId === path) {
      if (filteredTabs.length > 0) {
        const lastTab = filteredTabs[filteredTabs.length - 1];
        setActiveFile(lastTab);
        setActiveTabId(lastTab.path);
        setCode(lastTab.content);
      } else {
        setActiveFile(null);
        setActiveTabId(null);
        setCode("");
      }
    }
  };

  // Update active file ref if it changes to keep code-update functional
  useEffect(() => {
    if (!socketRef.current) return;
    const currentHandler = socketRef.current.listeners("code-update")[0];
    socketRef.current.off("code-update", currentHandler);
    socketRef.current.on("code-update", ({ path, content }) => {
      if (activeFile && path === activeFile.path) {
        setCode(content);
      }
      setFiles((prev) => {
        const fileIndex = prev.findIndex((f) => f.path === path);
        if (fileIndex > -1) {
          const newFiles = [...prev];
          newFiles[fileIndex].content = content;
          return newFiles;
        } else {
          return [...prev, { path, content }];
        }
      });
    });
  }, [activeFile]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (activeFile) {
      socketRef.current.emit("code-change", { repoId: id, path: activeFile.path, content: value });
      
      const fileIndex = files.findIndex((f) => f.path === activeFile.path);
      const newFiles = [...files];
      if (fileIndex > -1) {
        newFiles[fileIndex].content = value;
      }
      setFiles(newFiles);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socketRef.current.emit("send-message", { repoId: id, senderId: user._id, content: newMessage });
    setNewMessage("");
  };

  const getLanguage = (path) => {
    if (!path) return "javascript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    return "javascript";
  };

  if (!repo) return <div className="p-8 text-center text-gray-400">Loading workspace...</div>;

  return (
    <div className="flex h-full bg-[#1e1e1e]">
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col">
        <div className="p-4 border-b border-[#333333]">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <h2 className="font-bold text-gray-200 uppercase text-xs tracking-wider">Explorer</h2>
            {repo.owner._id === user._id && (
              <button onClick={() => setShowNewFile(!showNewFile)} className="text-gray-400 hover:text-white" title="New File">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-3 flex items-center justify-between font-mono font-medium">
            <span className="flex items-center gap-2 truncate pr-2"><FileCode2 className="w-4 h-4"/> {repo.name}</span>
            {repo.owner._id === user._id && (
              <button onClick={handleDeleteRepo} className="text-red-500 hover:text-red-400" title="Delete Repo">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </p>
        </div>
        
        {showNewFile && (
          <form onSubmit={handleCreateFile} className="px-4 py-2 border-b border-[#333333] bg-[#2d2d2d]">
            <input 
              type="text" 
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Filename (e.g. app.js)"
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] text-white text-xs px-2 py-1 rounded outline-none focus:border-blue-500"
            />
          </form>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {files.map((file, i) => (
            <button
              key={i}
              onClick={() => handleFileClick(file)}
              className={`w-full text-left px-6 py-2.5 text-sm flex items-center gap-2 transition-all group ${
                activeTabId === file.path ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-500" : "text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200"
              }`}
            >
              <FileCode2 className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTabId === file.path ? "opacity-100" : "opacity-50"}`} />
              <span className="truncate font-medium">{file.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
        {/* Breadcrumb / Top Bar */}
        <div className="h-9 bg-[#252526] flex items-center px-4 border-b border-[#1e1e1e] text-[11px] text-gray-500 gap-2 select-none">
          <span className="hover:text-gray-300 cursor-pointer">{repo.name}</span>
          <span>/</span>
          {activeFile && <span className="text-gray-300">{activeFile.path}</span>}
        </div>

        {/* Tabs Bar */}
        <div className="flex h-10 bg-[#252526] overflow-x-auto no-scrollbar border-b border-[#1e1e1e]">
          {openTabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => handleFileClick(tab)}
              className={`flex items-center gap-2 px-4 h-full cursor-pointer transition-colors border-r border-[#1e1e1e] group min-w-[120px] max-w-[200px] ${
                activeTabId === tab.path 
                ? "bg-[#1e1e1e] text-blue-400 border-t-2 border-t-blue-500" 
                : "text-gray-500 hover:bg-[#2d2d2d] hover:text-gray-300"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="text-xs truncate flex-1">{tab.path}</span>
              <button 
                onClick={(e) => closeTab(e, tab.path)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 p-0.5 rounded transition-all"
              >
                <Plus className="w-3 h-3 rotate-45" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 relative group">
          {activeFile ? (
             <Editor
              height="100%"
              language={getLanguage(activeFile.path)}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14,
                padding: { top: 20 },
                lineNumbersMinChars: 3,
                smoothScrolling: true,
                cursorBlinking: "expand"
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 bg-[#1e1e1e] space-y-4">
              <FileCode2 className="w-16 h-16 opacity-10" />
              <p className="text-sm font-medium">Select a file from the explorer to begin collaboration</p>
            </div>
          )}
          
          {/* Virtual Terminal / Console Button */}
          <button 
            onClick={() => setShowConsole(!showConsole)}
            className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur border border-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all shadow-xl"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Console Output
          </button>
        </div>

        {/* Console Panel */}
        {showConsole && (
          <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col font-mono">
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-[#333]">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Output</span>
              <button onClick={() => setConsoleLogs([])} className="text-[10px] text-gray-500 hover:text-white">Clear</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto text-xs space-y-1 text-gray-400">
               <div className="flex gap-2">
                 <span className="text-blue-500 text-bold">[{moment().format('HH:mm:ss')}]</span>
                 <span>System: Workspace initialized for {repo.name}.</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-blue-500 text-bold">[{moment().format('HH:mm:ss')}]</span>
                 <span className="text-green-500 italic">Socket connection established. Real-time sync active.</span>
               </div>
               {consoleLogs.map((log, i) => (
                 <div key={i} className="flex gap-2">
                   <span className="text-gray-600">[{moment().format('HH:mm:ss')}]</span>
                   <span>{log}</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat & Users */}
      <div className="w-80 bg-[#252526] border-l border-[#333333] flex flex-col">
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
           <h2 className="font-bold text-gray-200 uppercase text-xs tracking-wider flex items-center gap-2">
             <Users className="w-4 h-4" /> Team
           </h2>
           {repo.owner._id === user._id && (
             <button onClick={() => setShowCollabSearch(!showCollabSearch)} className="text-blue-400 hover:text-blue-300 transition text-xs flex items-center gap-1 font-medium bg-blue-500/10 px-2 py-1 rounded">
               <UserPlus className="w-3 h-3" /> Add
             </button>
           )}
        </div>
        
        {showCollabSearch && (
          <div className="p-3 border-b border-[#333333] bg-[#2d2d2d]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] text-white text-xs pl-8 pr-2 py-1.5 rounded outline-none focus:border-blue-500"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-1 max-h-32 overflow-y-auto">
                {searchResults.map(u => (
                  !repo.collaborators.find(c => c._id === u._id) && repo.owner._id !== u._id ? (
                    <button key={u._id} onClick={() => handleAddCollaborator(u._id)} className="flex items-center justify-between text-xs text-left px-2 py-1 hover:bg-[#37373d] text-gray-300 rounded transition">
                      <span className="truncate">{u.username}</span>
                      <Plus className="w-3 h-3 text-blue-400" />
                    </button>
                  ) : null
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 flex flex-col max-h-[100%] overflow-hidden">
          <div className="p-4 border-b border-[#333333]">
             <h3 className="text-xs text-gray-500 uppercase mb-3 font-semibold">Collaborators</h3>
             <div className="flex flex-wrap gap-2">
                <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20" title="Owner">
                  {repo.owner.username} (Owner)
                </div>
                {repo.collaborators.map(c => (
                   <div key={c._id} className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs border border-gray-600/50">
                     {c.username}
                   </div>
                ))}
             </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="p-3 border-b border-[#333333] bg-[#252526] flex items-center gap-2">
               <MessageSquare className="w-4 h-4 text-gray-400" />
               <span className="text-sm font-medium text-gray-300">Project Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, i) => {
                 const isMe = msg.sender._id === user._id;
                 return (
                   <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                     <span className="text-[10px] text-gray-500 mb-1">{isMe ? "You" : msg.sender.username} â€¢ {moment(msg.createdAt).format('LT')}</span>
                     <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#37373d] text-gray-200 rounded-bl-none'}`}>
                        {msg.content}
                     </div>
                   </div>
                 )
               })}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-[#252526] border-t border-[#333333]">
               <div className="relative">
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={e => setNewMessage(e.target.value)}
                   placeholder="Type a message..."
                   className="w-full bg-[#1e1e1e] border border-[#333333] rounded text-sm text-white px-3 py-2 pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                 />
                 <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Send className="w-4 h-4" />
                 </button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

