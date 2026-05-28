import React, { useEffect, useState } from 'react';

export default function LiveBackground() {
  const [nodes, setNodes] = useState([]);
  
  // Generate random data nodes for the background that shoot across the screen
  useEffect(() => {
    const newNodes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 10,
      direction: Math.random() > 0.5 ? 'animate-data-scan-right' : 'animate-data-scan-left',
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#030303]">
      {/* Precision Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Scanning nodes */}
      <div className="absolute inset-0 opacity-40">
        {nodes.map(n => (
          <div 
            key={n.id}
            className={`absolute h-[1px] w-[60px] bg-gradient-to-r ${n.direction === 'animate-data-scan-right' ? 'from-transparent to-[#00f0ff]' : 'from-[#00f0ff] to-transparent'} ${n.direction}`}
            style={{
              top: `${n.top}%`,
              animationDuration: `${n.duration}s`,
              animationDelay: `${n.delay}s`,
              boxShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff'
            }}
          />
        ))}
      </div>
      
      {/* Vignette to soften edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_100%)] pointer-events-none" />
    </div>
  );
}
