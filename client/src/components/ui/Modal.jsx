import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => panelRef.current?.querySelector("input,select,textarea,button")?.focus());
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizes = { sm:"max-w-md", md:"max-w-2xl", lg:"max-w-4xl", xl:"max-w-5xl" };
  return <div className="wc-modal fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto p-3 sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}><div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="wc-modal-title" className={cn("wc-modal__panel relative flex w-full max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden", sizes[size])}><header className="wc-modal__header shrink-0"><h2 id="wc-modal-title" className="wc-modal__title">{title}</h2><button type="button" onClick={onClose} className="wc-modal__close" aria-label="Close dialog"><X size={19} /></button></header><div className="wc-modal-content min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div></div></div>;
};
export default Modal;
