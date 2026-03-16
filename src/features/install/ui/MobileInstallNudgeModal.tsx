import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import useInstallPrompt from "@/features/install/application/useInstallPrompt";
import {
  FiPlusSquare as AddToHomeIcon,
  FiShare as ShareIcon,
  FiX as CloseIcon,
} from "react-icons/fi";

const MOBILE_VIEW_QUERY =
  "(max-width: 768px), (hover: none) and (pointer: coarse)";

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    ("standalone" in window.navigator
      ? (window.navigator as { standalone?: boolean }).standalone === true
      : false) || window.matchMedia("(display-mode: standalone)").matches
  );
}

interface MobileInstallNudgeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileInstallNudgeModal({
  open,
  onClose,
}: MobileInstallNudgeModalProps) {
  const { deferredPrompt, showIosHint, dismissed, dismiss, handleInstall } =
    useInstallPrompt();
  const [isMobileView, setIsMobileView] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia(MOBILE_VIEW_QUERY);
    const sync = () => setIsMobileView(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (open) {
      setShowNudge(true);
      setHelpOpen(false);
    }
  }, [open]);

  const shouldRender = useMemo(
    () =>
      open &&
      isMobileView &&
      !dismissed &&
      !isStandaloneMode() &&
      (showNudge || helpOpen),
    [dismissed, helpOpen, isMobileView, open, showNudge],
  );

  if (!shouldRender) {
    return null;
  }

  const closeNudge = () => {
    onClose();
  };

  const handleMaybeLater = () => {
    dismiss();
    onClose();
  };

  const handleInstallClick = async () => {
    setShowNudge(false);
    if (deferredPrompt) {
      await handleInstall();
      onClose();
      return;
    }
    setHelpOpen(true);
  };

  return createPortal(
    <>
      {showNudge ? (
        <div
          className="picker-modal-backdrop"
          role="presentation"
          onClick={closeNudge}
        >
          <div
            className="picker-modal credits-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-install-nudge-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="credits-modal-body">
              <p
                className="credits-modal-headline"
                id="mobile-install-nudge-title"
              >
                ✨ Better on Home Screen
              </p>
              <p className="credits-modal-text">
                For the best mobile experience, add TerraInk to your home
                screen. It opens faster, feels app-like, and keeps your layout
                stable while you create posters.
              </p>
              <div className="credits-modal-actions">
                <button
                  type="button"
                  className="credits-modal-keep"
                  onClick={() => void handleInstallClick()}
                >
                  Install
                </button>
                <button
                  type="button"
                  className="credits-modal-remove"
                  onClick={handleMaybeLater}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div
          className="install-help-modal-backdrop"
          role="presentation"
          onClick={() => {
            setHelpOpen(false);
            onClose();
          }}
        >
          <div
            className="install-help-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Install help"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="install-help-modal-close"
              onClick={() => {
                setHelpOpen(false);
                onClose();
              }}
              aria-label="Close install help"
            >
              <CloseIcon />
            </button>
            <h3 className="install-help-modal-title">Install TerraInk</h3>
            {showIosHint ? (
              <ol className="install-help-steps">
                <li>
                  <span className="install-help-step-icon" aria-hidden="true">
                    <ShareIcon />
                  </span>
                  <span>
                    Tap <span className="install-help-emphasis">Share</span> in
                    your browser.
                  </span>
                </li>
                <li>
                  <span className="install-help-step-icon" aria-hidden="true">
                    <AddToHomeIcon />
                  </span>
                  <span>
                    Then choose{" "}
                    <span className="install-help-emphasis">
                      Add to Home Screen
                    </span>
                    .
                  </span>
                </li>
              </ol>
            ) : (
              <p className="install-help-modal-text">
                Install is not available right now in this browser session.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
