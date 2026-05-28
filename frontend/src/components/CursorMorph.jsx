import React, { useEffect, useRef, useState } from 'react';

export default function CursorMorph() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const requestRef = useRef(null);
  
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  const [hoverState, setHoverState] = useState('default'); // 'default', 'magnetic', 'text'

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
      }
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (target.closest('[data-cursor="magnetic"]')) {
        setHoverState('magnetic');
      } else if (target.closest('[data-cursor="text"]')) {
        setHoverState('text');
      } else {
        setHoverState('default');
      }
    };

    const render = () => {
      // Lerp ring
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate3d(-50%, -50%, 0)`;
      }
      requestRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Small dot tracking exactly */}
      <div 
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full transition-all duration-300 ease-out will-change-transform mix-blend-difference ${
          hoverState === 'magnetic' ? 'w-0 h-0 opacity-0' : 'w-2 h-2 bg-white'
        }`}
      />
      
      {/* Lerped ring */}
      <div 
        ref={ringRef}
        className={`absolute top-0 left-0 rounded-full border border-white transition-all duration-300 ease-out will-change-transform flex items-center justify-center mix-blend-difference
          ${hoverState === 'magnetic' ? 'w-20 h-20 bg-white/10 scale-125 border-white/50 backdrop-blur-sm' : 
            hoverState === 'text' ? 'w-24 h-24 bg-white border-transparent mix-blend-screen scale-150 blur-xl opacity-20' : 
            'w-8 h-8 bg-transparent scale-100'}
        `}
      />
    </div>
  );
}
