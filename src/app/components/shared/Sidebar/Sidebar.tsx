import { Link } from "@tanstack/react-router";
import { Button } from "@heroui/react";
import { useAppStore } from "@app/stores/useAppStore";
import { IoHome, IoSettings } from "react-icons/io5";
import { MdPlaylistAdd, MdMic, MdRadio } from "react-icons/md";
import { HiMenu } from "react-icons/hi";
import type { IconType } from "react-icons";
import type { FileRouteTypes } from "@/routeTree.gen";
import "./Sidebar.scss";

/**
 * The application sidebar component.
 *
 * This component renders a sidebar with navigation links and a toggle button.
 * When the sidebar is open, it displays the navigation links and a mobile overlay.
 * When the sidebar is closed, it only displays the toggle button.
 *
 * @returns A JSX element representing the sidebar component.
 */
export function Sidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const navLinks: Array<{
    to: FileRouteTypes["to"];
    label: string;
    icon: IconType;
  }> = [
    { to: "/", label: "Home", icon: IoHome },
    { to: "/models", label: "Models", icon: MdPlaylistAdd },
    { to: "/transcribe", label: "Transcribe", icon: MdMic },
    // { to: "/live-recorder", label: "Live Recorder", icon: MdRadio },
    { to: "/settings", label: "Settings", icon: IoSettings },
  ];

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <Button
            isIconOnly
            variant="light"
            onPress={toggleSidebar}
            className="sidebar-toggle"
          >
            <HiMenu size={20} />
          </Button>
          {sidebarOpen && <h2>Whisper App</h2>}
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="nav-link"
                  activeProps={{ className: "active" }}
                >
                  <Icon className="nav-icon" />
                  {sidebarOpen && <span className="nav-text">{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
    </>
  );
}
