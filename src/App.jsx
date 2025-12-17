import React, { useState, useEffect } from "react";
import {
  Terminal,
  Layers,
  Cpu,
  Zap,
  Code,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  AlertTriangle,
  Play,
  X,
  Edit2,
  Database,
  Globe,
  Server,
  FileText,
  Download,
  Search,
  Loader2,
  Wifi,
  Settings,
} from "lucide-react";

// Utility to dynamically load JSZip from CDN
const loadJSZip = () => {
  return new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve(window.JSZip);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const GenesisApp = () => {
  const [idea, setIdea] = useState("");
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(""); // 'analyzing' | 'searching' | 'building'
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("structure");

  // Tech Stack Generator State
  const [showStackModal, setShowStackModal] = useState(false);
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedStackOption, setSelectedStackOption] = useState("");
  const [generatingStacks, setGeneratingStacks] = useState(false);

  // Code Viewer State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isZipping, setIsZipping] = useState(false);

  // Settings / API Key State
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");

  // API Config
  const apiKey = "";

  useEffect(() => {
    // Preload JSZip quietly in the background
    loadJSZip().catch(console.error);

    // Load saved API key
    const savedKey = localStorage.getItem("genesis_api_key");
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const getEffectiveApiKey = () => {
    return apiKey || userApiKey;
  };

  const handleSaveApiKey = (key) => {
    setUserApiKey(key);
    localStorage.setItem("genesis_api_key", key);
  };

  // Helper to clean and parse JSON from AI response
  const parseAIResponse = (text) => {
    if (!text) throw new Error("Received empty response from AI");

    try {
      // 1. Try strict parse first (best case)
      return JSON.parse(text);
    } catch (e1) {
      try {
        // 2. Try removing markdown code blocks
        const cleanText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(cleanText);
      } catch (e2) {
        // 3. Regex extraction - finds the largest outermost JSON object or array
        // Matches { ... } or [ ... ] across multiple lines
        const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

        if (jsonMatch && jsonMatch[0]) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e3) {
            console.error("Regex extracted invalid JSON:", jsonMatch[0]);
            throw new Error("Extracted data was not valid JSON.");
          }
        }

        console.error("Failed to extract JSON. Raw text:", text);
        throw new Error(
          "The Architect returned unstructured data. Please try again."
        );
      }
    }
  };

  // --- Step 1: Decide Flow ---
  const handleInitialize = () => {
    const key = getEffectiveApiKey();
    if (!key) {
      setShowSettings(true);
      setError(
        "System Offline: API Key required. Access Settings to configure."
      );
      return;
    }

    if (!idea.trim()) {
      setError("Come on, Shahriar. You can't build a legacy on an empty idea.");
      return;
    }

    if (!techStack.trim()) {
      suggestTechStacks();
    } else {
      generateBlueprint(techStack);
    }
  };

  // --- Step 2: Generate Tech Stacks (If blank) - NOW WITH GOOGLE SEARCH ---
  const suggestTechStacks = async () => {
    setGeneratingStacks(true);
    setError("");

    const systemPrompt = `
      You are an elite CTO advising a founder (Shahriar).
      Task: Analyze the project idea and suggest 3 DISTINCT, MODERN tech stacks.

      CRITICAL: Use Google Search to identify the current trending tools for this specific type of project in 2024/2025.

      OUTPUT RULES:
      - Respond ONLY with the JSON array.
      - Do NOT include conversational text (like "Here are the stacks").
      - Do NOT include citations in the JSON output.

      Return strictly formatted JSON:
      [
        {
          "name": "The Speedster (MVP)",
          "description": "Fastest way to ship.",
          "stack": "Next.js, Tailwind, Supabase"
        },
        ...
      ]
    `;
    const userPrompt = `Project Idea: ${idea}. Find the absolute latest trending stacks. Reply with JSON only.`;

    try {
      const currentKey = getEffectiveApiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${currentKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ google_search: {} }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setShowSettings(true);
          throw new Error(
            "Authentication failed. Please verify your API Key in settings."
          );
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("AI Silence.");

      const parsed = parseAIResponse(aiText);
      setStackOptions(parsed);
      setShowStackModal(true);
      if (parsed.length > 0) setSelectedStackOption(parsed[0].stack);
    } catch (err) {
      console.error(err);
      setError(err.message || "Search uplink failed. Try again.");
    } finally {
      setGeneratingStacks(false);
    }
  };

  // --- Step 3: The Main Blueprint Generation - NOW WITH GOOGLE SEARCH ---
  const generateBlueprint = async (finalStack) => {
    setLoading(true);
    setLoadingPhase("analyzing");
    setError("");
    setResult(null);
    setShowStackModal(false);

    // UX Phases
    setTimeout(() => setLoadingPhase("searching"), 1000); // Actually searching now
    setTimeout(() => setLoadingPhase("building"), 4000);

    const systemPrompt = `
      You are GENESIS, an elite Software Architect.
      User: Shahriar.
      Task: Build a production-ready starter template.

      CRITICAL INSTRUCTION - REAL-TIME VERSION CHECK:
      You MUST use the Google Search tool to find the ABSOLUTE LATEST STABLE VERSION of every tool in the requested tech stack.
      - Search for "current stable version of [tool name]".
      - Use these specific versions in the package.json.

      OUTPUT RULES:
      - Respond ONLY with the JSON object.
      - Do not include conversational text.
      - Keep "content" fields CONCISE but FUNCTIONAL to ensure the JSON does not get truncated.

      OUTPUT FORMAT:
      Return a strictly formatted JSON object.
      {
        "projectName": "Name",
        "tagline": "Description",
        "difficulty": "Level",
        "versions": { "tech": "version_found_via_search" },
        "fileStructure": [
          {
            "name": "src",
            "type": "folder",
            "children": [
               { "name": "page.tsx", "type": "file", "content": "// Actual code..." }
            ]
          }
        ],
        "steps": [ ... ],
        "mentorAdvice": "..."
      }

      MANDATORY:
      - The "content" field MUST contain valid, working code compatible with the versions you found.
      - package.json MUST be included with the specific latest versions.
    `;

    const userPrompt = `Project Idea: ${idea}. Tech Stack: ${finalStack}. Search for latest versions and generate boilerplate. Reply with JSON only.`;

    try {
      const currentKey = getEffectiveApiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${currentKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ google_search: {} }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setShowSettings(true);
          throw new Error(
            "Authentication failed. Please verify your API Key in settings."
          );
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0].content) {
        throw new Error("Genesis protocol failed.");
      }

      const aiText = data.candidates[0].content.parts[0].text;
      const parsedResult = parseAIResponse(aiText);
      setResult(parsedResult);
      setTechStack(finalStack);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "System failure. The architect collapsed under the weight of your genius."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4: Zip & Download ---
  const handleDownloadZip = async () => {
    if (!result || !result.fileStructure) return;
    setIsZipping(true);

    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      // Recursive function to add files/folders to zip
      const addNodeToZip = (node, zipFolder) => {
        if (node.type === "folder") {
          const folder = zipFolder.folder(node.name);
          if (node.children) {
            node.children.forEach((child) => addNodeToZip(child, folder));
          }
        } else {
          // It's a file
          zipFolder.file(node.name, node.content || "");
        }
      };

      // Process root nodes
      result.fileStructure.forEach((node) => addNodeToZip(node, zip));

      // Generate and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.projectName
        .replace(/\s+/g, "-")
        .toLowerCase()}-starter.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Zip failed:", e);
      setError("Compression algorithm failed. Try copying manually.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="flex flex-col items-center mb-20 text-center space-y-8 relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={() => setShowSettings(true)}
              className="group p-3 text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl"
              title="API Settings"
            >
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </button>
          </div>

          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl shadow-lg">
            <Globe className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-gray-300">
              AI-Powered • Real-Time
            </span>
          </div>

          <div className="relative">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-purple-200 drop-shadow-2xl">
              GENESIS
            </h1>
            <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-3xl -z-10" />
          </div>

          <p className="text-gray-400 max-w-2xl text-base sm:text-lg leading-relaxed">
            Transform your ideas into production-ready code in seconds.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">
              Powered by AI with real-time web search intelligence.
            </span>
          </p>
        </header>

        {/* Input Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7 space-y-6">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl opacity-20 group-focus-within:opacity-40 transition duration-500 blur-xl"></div>
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your project idea... (e.g., A real-time chat app with AI moderation)"
                  className="relative w-full bg-transparent text-gray-100 placeholder-gray-500 rounded-2xl p-6 h-44 focus:outline-none resize-none text-base leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-5 focus-within:border-blue-500/50 transition-all shadow-lg hover:shadow-xl group">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5" />
                    Tech Stack
                  </span>
                  <span className="text-[10px] text-gray-500 normal-case font-normal">
                    Optional
                  </span>
                </label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. Next.js, Tailwind, Supabase"
                  className="w-full bg-transparent text-blue-400 font-mono text-sm focus:outline-none placeholder-gray-600"
                />
              </div>

              <button
                onClick={handleInitialize}
                disabled={loading || generatingStacks}
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {loading || generatingStacks ? (
                  <span className="flex items-center space-x-2 relative z-10">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {generatingStacks
                        ? "Searching..."
                        : loadingPhase === "searching"
                        ? "Verifying..."
                        : loadingPhase === "building"
                        ? "Building..."
                        : "Initializing..."}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2 relative z-10">
                    <Play className="w-5 h-5 fill-current" />
                    <span>Generate Project</span>
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-start space-x-3 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm shadow-lg animate-in slide-in-from-top duration-300">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{error}</span>
              </div>
            )}

            {/* Real-time Status Log */}
            {loading && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  <Terminal className="w-4 h-4" />
                  Build Process
                </div>
                <div className="font-mono text-xs text-gray-400 space-y-2">
                  <div
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      loadingPhase === "analyzing"
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-gray-600 bg-transparent"
                    }`}
                  >
                    {loadingPhase === "analyzing" ? (
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>Analyzing project requirements</span>
                  </div>
                  {(loadingPhase === "searching" ||
                    loadingPhase === "building") && (
                    <div
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        loadingPhase === "searching"
                          ? "text-purple-400 bg-purple-500/10"
                          : "text-gray-600 bg-transparent"
                      }`}
                    >
                      {loadingPhase === "searching" ? (
                        <Wifi className="w-4 h-4 animate-pulse flex-shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>Searching for latest package versions</span>
                    </div>
                  )}
                  {loadingPhase === "building" && (
                    <div className="flex items-center gap-3 p-2 rounded-lg text-cyan-400 bg-cyan-500/10">
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      <span>Generating project structure & code</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-8 lg:pl-10 lg:border-l border-white/10">
            <blockquote className="relative">
              <div className="absolute -left-2 top-0 text-6xl text-blue-500/20 font-serif">
                "
              </div>
              <p className="text-gray-400 italic text-base leading-relaxed pl-6">
                The distance between your dreams and reality is called action.
              </p>
            </blockquote>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400 text-sm group hover:text-gray-300 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>Real-time web search for latest versions</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 text-sm group hover:text-gray-300 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>Production-ready starter templates</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 text-sm group hover:text-gray-300 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>One-click download as ZIP archive</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 text-sm group hover:text-gray-300 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>Step-by-step setup instructions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
            {/* Result Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 mb-10 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    {result.projectName}
                    <Badge label={result.difficulty} />
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm mb-5">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {result.tagline}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1.5 text-green-400">
                      <Globe className="w-4 h-4 animate-pulse" />
                      Latest Versions Verified
                    </span>
                  </div>

                  {/* Version Pills */}
                  {result.versions && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.versions).map(([tech, ver], i) => (
                        <div
                          key={i}
                          className="bg-slate-800/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 backdrop-blur-sm hover:bg-slate-800/70 transition-colors"
                        >
                          <span className="text-blue-400 font-semibold">
                            {tech}
                          </span>
                          <span className="text-gray-500">v{ver}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    {isZipping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">Download ZIP</span>
                    <span className="sm:hidden">Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-white/10 mb-10 overflow-x-auto bg-slate-900/30 backdrop-blur-sm rounded-t-xl p-2">
              <TabButton
                active={activeTab === "structure"}
                onClick={() => setActiveTab("structure")}
                icon={Layers}
                label="Code"
              />
              <TabButton
                active={activeTab === "guide"}
                onClick={() => setActiveTab("guide")}
                icon={Terminal}
                label="Setup Guide"
              />
              <TabButton
                active={activeTab === "advice"}
                onClick={() => setActiveTab("advice")}
                icon={Zap}
                label="Advice"
              />
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
              {/* --- ARCHITECTURE & CODE VIEWER --- */}
              {activeTab === "structure" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                  {/* Left: File Tree */}
                  <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 font-mono text-sm overflow-y-auto shadow-xl">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 sticky top-0 bg-slate-900/95 pb-3 border-b border-white/10 backdrop-blur-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      File Structure
                    </h3>
                    <FileTree
                      data={result.fileStructure}
                      onSelectFile={(file) => setSelectedFile(file)}
                      selectedFile={selectedFile}
                    />
                  </div>

                  {/* Right: Code Viewer */}
                  <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-mono text-gray-300 font-medium">
                          {selectedFile
                            ? selectedFile.name
                            : "Select a file to view"}
                        </span>
                      </div>
                      {selectedFile && selectedFile.content && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(selectedFile.content)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Copy</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                      {selectedFile ? (
                        selectedFile.type === "file" ? (
                          <pre className="text-xs md:text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {selectedFile.content ||
                              "// No content provided for this file."}
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                              <ChevronDown className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-sm">
                              This is a folder. Expand it to view files.
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-5">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                            <Code className="w-10 h-10 opacity-40 text-blue-400" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-gray-400">
                              No file selected
                            </p>
                            <p className="text-xs text-gray-600">
                              Click on a file in the tree to view its contents
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- GUIDE --- */}
              {activeTab === "guide" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {result.steps.map((step, index) => (
                    <StepCard key={index} number={index + 1} step={step} />
                  ))}
                </div>
              )}

              {/* --- MENTOR ADVICE --- */}
              {activeTab === "advice" && (
                <div className="max-w-4xl mx-auto">
                  <div className="relative bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-10 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-amber-400">
                          Expert Advice
                        </h3>
                      </div>
                      <blockquote className="text-lg text-gray-300 leading-relaxed italic border-l-4 border-amber-500/30 pl-6">
                        "{result.mentorAdvice}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- TECH STACK SELECTOR MODAL --- */}
      {showStackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowStackModal(false)}
          />

          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-xl text-white">
                  Choose Your Tech Stack
                </h3>
              </div>
              <button
                onClick={() => setShowStackModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <p className="text-gray-400">
                Select a recommended stack or customize it to match your
                preferences.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stackOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedStackOption(opt.stack)}
                    className={`text-left p-6 rounded-xl border transition-all ${
                      selectedStackOption === opt.stack
                        ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="font-bold text-white mb-3 text-base">
                      {opt.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {opt.description}
                    </div>
                    <div className="text-[11px] font-mono text-blue-400 bg-black/30 p-3 rounded-lg">
                      {opt.stack}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-4">
                  Customize Stack (Optional)
                </label>
                <div className="flex gap-4">
                  <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={selectedStackOption}
                      onChange={(e) => setSelectedStackOption(e.target.value)}
                      className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition-all"
                      placeholder="e.g. React, Node.js, PostgreSQL"
                    />
                  </div>
                  <button
                    onClick={() => generateBlueprint(selectedStackOption)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-sm whitespace-nowrap transition-all shadow-lg shadow-blue-500/25"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS / API KEY MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowSettings(false)}
          />

          <div className="bg-slate-900/95 backdrop-blur-2xl border border-red-500/20 rounded-3xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-bold text-xl text-white">
                  API Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl flex gap-4 items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-red-200 font-semibold">
                    API Key Required
                  </p>
                  <p className="text-xs text-red-300/70 leading-relaxed">
                    Genesis requires a valid Google Gemini API key to function.
                    Your key is stored locally and never sent to our servers.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-4">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl py-4 px-5 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 font-mono text-sm transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1.5">
                  <Server className="w-3 h-3" />
                  Stored securely in your browser's local storage
                </p>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const Badge = ({ label }) => {
  let color = "text-gray-400 border-gray-600 bg-gray-700/30";
  if (label === "Beginner")
    color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (label === "Intermediate")
    color = "text-blue-400 border-blue-500/30 bg-blue-500/10";
  if (label === "Advanced")
    color = "text-orange-400 border-orange-500/30 bg-orange-500/10";
  if (label === "Nightmare")
    color = "text-red-400 border-red-500/30 bg-red-500/10";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${color} shadow-sm`}
    >
      {label}
    </span>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg ${
      active
        ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25"
        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

const StepCard = ({ number, step }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-7 hover:border-white/20 transition-all shadow-lg hover:shadow-xl group">
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/10">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
          {step.title}
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          {step.description}
        </p>
        {step.codeSnippet && (
          <div className="bg-slate-950/80 rounded-xl p-5 font-mono text-xs text-gray-300 flex justify-between items-start gap-4 group/code border border-white/10 hover:border-white/20 transition-all">
            <code className="flex-1 whitespace-pre-wrap break-all">
              {step.codeSnippet}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(step.codeSnippet)}
              className="opacity-0 group-hover/code:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const FileTree = ({ data, level = 0, onSelectFile, selectedFile }) => {
  return (
    <ul className="pl-2">
      {data.map((item, index) => (
        <FileNode
          key={index}
          item={item}
          level={level}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </ul>
  );
};

const FileNode = ({ item, level, onSelectFile, selectedFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = item.type === "folder";
  const isSelected = selectedFile && selectedFile.name === item.name;

  return (
    <li className="my-0.5">
      <div
        className={`flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
            : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
        }`}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
          } else {
            onSelectFile(item);
          }
        }}
      >
        {isFolder ? (
          isOpen ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )
        ) : (
          <Code className="w-4 h-4 flex-shrink-0" />
        )}
        <span
          className={`text-sm ${isFolder ? "font-semibold" : ""} ${
            isSelected ? "font-bold" : ""
          } truncate`}
        >
          {item.name}
        </span>
      </div>
      {isFolder && isOpen && item.children && (
        <FileTree
          data={item.children}
          level={level + 1}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      )}
    </li>
  );
};

export default GenesisApp;
