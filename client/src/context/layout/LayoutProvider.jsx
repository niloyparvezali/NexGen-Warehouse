import { useEffect, useState } from "react";
import LayoutContext from "./LayoutContext";

const getInitialSidebarState = () => typeof window !== "undefined" ? window.innerWidth >= 768 : true;

export default function LayoutProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    document.body.classList.toggle("sidebar-drawer-open", mobile && sidebarOpen);
    return () => document.body.classList.remove("sidebar-drawer-open");
  }, [sidebarOpen]);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </LayoutContext.Provider>
  );
}
