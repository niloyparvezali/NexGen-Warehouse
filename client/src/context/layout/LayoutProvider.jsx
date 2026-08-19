import { useState } from "react";
import LayoutContext from "./LayoutContext";

export default function LayoutProvider({ children }) {
  // One state intentionally serves both desktop collapse and mobile open/close:
  // desktop: true = full sidebar, false = icon rail; mobile: true = open, false = closed.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const value = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
