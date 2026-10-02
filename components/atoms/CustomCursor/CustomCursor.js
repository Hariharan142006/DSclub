"use client";

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const isHoveringRef = useRef(false);
  const rafRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const updateCursorDOM = () => {
      const { x, y } = posRef.current;
      
      // Smooth trailing for the ring
      ringPosRef.current.x += (x - ringPosRef.current.x) * 0.15;
      ringPosRef.current.y += (y - ringPosRef.current.y) * 0.15;

      const hovering = isHoveringRef.current;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hovering ? 0 : 1})`;
      }

      if (ringRef.current) {
        const ringSize = hovering ? 40 : 28;
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        
        if (hovering) {
          ringRef.current.style.opacity = '0.5';
        } else {
          ringRef.current.style.opacity = '1';
        }
      }

      rafRef.current = requestAnimationFrame(updateCursorDOM);
    };

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      isHoveringRef.current =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('input') !== null ||
        target.closest('select') !== null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    
    // Start animation loop
    rafRef.current = requestAnimationFrame(updateCursorDOM);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot">
        <div className="crosshair-x"></div>
        <div className="crosshair-y"></div>
      </div>
      <div ref={ringRef} className="cursor-ring">
        <span className="corner top-left"></span>
        <span className="corner top-right"></span>
        <span className="corner bottom-left"></span>
        <span className="corner bottom-right"></span>
      </div>
    </>
  );
}
