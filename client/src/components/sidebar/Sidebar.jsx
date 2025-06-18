import "./sidebar.scss";
import { useState } from "react";
import {
  Home,
  BookOpen,
  GraduationCap,
  BarChart3,
  Megaphone,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", path: "/", hasRoute: true },
    {
      icon: Megaphone,
      label: "Announcement",
      path: "/create-announcement",
      hasRoute: true,
    },
    { icon: BookOpen, label: "Quizes", path: "/create-quiz", hasRoute: true },
    { icon: GraduationCap, label: "Gradebook", hasRoute: false },
    { icon: BarChart3, label: "Performance", hasRoute: false },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="sidebar__mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="sidebar__overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__logo">
          <h1>Coligo</h1>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {menuItems.map((item, index) => (
              <li key={index} className="sidebar__menu-item">
                {item.hasRoute ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__menu-link ${
                        isActive ? "sidebar__menu-link--active" : ""
                      }`
                    }
                    onClick={() => setIsOpen(false)} // Close sidebar on mobile when navigating
                  >
                    <item.icon className="sidebar__menu-icon" size={20} />
                    <span className="sidebar__menu-text">{item.label}</span>
                  </NavLink>
                ) : (
                  <a
                    href="#"
                    className="sidebar__menu-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    <item.icon className="sidebar__menu-icon" size={20} />
                    <span className="sidebar__menu-text">{item.label}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
