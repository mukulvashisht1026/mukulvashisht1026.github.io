import { useState, useCallback, useEffect, useRef } from 'react'
import Game2D from './components/Game2D'
import SpeechBubble from './components/SpeechBubble'
import { ZONES } from './data/portfolio'

const ZONE_POINTS = { about: 100, skills: 150, projects: 200, contact: 100 }
const STAR_COUNT = 30
const MAX_SCORE = 550 + STAR_COUNT * 10  // 850

const RANKS = [
  { min: MAX_SCORE, label: 'S', color: '#ffd700' },
  { min: 650,       label: 'A', color: '#42a5f5' },
  { min: 400,       label: 'B', color: '#ab47bc' },
  { min: 0,         label: 'C', color: '#ff7043' },
]

function getRank(score) {
  return RANKS.find(r => score >= r.min) ?? RANKS[RANKS.length - 1]
}

function MenuScreen({ onPlay }) {
  return (
    <div className="menu-overlay">
      <div className="menu-box">
        <div className="menu-pixel-title">MUKUL</div>
        <div className="menu-name">VASHISHT</div>
        <div className="menu-tagline">Interactive Portfolio</div>

        <div className="menu-controls-grid">
          <div className="menu-key-row"><kbd>← →</kbd><span>Move</span></div>
          <div className="menu-key-row"><kbd>↑</kbd> / <kbd>W</kbd><span>Jump</span></div>
          <div className="menu-key-row"><span className="menu-hint-inline">Walk near a monk to learn more</span></div>
        </div>

        <button className="menu-play-btn" onClick={onPlay}>
          <span>▶</span> PLAY
        </button>
        <div className="menu-hint">Visit all 4 monks · collect coins · reach the finish flag</div>
        <a className="menu-back-link" href="/">← Back to Portfolio</a>
      </div>
    </div>
  )
}

function CreditsScreen({ score, onReplay }) {
  const contact = ZONES.find(z => z.id === 'contact').content
  const rank = getRank(score)

  return (
    <div className="credits-overlay">
      <div className="credits-box">
        <div className="credits-congrats">🎉 GAME COMPLETE!</div>

        <div className="credits-score-row">
          <span className="credits-score-label">FINAL SCORE</span>
          <span className="credits-score-value">{score}<span className="credits-max">/{MAX_SCORE}</span></span>
          <span className="credits-rank" style={{ color: rank.color }}>RANK {rank.label}</span>
        </div>

        <div className="credits-divider" />
        <div className="credits-heading">— CREDITS —</div>
        <div className="credits-name">Mukul Vashisht</div>
        <div className="credits-subtitle">Web Developer · ML Enthusiast</div>
        <div className="credits-subtitle">B.Tech CSE — G.B. Pant Govt. Engineering College, Delhi</div>

        <div className="credits-links">
          <a className="credits-link" href={`mailto:${contact.email}`}><span>📧</span>{contact.email}</a>
          <a className="credits-link" href={`tel:${contact.phone}`}><span>📱</span>{contact.phone}</a>
          <a className="credits-link" href={`https://github.com/${contact.github}`} target="_blank" rel="noreferrer">
            <span>🐙</span>github.com/{contact.github}
          </a>
        </div>

        <div className="credits-divider" />
        <div className="credits-thanks">Thanks for playing! 🚀</div>
        <button className="credits-replay-btn" onClick={onReplay}>↺ PLAY AGAIN</button>
        <a className="menu-back-link" href="/">← Back to Portfolio</a>
      </div>
    </div>
  )
}

export default function App() {
  const [resetKey, setResetKey]           = useState(0)
  const [started, setStarted]             = useState(false)
  const [openZone, setOpenZone]           = useState(null)
  const [score, setScore]                 = useState(0)
  const [gameFinished, setGameFinished]   = useState(false)
  const visitedRef = useRef(new Set())

  // Auto-open/close bubble on monk proximity change
  const handleNearbyChange = useCallback(zone => {
    setOpenZone(zone)
    if (zone && !visitedRef.current.has(zone.id)) {
      visitedRef.current.add(zone.id)
      setScore(s => s + (ZONE_POINTS[zone.id] ?? 100))
    }
  }, [])

  const handleClose    = useCallback(() => setOpenZone(null), [])
  const handleGameEnd  = useCallback(() => setGameFinished(true), [])
  const handleAddScore = useCallback(pts => setScore(s => s + pts), [])

  const handleReplay = useCallback(() => {
    setScore(0)
    setGameFinished(false)
    setStarted(false)
    setOpenZone(null)
    visitedRef.current.clear()
    setResetKey(k => k + 1)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if (e.code === 'Escape') setOpenZone(null)
      if (e.code === 'Enter' && !started) setStarted(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started])

  return (
    <div className="game-container">
      <a href="/" className="game-home-btn" title="Back to Portfolio">🏠</a>
      <Game2D
        key={resetKey}
        onNearbyChange={handleNearbyChange}
        modalOpen={!!openZone}
        paused={!started}
        score={score}
        onGameEnd={handleGameEnd}
        gameFinished={gameFinished}
        onAddScore={handleAddScore}
      />
      {!started && !gameFinished && <MenuScreen onPlay={() => setStarted(true)} />}
      {gameFinished && <CreditsScreen score={score} onReplay={handleReplay} />}
      {openZone && <SpeechBubble zone={openZone} onClose={handleClose} />}
    </div>
  )
}
