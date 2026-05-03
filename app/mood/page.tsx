"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { PageDecorations, Heart } from "@/components/ui/Decorations"

interface Entry {
  id: string
  text_content: string
  modality: string
  valence_score: number
  dominant_emotion: string
  created_at: string
}

interface Stats {
  totalEntries: number
  averageValence: number
  emotionCounts: Record<string, number>
  mostFrequentEmotion: string
  moodTrend: 'improving' | 'declining' | 'stable'
}

// Map emotions to emoji
const emotionEmoji: Record<string, string> = {
  Happy: '😊', Excited: '🤩', Calm: '😌', Grateful: '🙏', 
  Hopeful: '🌟', Content: '☺️', Anxious: '😰', Sad: '😢',
  Angry: '😠', Stressed: '😤', Lonely: '😔', Confused: '😕',
  Neutral: '😐', Tired: '😴', Motivated: '💪', Nostalgic: '🥹',
}

// Map valence to color
function valenceToColor(v: number): string {
  if (v > 0.5) return '#4CAF50'
  if (v > 0.2) return '#8BC34A'
  if (v > -0.2) return '#FF9800'
  if (v > -0.5) return '#FF5722'
  return '#F44336'
}

export default function MoodPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/entries?days=${days}&limit=100`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEntries(data.entries || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error(err)
      setError('Could not load your mood data.')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-pink-bg)' }}
    >
      <PageDecorations />
      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col gap-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-sketch, 'Courier New', monospace)" }}
            >
              📊 Mood Graph
            </h1>
            <div className="flex items-center gap-2">
              {/* Day range selector */}
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={d === days ? 'sketch-btn' : 'sketch-btn-outline'}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  {d}d
                </button>
              ))}
              <button
                onClick={fetchData}
                className="sketch-btn-outline flex items-center gap-1"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="sketch-box-thick p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 size={32} className="animate-spin" />
              <p style={{ fontFamily: "'Courier New', monospace" }} className="text-sm">
                Loading your mood data...
              </p>
            </div>
          ) : error ? (
            <div className="sketch-box-thick p-8 text-center">
              <p style={{ fontFamily: "'Courier New', monospace" }} className="text-sm text-red-600">
                {error}
              </p>
              <button onClick={fetchData} className="sketch-btn mt-4" style={{ fontSize: '13px', padding: '6px 16px' }}>
                Try Again
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="sketch-box-thick p-12 text-center">
              <p className="text-4xl mb-4">📝</p>
              <h2 
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-sketch, 'Courier New', monospace)" }}
              >
                No entries yet
              </h2>
              <p 
                className="text-sm text-foreground/60 mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Start writing in your diary to see your mood trends here!
              </p>
              <a href="/diary" className="sketch-btn inline-block" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 20px' }}>
                Write First Entry
              </a>
            </div>
          ) : (
            <>
              {/* Stats cards */}
              {stats && <StatsBar stats={stats} />}

              {/* Mood over time chart */}
              <div className="sketch-box-thick overflow-hidden">
                <div className="retro-titlebar">
                  <span>Mood Over Time</span>
                  <span className="text-[11px] text-white/60">
                    {entries.length} entries · Last {days} days
                  </span>
                </div>
                <div 
                  className="p-6" 
                  style={{ background: 'var(--color-cream)' }}
                >
                  <MoodChart 
                    entries={entries} 
                    hoveredPoint={hoveredPoint}
                    setHoveredPoint={setHoveredPoint}
                  />
                </div>
              </div>

              {/* Emotion breakdown */}
              {stats && (
                <div className="sketch-box-thick overflow-hidden">
                  <div className="retro-titlebar">
                    <span>Emotion Breakdown</span>
                  </div>
                  <div 
                    className="p-6" 
                    style={{ background: 'var(--color-cream)' }}
                  >
                    <EmotionBreakdown emotionCounts={stats.emotionCounts} total={stats.totalEntries} />
                  </div>
                </div>
              )}

              {/* Recent entries list */}
              <div className="sketch-box-thick overflow-hidden">
                <div className="retro-titlebar">
                  <span>Recent Entries</span>
                </div>
                <div style={{ background: 'var(--color-cream)', maxHeight: '400px', overflowY: 'auto' }}>
                  {entries.slice().reverse().slice(0, 15).map((entry, i) => (
                    <div 
                      key={entry.id}
                      className="px-6 py-3 border-b flex items-start gap-4"
                      style={{ 
                        borderColor: '#ddd',
                        fontFamily: "'Courier New', monospace",
                        animationDelay: `${i * 50}ms`
                      }}
                    >
                      <div className="flex-shrink-0 text-xl">
                        {emotionEmoji[entry.dominant_emotion] || '😐'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed truncate" style={{ maxWidth: '500px' }}>
                          {entry.text_content}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span 
                            className="text-[10px] px-2 py-0.5 font-bold"
                            style={{ 
                              background: valenceToColor(entry.valence_score) + '22',
                              color: valenceToColor(entry.valence_score),
                              border: `1px solid ${valenceToColor(entry.valence_score)}`
                            }}
                          >
                            {entry.dominant_emotion}
                          </span>
                          <span className="text-[10px] text-foreground/40">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <span className="text-[10px] text-foreground/30">
                            {entry.modality === 'audio' ? '🎤' : '✍️'}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="flex-shrink-0 text-xs font-bold px-2 py-1"
                        style={{ 
                          background: valenceToColor(entry.valence_score),
                          color: 'white',
                          fontFamily: "'Courier New', monospace"
                        }}
                      >
                        {entry.valence_score > 0 ? '+' : ''}{entry.valence_score.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Heart size={12} color="#FF8A80" />
            <span 
              className="text-[10px] text-foreground/40"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              your mood data is analyzed by AI and never shared
            </span>
            <Heart size={12} color="#FF8A80" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Stats bar component ===== */
function StatsBar({ stats }: { stats: Stats }) {
  const trendIcon = stats.moodTrend === 'improving' 
    ? <TrendingUp size={18} className="text-green-600" />
    : stats.moodTrend === 'declining'
    ? <TrendingDown size={18} className="text-red-500" />
    : <Minus size={18} className="text-orange-500" />

  const trendLabel = stats.moodTrend === 'improving' ? 'Improving ↑'
    : stats.moodTrend === 'declining' ? 'Declining ↓'
    : 'Stable —'

  const trendColor = stats.moodTrend === 'improving' ? '#4CAF50'
    : stats.moodTrend === 'declining' ? '#F44336'
    : '#FF9800'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total Entries" value={stats.totalEntries.toString()} icon="📝" />
      <StatCard 
        label="Avg. Mood" 
        value={(stats.averageValence > 0 ? '+' : '') + stats.averageValence.toFixed(2)} 
        icon={stats.averageValence > 0 ? '😊' : stats.averageValence > -0.3 ? '😐' : '😢'}
        valueColor={valenceToColor(stats.averageValence)}
      />
      <StatCard 
        label="Top Emotion" 
        value={stats.mostFrequentEmotion} 
        icon={emotionEmoji[stats.mostFrequentEmotion] || '🤔'} 
      />
      <StatCard 
        label="Trend" 
        value={trendLabel} 
        icon={stats.moodTrend === 'improving' ? '📈' : stats.moodTrend === 'declining' ? '📉' : '➡️'}
        valueColor={trendColor}
      />
    </div>
  )
}

function StatCard({ label, value, icon, valueColor }: { 
  label: string; value: string; icon: string; valueColor?: string 
}) {
  return (
    <div className="sketch-box-thin p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p 
        className="text-lg font-bold"
        style={{ fontFamily: "'Courier New', monospace", color: valueColor }}
      >
        {value}
      </p>
      <p 
        className="text-[10px] text-foreground/50 mt-1"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {label}
      </p>
    </div>
  )
}

/* ===== Pure SVG Mood Chart ===== */
function MoodChart({ entries, hoveredPoint, setHoveredPoint }: { 
  entries: Entry[]
  hoveredPoint: number | null
  setHoveredPoint: (i: number | null) => void
}) {
  const width = 700
  const height = 280
  const padding = { top: 30, right: 30, bottom: 40, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Map entries to x,y coords
  const points = entries.map((entry, i) => ({
    x: padding.left + (i / Math.max(entries.length - 1, 1)) * chartW,
    y: padding.top + ((1 - (entry.valence_score + 1) / 2) * chartH),
    entry
  }))

  // Create smooth path
  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map((p, i) => {
        const prev = points[i]
        const cpx = (prev.x + p.x) / 2
        return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`
      }).join(' ')
    : ''

  // Area fill path
  const areaD = pathD + ` L ${points[points.length-1]?.x || 0} ${padding.top + chartH} L ${points[0]?.x || 0} ${padding.top + chartH} Z`

  // Y-axis labels
  const yLabels = [
    { label: 'Very Positive', y: padding.top, val: '+1.0' },
    { label: 'Positive', y: padding.top + chartH * 0.25, val: '+0.5' },
    { label: 'Neutral', y: padding.top + chartH * 0.5, val: '0.0' },
    { label: 'Negative', y: padding.top + chartH * 0.75, val: '-0.5' },
    { label: 'Very Negative', y: padding.top + chartH, val: '-1.0' },
  ]

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full"
        style={{ minWidth: '500px', fontFamily: "'Courier New', monospace" }}
      >
        {/* Grid lines */}
        {yLabels.map((yl, i) => (
          <g key={i}>
            <line 
              x1={padding.left} y1={yl.y} 
              x2={padding.left + chartW} y2={yl.y} 
              stroke="#c9b99a" strokeWidth="1" strokeDasharray={i === 2 ? "none" : "4,4"} 
            />
            <text x={padding.left - 8} y={yl.y + 4} textAnchor="end" fontSize="9" fill="#999">
              {yl.val}
            </text>
          </g>
        ))}

        {/* Neutral line (thicker) */}
        <line 
          x1={padding.left} y1={padding.top + chartH * 0.5} 
          x2={padding.left + chartW} y2={padding.top + chartH * 0.5} 
          stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6,4"
          opacity={0.3}
        />

        {/* Area fill */}
        {points.length > 1 && (
          <path d={areaD} fill="url(#moodGradient)" opacity="0.3" />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FF9800" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F44336" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Line */}
        {points.length > 1 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x} cy={p.y} r={hoveredPoint === i ? 7 : 4}
              fill={valenceToColor(p.entry.valence_score)}
              stroke="#1a1a1a"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* Tooltip on hover */}
            {hoveredPoint === i && (
              <g>
                <rect
                  x={Math.min(p.x - 70, width - 155)}
                  y={p.y - 55}
                  width={140}
                  height={42}
                  fill="var(--color-cream)"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  rx="0"
                />
                <text 
                  x={Math.min(p.x, width - 85)} 
                  y={p.y - 38} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill="#1a1a1a"
                >
                  {emotionEmoji[p.entry.dominant_emotion] || ''} {p.entry.dominant_emotion}
                </text>
                <text 
                  x={Math.min(p.x, width - 85)} 
                  y={p.y - 22} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="#666"
                >
                  {new Date(p.entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {p.entry.valence_score > 0 ? '+' : ''}{p.entry.valence_score.toFixed(2)}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* X-axis date labels (show a few) */}
        {points.filter((_, i) => 
          i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)
        ).map((p, i) => (
          <text 
            key={i}
            x={p.x} 
            y={padding.top + chartH + 20} 
            textAnchor="middle" 
            fontSize="9" 
            fill="#999"
          >
            {new Date(p.entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        ))}
      </svg>
    </div>
  )
}

/* ===== Emotion Breakdown bars ===== */
function EmotionBreakdown({ emotionCounts, total }: { emotionCounts: Record<string, number>; total: number }) {
  const sorted = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)
  const maxCount = sorted.length > 0 ? sorted[0][1] : 1

  return (
    <div className="space-y-3">
      {sorted.map(([emotion, count]) => {
        const pct = Math.round((count / total) * 100)
        const barWidth = (count / maxCount) * 100
        return (
          <div key={emotion} className="flex items-center gap-3">
            <div 
              className="w-8 text-center text-lg flex-shrink-0"
            >
              {emotionEmoji[emotion] || '🤔'}
            </div>
            <div 
              className="w-20 text-xs font-bold flex-shrink-0"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {emotion}
            </div>
            <div className="flex-1 h-5 bg-white border-2 border-[#1a1a1a] relative overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${barWidth}%`, 
                  background: '#1a1a1a',
                }}
              />
            </div>
            <div 
              className="w-16 text-right text-xs"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {count}× ({pct}%)
            </div>
          </div>
        )
      })}
    </div>
  )
}
