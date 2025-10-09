import { Link } from "@tanstack/react-router";
import { Button } from "@heroui/react";
import { useAppStore } from "@app/stores/useAppStore";
import { IoHome, IoSettings } from "react-icons/io5";
import { MdPlaylistAdd, MdMic } from "react-icons/md";
import { HiMenu } from "react-icons/hi";

export function Sidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Whisper App</h2>}
          <Button
            isIconOnly
            variant="light"
            onPress={toggleSidebar}
            className="sidebar-toggle"
          >
            <HiMenu size={20} />
          </Button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-link" activeProps={{ className: "active" }}>
            <IoHome className="nav-icon" />
            {sidebarOpen && <span className="nav-text">Home</span>}
          </Link>

          <Link to="/models" className="nav-link" activeProps={{ className: "active" }}>
            <MdPlaylistAdd className="nav-icon" />
            {sidebarOpen && <span className="nav-text">Models</span>}
          </Link>

          <Link to="/transcribe" className="nav-link" activeProps={{ className: "active" }}>
            <MdMic className="nav-icon" />
            {sidebarOpen && <span className="nav-text">Transcribe</span>}
          </Link>

          <Link to="/settings" className="nav-link" activeProps={{ className: "active" }}>
            <IoSettings className="nav-icon" />
            {sidebarOpen && <span className="nav-text">Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
    </>
  );
}
