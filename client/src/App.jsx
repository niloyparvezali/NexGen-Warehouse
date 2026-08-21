import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Toast from "./components/ui/Toast";
import LoadingScreen from "./components/ui/LoadingScreen";
import AppRouter from "./routes/AppRouter";

function labelResponsiveTables(root = document) {
  root.querySelectorAll?.("table").forEach((table) => {
    const headers = Array.from(table.querySelectorAll(":scope > thead > tr:last-child > th")).map((th) =>
      th.textContent.replace(/\s+/g, " ").trim()
    );
    if (!headers.length) return;
    table.querySelectorAll(":scope > tbody > tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.tagName !== "TD" || cell.hasAttribute("colspan")) return;
        if (headers[index]) cell.dataset.label = headers[index];
      });
    });
  });
}

function App() {
  useEffect(() => {
    labelResponsiveTables();
    const observer = new MutationObserver(() => labelResponsiveTables());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <BrowserRouter><LoadingScreen /><Toast /><AppRouter /></BrowserRouter>;
}
export default App;
