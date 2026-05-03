"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageDecorations, Smiley, Starburst, Heart, DoodleBook } from "@/components/ui/Decorations"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-pink-bg)' }}
    >
      {/* Scattered decorative elements */}
      <PageDecorations />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        
        {/* Smiley above logo */}
        <div 
          className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <Smiley size={48} />
        </div>

        {/* Logo Box - Big "Thoughts" in a sketch box */}
        <div 
          className={`sketch-box-thick px-12 py-6 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          style={{ transitionDelay: '0ms' }}
        >
          <h1 
            className="text-5xl md:text-7xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-sketch, 'Courier New', monospace)" }}
          >
            Thoughts
          </h1>
        </div>

        {/* Tagline */}
        <p 
          className={`text-lg md:text-xl text-foreground/80 italic transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ 
            fontFamily: "var(--font-sketch, 'Courier New', monospace)",
            transitionDelay: '400ms'
          }}
        >
          &quot;Your path to emotional balance.&quot;
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row items-center gap-4 mt-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '600ms' }}
        >
          <Link href="/diary" style={{ textDecoration: 'none' }}>
            <button className="sketch-btn text-lg px-10 py-4 flex items-center gap-3">
              <DoodleBook size={28} />
              <span>Start Writing</span>
            </button>
          </Link>

          <Link href="/mood" style={{ textDecoration: 'none' }}>
            <button className="sketch-btn-outline text-base px-8 py-3 flex items-center gap-2">
              📊 View My Mood
            </button>
          </Link>
        </div>

        {/* Features preview */}
        <div 
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '800ms' }}
        >
          <FeatureCard
            icon="✍️"
            title="Write Freely"
            description="Pour your thoughts into your personal digital diary"
          />
          <FeatureCard
            icon="🎙️"
            title="Speak Your Mind"
            description="Record voice entries when typing feels like too much"
          />
          <FeatureCard
            icon="📈"
            title="Track Your Mood"
            description="AI analyzes your emotions and shows you patterns over time"
          />
        </div>

        {/* Decorative hearts at bottom */}
        <div 
          className={`flex items-center gap-3 mt-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '1000ms' }}
        >
          <Heart size={16} color="#FF8A80" />
          <span 
            className="text-xs text-foreground/50"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            made with care for your mental wellness
          </span>
          <Heart size={16} color="#FF8A80" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="sketch-box-thin p-5 text-center hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1a1a1a] transition-all duration-200">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 
        className="text-sm font-bold mb-2"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {title}
      </h3>
      <p 
        className="text-xs text-foreground/60 leading-relaxed"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {description}
      </p>
    </div>
  )
}