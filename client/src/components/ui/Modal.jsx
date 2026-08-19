import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="wc-modal fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto p-4">
      <div className={cn("wc-modal__panel relative flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden", sizes[size])}>
        <header className="wc-modal__header shrink-0">
          <h2 className="wc-modal__title">{title}</h2>
          <button type="button" onClick={onClose} className="wc-modal__close" aria-label="Close dialog">
            <X size={19} />
          </button>
        </header>
        <div className="wc-modal-content min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
