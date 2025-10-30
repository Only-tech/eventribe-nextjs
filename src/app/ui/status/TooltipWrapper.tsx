import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: React.ReactNode;
  referenceElement?: React.RefObject<HTMLElement | null>;

}

export default function TooltipWrapper({ children, content, referenceElement }: TooltipWrapperProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && referenceElement?.current) {
      const refRect = referenceElement.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const padding = 8;

      const left = Math.min(
        Math.max(refRect.left, padding),
        window.innerWidth - tooltipWidth - padding
      );
      const top = refRect.top + refRect.height / 2;

      setCoords({ top, left });
    }
  }, [visible, referenceElement]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block underline decoration-dotted cursor-help"
        onClick={() => {
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        }}
        onMouseEnter={() => setVisible(true)}
      >
        {children}
      </span>

      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
                onMouseLeave={() => setVisible(false)}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="fixed z-10000 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md p-3 w-[320px] text-xs leading-relaxed shadow-lg"
                style={{ top: coords.top, left: coords.left, transform: 'translateY(-50%)' }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
