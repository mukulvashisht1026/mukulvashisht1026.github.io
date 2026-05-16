export default function HUD({ nearbyZone, panelOpen }) {
  return (
    <div className="hud">
      {/* Zone compass labels */}
      <div className="hud-compass-labels">
        <div className="compass-label north" style={{ color: '#66bb6a' }}>▲ About Me</div>
        <div className="compass-label east" style={{ color: '#42a5f5' }}>▶ Skills</div>
        <div className="compass-label south" style={{ color: '#ab47bc' }}>▼ Projects</div>
        <div className="compass-label west" style={{ color: '#ff7043' }}>◀ Contact</div>
      </div>

      {/* Controls */}
      <div className="hud-controls">
        <div className="controls-title">Controls</div>
        <div className="key-row">
          <span className="key">W</span>
          <span className="key">A</span>
          <span className="key">S</span>
          <span className="key">D</span>
          <span className="key-label">Move</span>
        </div>
        <div className="key-row">
          <span className="key">E</span>
          <span className="key-label">Interact</span>
        </div>
        <div className="key-row">
          <span className="key">ESC</span>
          <span className="key-label">Close</span>
        </div>
      </div>

      {/* Nearby zone prompt */}
      {nearbyZone && !panelOpen && (
        <div
          className="hud-nearby"
          style={{ '--zone-color': nearbyZone.color, borderColor: nearbyZone.color }}
        >
          <span className="nearby-icon">{nearbyZone.icon}</span>
          Press <kbd>E</kbd> to explore <strong style={{ color: nearbyZone.color }}>{nearbyZone.name}</strong>
        </div>
      )}

      {/* Title */}
      <div className="hud-title">
        <span className="title-name">Mukul Vashisht</span>
        <span className="title-sub">3D Portfolio — Walk to explore</span>
      </div>
    </div>
  )
}
