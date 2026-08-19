import { Toaster } from "react-hot-toast";

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(2, 6, 23, 0.25)",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--text)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--danger)",
            secondary: "var(--text)",
          },
        },
      }}
    />
  );
};

export default Toast;
