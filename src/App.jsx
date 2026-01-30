import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { Copy, Pencil, Check, ChevronDown } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Answer from "./components/Answers";
import { OPENROUTER_URL, OPENROUTER_API_KEY } from "./constants";

function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // 🔥 ChatGPT-style scroll state
  const [showScrollDown, setShowScrollDown] = useState(false);
  const userScrolledUp = useRef(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------------- LOAD STORAGE ---------------- */
  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem("chat_sessions"));
    const storedActiveId = localStorage.getItem("active_chat_id");

    if (storedSessions?.length) {
      setSessions(storedSessions);
      setActiveId(
        storedSessions.find((s) => s.id === storedActiveId)?.id ||
          storedSessions[0].id
      );
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeId) localStorage.setItem("active_chat_id", activeId);
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Auto-scroll ONLY if user didn't scroll up (ChatGPT behavior)
  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessions, loading]);

  const activeSession = sessions.find((s) => s.id === activeId);

  /* ---------------- HELPERS ---------------- */
  const toggleTheme = () =>
    setTheme((p) => (p === "dark" ? "light" : "dark"));

  const createNewChat = () => {
    const newSession = {
      id: uuid(),
      title: "New Chat",
      messages: [],
    };
    setSessions((p) => [newSession, ...p]);
    setActiveId(newSession.id);
    setMobileOpen(false);
  };

  const deleteChat = (id) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (id === activeId) {
        if (filtered.length) setActiveId(filtered[0].id);
        else createNewChat();
      }
      return filtered;
    });
  };

  const updateSession = (fn) => {
    setSessions((p) =>
      p.map((s) => (s.id === activeId ? fn(s) : s))
    );
  };

  const copyText = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const editQuestion = (text, index) => {
    setQuestion(text);
    updateSession((s) => ({
      ...s,
      messages: s.messages.slice(0, index),
    }));
    inputRef.current?.focus();
  };

  /* ---------------- CHATGPT SCROLL LOGIC ---------------- */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    const atBottom = distanceFromBottom < 40;

    userScrolledUp.current = !atBottom;
    setShowScrollDown(!atBottom);
  };

  const scrollToBottom = () => {
    userScrolledUp.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollDown(false);
  };

  /* ---------------- TYPE EFFECT ---------------- */
  const typeEffect = (text) => {
    const words = text.split(" ");
    let i = 0;
    let current = "";

    updateSession((s) => ({
      ...s,
      messages: [...s.messages, { type: "a", text: "" }],
    }));

    const interval = setInterval(() => {
      if (i < words.length) {
        current += words[i++] + " ";
        updateSession((s) => {
          const msgs = [...s.messages];
          msgs[msgs.length - 1].text = current;
          return { ...s, messages: msgs };
        });
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 18);
  };

  /* ---------------- ASK QUESTION ---------------- */
  const askQuestion = async () => {
    if (!question.trim() || !activeSession) return;

    const userText = question;
    setQuestion("");
    setLoading(true);
    userScrolledUp.current = false;

    updateSession((s) => ({
      ...s,
      title: s.messages.length === 0 ? userText.slice(0, 30) : s.title,
      messages: [...s.messages, { type: "q", text: userText }],
    }));

    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: [
        ...activeSession.messages.map((m) => ({
          role: m.type === "q" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: userText },
      ],
    };

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    typeEffect(data?.choices?.[0]?.message?.content || "No response");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={`h-screen flex ${theme === "dark" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black"}`}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        setActiveId={setActiveId}
        newChat={createNewChat}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        deleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {activeSession?.messages.map((m, i) => {
              const id = `${i}-${m.type}`;
              const iconBase =
                theme === "dark"
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-500 hover:text-zinc-900";

              return (
                <div key={i} className={`group flex ${m.type === "q" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative px-5 py-4 rounded-2xl max-w-[85%]
                    ${
                      m.type === "q"
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-200 border"
                        : theme === "dark"
                        ? "bg-zinc-800"
                        : "bg-white border"
                    }`}
                  >
                    <Answer ans={m.text} theme={theme} />
                    <div
                      className={`absolute -bottom-6 flex gap-2
                      opacity-0 scale-95 translate-y-1
                      group-hover:opacity-100
                      group-hover:scale-100
                      group-hover:translate-y-0
                      transition-all duration-200
                      ${m.type === "q" ? "right-2" : "left-2"}`}
                    >
                      {m.type === "q" && (
                        <button
                          onClick={() => editQuestion(m.text, i)}
                          className={iconBase}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => copyText(m.text, id)}
                        className={iconBase}
                      >
                        {copiedId === id ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && <p className="text-sm opacity-60">Typing…</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* 🔥 CHATGPT-EXACT SCROLL DOWN BUTTON */}
        <div
          className={`pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2
          transition-all duration-200
          ${showScrollDown ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto bg-zinc-700 hover:bg-zinc-600
              text-white rounded-full p-2 shadow-lg"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* INPUT BAR */}
        <div className={`border-t p-4 ${theme === "dark" ? "border-zinc-700" : "border-zinc-300"}`}>
          <div className={`max-w-3xl mx-auto flex rounded-2xl px-4 ${theme === "dark" ? "bg-zinc-800" : "bg-white border"}`}>
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Send a message"
              className="flex-1 bg-transparent p-3 outline-none placeholder-zinc-400"
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
            />
            <button
              onClick={askQuestion}
              className="px-3 text-emerald-500 hover:text-emerald-400 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
