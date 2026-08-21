import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
const DashboardLayout = () => (
  <div className="app-shell flex min-h-screen text-[var(--color-text-primary)]">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <Header />
      <main className="min-h-0 flex-1 overflow-x-hidden bg-[var(--color-background)]">
        <div className="mx-auto min-h-full w-full max-w-[1900px]"><Outlet /></div>
      </main>
    </div>
  </div>
);
export default DashboardLayout;
