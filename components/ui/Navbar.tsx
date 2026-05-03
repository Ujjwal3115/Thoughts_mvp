"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, PenLine, User, Menu, X } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: "/diary", label: "My Diary", icon: PenLine },
    { href: "/mood", label: "Mood Graph", icon: BarChart3 },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sketch-box-thin rounded-b-lg" style={{ background: 'var(--color-cream)' }}>
      <div className="flex items-center justify-between px-4 md:px-5 py-3">
        {/* Logo / Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-2 no-underline flex-shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <div 
            className="sketch-box px-3 py-1 rounded-md"
            style={{ boxShadow: '3px 3px 0px #1a1a1a' }}
          >
            <span 
              className="text-lg md:text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-sketch, 'Courier New', monospace)" }}
            >
              Thoughts
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-bold no-underline transition-all rounded-md
                ${isActive(href) 
                  ? 'sketch-box text-foreground' 
                  : 'text-foreground/70 hover:text-foreground'
                }
              `}
              style={{ 
                fontFamily: "'Courier New', monospace",
                textDecoration: 'none',
                boxShadow: isActive(href) ? '3px 3px 0px #1a1a1a' : 'none'
              }}
            >
              <Icon size={16} strokeWidth={2.5} />
              {label}
            </Link>
          ))}

          {/* Date display — desktop only */}
          <div 
            className="items-center gap-2 px-3 py-2 text-xs text-foreground/60 hidden lg:flex"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Profile button */}
          <div 
            className="sketch-btn-outline flex items-center gap-1 text-xs rounded-md"
            style={{ cursor: 'pointer', padding: '6px 12px' }}
          >
            <User size={14} strokeWidth={2.5} />
            Profile
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden sketch-btn-outline flex items-center justify-center rounded-md"
          style={{ padding: '6px 8px' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div 
          className="md:hidden border-t-2 px-4 py-3 flex flex-col gap-2 animate-slide-up"
          style={{ borderColor: '#1a1a1a', background: 'var(--color-cream)' }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-bold no-underline transition-all rounded-md
                ${isActive(href) 
                  ? 'sketch-box text-foreground' 
                  : 'text-foreground/70 hover:bg-[var(--color-cream-dark)]'
                }
              `}
              style={{ 
                fontFamily: "'Courier New', monospace",
                textDecoration: 'none',
                boxShadow: isActive(href) ? '3px 3px 0px #1a1a1a' : 'none'
              }}
            >
              <Icon size={18} strokeWidth={2.5} />
              {label}
            </Link>
          ))}

          {/* Profile in mobile menu */}
          <div 
            className="sketch-btn-outline flex items-center gap-2 text-sm rounded-md mt-1"
            style={{ cursor: 'pointer', padding: '10px 16px' }}
          >
            <User size={16} strokeWidth={2.5} />
            Profile
          </div>

          {/* Date in mobile menu */}
          <div 
            className="text-xs text-foreground/50 text-center pt-2 pb-1"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
