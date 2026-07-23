import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;

  onClose: () => void;

  onConfirm?: () => void;

  confirmText?: string;
  cancelText?: string;

  confirmColor?: "primary" | "success" | "danger";

  width?: "sm" | "md" | "lg" | "xl";

  loading?: boolean;

  hideFooter?: boolean;
}

const widths = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Save",
  cancelText = "Cancel",
  confirmColor = "primary",
  width = "md",
  loading = false,
  hideFooter = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const buttonColor = {
    primary: "bg-brand-500 hover:bg-brand-600",
    success: "bg-green-600 hover:bg-green-700",
    danger: "bg-red-600 hover:bg-red-700",
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/40 p-5">
      <div
        className={`w-full ${widths[width]} rounded-xl bg-white shadow-xl dark:bg-gray-900`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {!hideFooter && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-white ${buttonColor[confirmColor]}`}
            >
              {loading ? "Please wait..." : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}