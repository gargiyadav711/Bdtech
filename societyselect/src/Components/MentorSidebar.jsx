import { useEffect, useState } from "react";
import {LayoutDashboard,Users,ClipboardCheck,CalendarDays,MessageSquare,Settings,LogOut,} from "lucide-react";
import { navigateTo } from "../utils/navigation";
import "./MentorSidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/mentor",
  },
  {
    label: "My Students",
    icon: Users,
    href: "/mentor/students",
  },
  {
    label: "Task Reviews",
    icon: ClipboardCheck,
    href: "/mentor/projects",
  },
  
  {
    label: "Attendance",
    icon: CalendarDays,
    href: "/mentor/attendance",
  },
   {
    label: "Interviews",
    icon: MessageSquare,
    href: "/mentor/interviews",
  },
  {
    label: "Examination Management",
    icon: ClipboardCheck,
    href: "/mentor/examination-management",
  },
];

function MentorSidebar() {
  const getNormalizedPath = () => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const hash = (window.location.hash || "").replace(/^#\/?/, "").replace(/\/+$/, "");
    return { path, hash };
  };

  const [locationState, setLocationState] = useState(getNormalizedPath);

  useEffect(() => {
    const handleLocation = () => {
      setLocationState(getNormalizedPath());
    };

    window.addEventListener("popstate", handleLocation);
    window.addEventListener("hashchange", handleLocation);

    return () => {
      window.removeEventListener("popstate", handleLocation);
      window.removeEventListener("hashchange", handleLocation);
    };
  }, []);

  const isItemActive = (href) => {
    const { path, hash } = locationState;
    if (
      href === "/mentor/interviews" &&
      (path === "/interviewpage" || hash === "interviewpage")
    ) {
      return true;
    }
    if (href === "/mentor") {
      return (
        (path === "/mentor" || hash === "mentor") &&
        !path.startsWith("/mentor/students") &&
        !hash.startsWith("mentor/students")
      );
    }
    return (
      path === href ||
      path.startsWith(href) ||
      hash === href.replace(/^\//, "") ||
      hash.startsWith(href.replace(/^\//, ""))
    );
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigateTo(href);
  };

  return (
    <aside className="mentor-sidebar">
      <div
        className="mentor-sidebar-brand"
        onClick={(e) => handleNavClick(e, "/mentor")}
        style={{ cursor: "pointer" }}
      >
        <div className="mentor-logo-text">
          <h2>SocietySelect</h2>
        </div>
      </div>

      <div className="mentor-sidebar-menu">
        <p className="mentor-menu-heading">WORKSPACE</p>
        <nav className="mentor-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <a
                href={item.href}
                key={item.label}
                className={`mentor-sidebar-link ${active ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="mentor-sidebar-bottom">
        <a
          href="/login"
          className="mentor-sidebar-link mentor-logout"
          onClick={(e) => handleNavClick(e, "/login")}
        >
          <LogOut size={19} />
          <span>Log Out</span>
        </a>
      </div>
    </aside>
  );
}

export default MentorSidebar;
