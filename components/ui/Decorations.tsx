"use client"

import React from "react"

/* Scattered decorative elements inspired by the mockup —
   starbursts, sticky notes, smiley faces, hearts */

export function Starburst({ 
  size = 40, 
  color = "#FF8A80", 
  className = "",
  style = {}
}: { 
  size?: number; 
  color?: string; 
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`animate-float ${className}`}
      style={style}
    >
      <polygon
        points="50,0 61,35 97,35 68,57 79,91 50,70 21,91 32,57 3,35 39,35"
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="2"
      />
    </svg>
  )
}

export function StickyNote({ 
  children, 
  color = "#FFE4B5", 
  rotation = -3,
  className = "",
  style = {}
}: { 
  children?: React.ReactNode; 
  color?: string; 
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div 
      className={`sticky-note ${className}`}
      style={{ 
        background: color, 
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
    >
      {children || "📝"}
    </div>
  )
}

export function Smiley({ 
  size = 36,
  className = "",
  style = {}
}: { 
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      className={className}
      style={style}
    >
      <circle cx="30" cy="30" r="28" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="20" cy="23" r="3" fill="#1a1a1a" />
      <circle cx="40" cy="23" r="3" fill="#1a1a1a" />
      <path d="M 18 38 Q 30 48 42 38" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function Heart({ 
  size = 24, 
  color = "#FF6B6B",
  className = "",
  style = {}
}: { 
  size?: number; 
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      style={style}
    >
      <path 
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="0.5"
      />
    </svg>
  )
}

export function DoodleBook({ 
  size = 48,
  className = "",
  style = {}
}: { 
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      className={className}
      style={style}
    >
      {/* Book body */}
      <rect x="12" y="8" width="40" height="48" rx="2" fill="#D4A76A" stroke="#1a1a1a" strokeWidth="2" />
      <rect x="16" y="12" width="32" height="40" rx="1" fill="#FFF8E7" stroke="#1a1a1a" strokeWidth="1.5" />
      {/* Lines on the page */}
      <line x1="20" y1="22" x2="44" y2="22" stroke="#c9b99a" strokeWidth="1" />
      <line x1="20" y1="28" x2="44" y2="28" stroke="#c9b99a" strokeWidth="1" />
      <line x1="20" y1="34" x2="44" y2="34" stroke="#c9b99a" strokeWidth="1" />
      <line x1="20" y1="40" x2="44" y2="40" stroke="#c9b99a" strokeWidth="1" />
      {/* Pencil */}
      <line x1="38" y1="18" x2="46" y2="10" stroke="#FF8A80" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* Scatter decorations around a page area */
export function PageDecorations() {
  return (
    <>
      {/* Top left area */}
      <Starburst 
        size={50} color="#FF8A80" 
        className="fixed" 
        style={{ top: '8%', left: '3%', animationDelay: '0s' }} 
      />
      <StickyNote 
        color="#FFB6C1" rotation={-8}
        className="fixed"
        style={{ top: '15%', left: '1%', fontSize: '10px' }}
      >
        📖
      </StickyNote>

      {/* Top right */}
      <Starburst 
        size={35} color="#FFB6C1" 
        className="fixed" 
        style={{ top: '5%', right: '4%', animationDelay: '1s' }} 
      />
      
      {/* Bottom left */}
      <DoodleBook 
        size={44}
        className="fixed animate-wiggle" 
        style={{ bottom: '12%', left: '2%', animationDelay: '0.5s' }} 
      />
      <Starburst 
        size={30} color="#FF8A80" 
        className="fixed" 
        style={{ bottom: '8%', left: '6%', animationDelay: '2s' }} 
      />

      {/* Bottom right */}
      <Heart 
        size={28} color="#FF6B6B"
        className="fixed animate-float" 
        style={{ bottom: '10%', right: '3%', animationDelay: '1.5s' }} 
      />

      {/* Middle left */}
      <Smiley
        size={32}
        className="fixed"
        style={{ top: '45%', left: '2%' }}
      />

      {/* Middle right */}
      <StickyNote 
        color="#FFE4B5" rotation={5}
        className="fixed"
        style={{ top: '40%', right: '1%', fontSize: '10px' }}
      >
        ✏️
      </StickyNote>
    </>
  )
}
