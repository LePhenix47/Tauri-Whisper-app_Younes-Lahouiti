import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@heroui/react";
import { IoClose } from "react-icons/io5";
import "./Popup.scss";

interface PopupProps {
  // Core
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // Variant
  variant?: "center" | "sliding" | "bottom-sheet";

  // Header
  title?: string;
  showCloseButton?: boolean;

  // Behavior
  closeOnMaskClick?: boolean;
  enableAnimation?: boolean;
  usePortal?: boolean;

  // Styling
  className?: string;
  maskClassName?: string;
}

export function Popup({
  isOpen,
  onClose,
  children,
  variant = "center",
  title,
  showCloseButton = true,
  closeOnMaskClick = true,
  enableAnimation = true,
  usePortal = true,
  className = "",
  maskClassName = "",
}: PopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  // Open popup
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    // Open as non-modal dialog (like old implementation)
    dialog.show();

    // Add opened class for animation
    dialog.classList.add("opened");
    dialog.classList.remove("closed");
  }, [isOpen]);

  // Close popup with animation
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || isOpen) return;

    const isMobile = window.innerWidth <= 768;
    const shouldHaveExitAnimation =
      (variant === "sliding" || isMobile) && enableAnimation;

    if (!shouldHaveExitAnimation) {
      dialog.close();
      return;
    }

    // Trigger close animation
    dialog.classList.remove("opened");
    dialog.classList.add("closed");

    // Wait for animation to complete
    const handleAnimationEnd = () => {
      dialog.close();
      dialog.removeEventListener("animationend", handleAnimationEnd);
    };

    dialog.addEventListener("animationend", handleAnimationEnd);

    return () => {
      dialog.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [isOpen, variant, enableAnimation]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("popup-open");
    } else {
      // Check if there are other open popups before removing
      setTimeout(() => {
        const otherPopups = document.querySelectorAll("dialog[open]:not(.closed)");
        if (otherPopups.length === 0) {
          document.body.classList.remove("popup-open");
        }
      }, 100);
    }

    return () => {
      setTimeout(() => {
        const otherPopups = document.querySelectorAll("dialog[open]:not(.closed)");
        if (otherPopups.length === 0) {
          document.body.classList.remove("popup-open");
        }
      }, 100);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleMaskClick = () => {
    if (closeOnMaskClick) {
      onClose();
    }
  };

  const popupClassNames = [
    "popup",
    `popup-${variant}`,
    enableAnimation ? "" : "popup-no-animation",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const maskClassNames = ["mask", "mask-background", maskClassName]
    .filter(Boolean)
    .join(" ");

  const popupElement = (
    <div className="popup-wrapper">
      <dialog ref={dialogRef} className={popupClassNames}>
        <section className="popup-container">
          {(title || showCloseButton) && (
            <header className="popup-header">
              {title && <h2 className="popup-title">{title}</h2>}
              {showCloseButton && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onClose}
                  className="popup-close-button"
                  aria-label="Close"
                >
                  <IoClose size={24} />
                </Button>
              )}
            </header>
          )}
          <div className="popup-content">{children}</div>
        </section>
      </dialog>

      <div ref={maskRef} className={maskClassNames} onClick={handleMaskClick} />
    </div>
  );

  return usePortal ? createPortal(popupElement, document.body) : popupElement;
}
