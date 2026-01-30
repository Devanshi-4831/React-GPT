//Components/Sidebar.jsx 

// Components/Sidebar.jsx
import { Sun, Moon, Trash2 } from "lucide-react";

function Sidebar({
  sessions,
  activeId,
  setActiveId,
  newChat,
  mobileOpen,
  setMobileOpen,
  theme,
  toggleTheme,
  deleteChat, // ✅ NEW
}) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static z-40 h-full w-64
        ${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"}
        border-r flex flex-col
        transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={newChat}
            className={`w-full rounded-lg py-2 transition
              ${
                theme === "dark"
                  ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                  : "bg-white hover:bg-zinc-200 text-black border"
              }`}
          >
            + New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="p-2 flex-1 overflow-y-auto space-y-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                ${
                  s.id === activeId
                    ? theme === "dark"
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-300 text-black"
                    : theme === "dark"
                    ? "hover:bg-zinc-700 text-zinc-300"
                    : "hover:bg-zinc-200 text-zinc-700"
                }`}
              onClick={() => {
                setActiveId(s.id);
                setMobileOpen(false);
              }}
            >
              <span className="truncate">{s.title}</span>

              {/* 🗑️ Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div
          className={`p-4 border-t
          ${theme === "dark" ? "border-zinc-700" : "border-zinc-300"}`}
        >
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 transition
              ${
                theme === "dark"
                  ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                  : "bg-white hover:bg-zinc-200 text-black border"
              }`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
