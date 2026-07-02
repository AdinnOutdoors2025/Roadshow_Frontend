/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useRef } from 'react';

interface ButtonHoverProps {
  label?: string;
  onClick?: () => void;
  className?: string;        // pass your own CSS class
  children?: React.ReactNode; // or pass children instead of label
  type?: 'button' | 'submit' | 'reset';
}

export function ButtonHover({
  label,
  onClick,
  className = 'RS_VehicleButton',
  children,
  type = 'button',
}: ButtonHoverProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const bubble = btn.querySelector<HTMLSpanElement>('.RS_BtnBubble');
    if (!bubble) return;

    const place = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.4;
      bubble.style.width  = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left   = (x - size / 2) + 'px';
      bubble.style.top    = (y - size / 2) + 'px';
    };

    const onEnter = (e: MouseEvent) => {
      place(e);
      bubble.style.transition = 'none';
      bubble.style.transform  = 'scale(0)';
      bubble.style.opacity    = '0';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          bubble.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease';
          bubble.style.transform  = 'scale(1)';
          bubble.style.opacity    = '1';
        })
      );
    };

    const onLeave = (e: MouseEvent) => {
      place(e);
      bubble.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease';
      bubble.style.transform  = 'scale(0)';
      bubble.style.opacity    = '0';
    };

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <button type={type} className={className} ref={btnRef} onClick={onClick}>
      <span>{children ?? label}</span>
      <span className="RS_BtnBubble" />
    </button>
  );
}