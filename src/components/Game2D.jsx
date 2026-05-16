import { useRef, useEffect, useState, useCallback } from 'react'
import { ZONES } from '../data/portfolio'

// ── Constants ──────────────────────────────────────────────────
const WORLD_WIDTH = 4400
const GROUND_RATIO = 0.74
const PLAYER_SPEED = 10
const INTERACT_DIST = 110
const GRAVITY = 0.55
const JUMP_FORCE = 13
const FINISH_X = 4050

const ZONE_X = { about: 700, skills: 1500, projects: 2300, contact: 3200 }
const ZONES_2D = ZONES.map(z => ({ ...z, worldX: ZONE_X[z.id] }))

const TREES = [160, 430, 950, 1180, 1850, 2050, 2580, 2820, 3650, 3900, 4150]
const BUSHES = [310, 575, 1060, 1330, 2160, 2450, 2770, 3120, 3430, 4050]
const MOUNTAINS = [400, 1100, 1900, 2700, 3500]

// h = height above ground (px)
const PLATFORMS = [
  { x: 340,  w: 110, h: 85  },
  { x: 490,  w: 90,  h: 140 },
  { x: 820,  w: 120, h: 90  },
  { x: 975,  w: 80,  h: 55  },
  { x: 1100, w: 100, h: 110 },
  { x: 1260, w: 85,  h: 150 },
  { x: 1620, w: 110, h: 80  },
  { x: 1790, w: 85,  h: 120 },
  { x: 1960, w: 120, h: 65  },
  { x: 2110, w: 85,  h: 135 },
  { x: 2430, w: 110, h: 90  },
  { x: 2580, w: 80,  h: 55  },
  { x: 2760, w: 110, h: 125 },
  { x: 2960, w: 85,  h: 80  },
  { x: 3360, w: 110, h: 100 },
  { x: 3520, w: 85,  h: 65  },
]

// y = height above ground where coin floats
const COINS_DATA = [
  // Early world
  { x: 290,  y: 0   },
  { x: 370,  y: 90  },  // platform 340 h:85
  { x: 510,  y: 148 },  // platform 490 h:140
  // Around About (700)
  { x: 640,  y: 0   },
  { x: 700,  y: 0   },
  { x: 760,  y: 0   },
  { x: 845,  y: 96  },  // platform 820 h:90
  { x: 995,  y: 62  },  // platform 975 h:55
  // Before Skills
  { x: 1120, y: 118 },  // platform 1100 h:110
  { x: 1285, y: 158 },  // platform 1260 h:150
  // Around Skills (1500)
  { x: 1440, y: 0   },
  { x: 1500, y: 0   },
  { x: 1560, y: 0   },
  { x: 1655, y: 87  },  // platform 1620 h:80
  // Before Projects
  { x: 1825, y: 128 },  // platform 1790 h:120
  { x: 1980, y: 72  },  // platform 1960 h:65
  { x: 2135, y: 143 },  // platform 2110 h:135
  // Around Projects (2300)
  { x: 2240, y: 0   },
  { x: 2300, y: 0   },
  { x: 2360, y: 0   },
  { x: 2458, y: 97  },  // platform 2430 h:90
  // Before Contact
  { x: 2603, y: 62  },  // platform 2580 h:55
  { x: 2793, y: 133 },  // platform 2760 h:125
  { x: 2983, y: 87  },  // platform 2960 h:80
  // Around Contact (3200)
  { x: 3140, y: 0   },
  { x: 3200, y: 0   },
  { x: 3260, y: 0   },
  { x: 3383, y: 108 },  // platform 3360 h:100
  // Final stretch
  { x: 3543, y: 72  },  // platform 3520 h:65
  { x: 3760, y: 0   },
]

// ── Drawing helpers ────────────────────────────────────────────

function drawSky(ctx, w, h, skyImg) {
  if (skyImg) {
    ctx.drawImage(skyImg, 0, 0, w, h)
    return
  }
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0,   '#5BBDE8')
  g.addColorStop(0.5, '#89D4F5')
  g.addColorStop(1,   '#C8EDFF')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawSun(ctx, w) {
  const sx = w - 90, sy = 72, sr = 36
  // Outer dreamy glow
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3.2)
  glow.addColorStop(0,   'rgba(255,240,100,0.55)')
  glow.addColorStop(0.4, 'rgba(255,210,60,0.18)')
  glow.addColorStop(1,   'rgba(255,200,50,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(sx, sy, sr * 3.2, 0, Math.PI * 2)
  ctx.fill()
  // Sun body
  ctx.fillStyle = '#FFE234'
  ctx.beginPath()
  ctx.arc(sx, sy, sr, 0, Math.PI * 2)
  ctx.fill()
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.beginPath()
  ctx.arc(sx - 10, sy - 12, sr * 0.36, 0, Math.PI * 2)
  ctx.fill()
}

function drawMountains(ctx, cX, groundY, w) {
  // Back layer — soft lavender
  const back = [
    { wx: 300,  h: 165 }, { wx: 950,  h: 205 }, { wx: 1600, h: 175 },
    { wx: 2250, h: 215 }, { wx: 2900, h: 185 }, { wx: 3600, h: 200 },
  ]
  for (const m of back) {
    const px = m.wx - cX * 0.22
    if (px < -280 || px > w + 280) continue
    const g = ctx.createLinearGradient(px, groundY - m.h, px, groundY)
    g.addColorStop(0, '#C8A8EC')
    g.addColorStop(1, '#DBC4F4')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(px - 250, groundY)
    ctx.lineTo(px - 38, groundY - m.h * 0.58)
    ctx.lineTo(px, groundY - m.h)
    ctx.lineTo(px + 38, groundY - m.h * 0.58)
    ctx.lineTo(px + 250, groundY)
    ctx.closePath()
    ctx.fill()
    // Snow cap
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.beginPath()
    ctx.moveTo(px - 32, groundY - m.h + 48)
    ctx.lineTo(px, groundY - m.h)
    ctx.lineTo(px + 32, groundY - m.h + 48)
    ctx.closePath()
    ctx.fill()
  }
  // Front layer — slightly deeper pink
  const front = [
    { wx: 620,  h: 125 }, { wx: 1280, h: 145 }, { wx: 1950, h: 115 },
    { wx: 2600, h: 135 }, { wx: 3250, h: 128 }, { wx: 3900, h: 118 },
  ]
  for (const m of front) {
    const px = m.wx - cX * 0.38
    if (px < -210 || px > w + 210) continue
    const g = ctx.createLinearGradient(px, groundY - m.h, px, groundY)
    g.addColorStop(0, '#B090D8')
    g.addColorStop(1, '#C8AAEC')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(px - 195, groundY)
    ctx.lineTo(px, groundY - m.h)
    ctx.lineTo(px + 195, groundY)
    ctx.closePath()
    ctx.fill()
  }
}

function drawClouds(ctx, cX, w, t) {
  const clouds = [
    { wx: 220,  y: 68,  s: 1.3 }, { wx: 800,  y: 50,  s: 1.0 },
    { wx: 1400, y: 88,  s: 1.5 }, { wx: 1950, y: 58,  s: 1.1 },
    { wx: 2550, y: 72,  s: 1.4 }, { wx: 3100, y: 52,  s: 1.0 },
    { wx: 3750, y: 80,  s: 1.2 },
  ]
  for (const c of clouds) {
    const px = c.wx - cX * 0.48
    if (px < -300 || px > w + 300) continue
    const drift = Math.sin(t * 0.00022 + c.wx) * 10
    drawCartoonCloud(ctx, px + drift, c.y, c.s)
  }
}

function drawCartoonCloud(ctx, x, y, s) {
  // Shadow
  ctx.fillStyle = 'rgba(160,210,240,0.28)'
  ctx.beginPath()
  ctx.arc(x + 4,        y + 9,        34 * s, 0, Math.PI * 2)
  ctx.arc(x + 34*s + 4, y - 6*s + 9,  26 * s, 0, Math.PI * 2)
  ctx.arc(x + 62*s + 4, y + 9,        30 * s, 0, Math.PI * 2)
  ctx.arc(x + 31*s + 4, y + 16*s + 9, 22 * s, 0, Math.PI * 2)
  ctx.fill()
  // Body
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(x,        y,        34 * s, 0, Math.PI * 2)
  ctx.arc(x + 34*s, y - 6*s,  26 * s, 0, Math.PI * 2)
  ctx.arc(x + 62*s, y,        30 * s, 0, Math.PI * 2)
  ctx.arc(x + 31*s, y + 16*s, 22 * s, 0, Math.PI * 2)
  ctx.fill()
  // Highlight shimmer
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.arc(x + 9*s, y - 9*s, 15 * s, 0, Math.PI * 2)
  ctx.fill()
}

function drawGround(ctx, cX, groundY, w, h) {
  // Soil
  const sg = ctx.createLinearGradient(0, groundY, 0, h)
  sg.addColorStop(0, '#C8873C')
  sg.addColorStop(1, '#8C5828')
  ctx.fillStyle = sg
  ctx.fillRect(0, groundY, w, h - groundY)

  // Grass base
  ctx.fillStyle = '#5DC85D'
  ctx.fillRect(0, groundY, w, 18)
  ctx.fillStyle = '#72DC72'
  ctx.fillRect(0, groundY, w, 8)

  // Grass tufts
  ctx.fillStyle = '#48AA48'
  for (let wx = (cX % 30); wx < w; wx += 30) {
    ctx.fillRect(wx, groundY + 6, 8, 5)
    ctx.fillRect(wx + 18, groundY + 8, 5, 4)
  }

  // Soil pebbles (rounded)
  ctx.fillStyle = '#B87840'
  for (let wx = ((cX * 0.7) % 52) - 52; wx < w; wx += 52) {
    ctx.beginPath()
    ctx.ellipse(wx, groundY + 30, 5, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(wx + 28, groundY + 50, 4, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawTrees(ctx, cX, groundY, w) {
  for (const tx of TREES) {
    const px = tx - cX
    if (px < -70 || px > w + 70) continue
    // Trunk
    ctx.fillStyle = '#8B5E3C'
    ctx.fillRect(px - 6, groundY - 56, 12, 42)
    ctx.fillStyle = '#6B3E1C'
    ctx.fillRect(px + 2, groundY - 56, 4, 42)
    // Leaves
    ctx.fillStyle = '#3DB83D'
    ctx.beginPath()
    ctx.arc(px, groundY - 78, 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#52CC52'
    ctx.beginPath()
    ctx.arc(px - 15, groundY - 65, 22, 0, Math.PI * 2)
    ctx.arc(px + 15, groundY - 65, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#66DD66'
    ctx.beginPath()
    ctx.arc(px, groundY - 86, 18, 0, Math.PI * 2)
    ctx.fill()
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.beginPath()
    ctx.arc(px - 9, groundY - 90, 9, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBushes(ctx, cX, groundY, w) {
  for (const bx of BUSHES) {
    const px = bx - cX
    if (px < -60 || px > w + 60) continue
    ctx.fillStyle = '#3DB83D'
    ctx.beginPath()
    ctx.arc(px - 16, groundY - 12, 18, 0, Math.PI * 2)
    ctx.arc(px + 8,  groundY - 10, 20, 0, Math.PI * 2)
    ctx.arc(px - 4,  groundY - 18, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#55CC55'
    ctx.beginPath()
    ctx.arc(px + 6, groundY - 16, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.beginPath()
    ctx.arc(px - 10, groundY - 20, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPlatforms(ctx, cX, groundY, w) {
  for (const p of PLATFORMS) {
    const px = p.x - cX
    if (px > w + 10 || px + p.w < -10) continue
    const py = groundY - p.h

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fillRect(px - 2, py + 22, p.w + 4, 10)

    // Side depth
    ctx.fillStyle = '#5C3310'
    ctx.fillRect(px - 4, py + 4, 4, 18)

    // Main body
    ctx.fillStyle = '#D4873A'
    ctx.fillRect(px, py, p.w, 20)

    // Top highlight
    ctx.fillStyle = '#F2A558'
    ctx.fillRect(px, py, p.w, 6)

    // Left highlight
    ctx.fillStyle = '#E09848'
    ctx.fillRect(px, py, 4, 20)

    // Brick seams
    ctx.fillStyle = '#5C3310'
    ctx.fillRect(px, py + 10, p.w, 2)
    const bw = 32
    for (let bx = px + bw / 2; bx < px + p.w; bx += bw) {
      ctx.fillRect(bx, py, 2, 10)
    }
    for (let bx = px; bx < px + p.w; bx += bw) {
      if (bx > px) ctx.fillRect(bx, py + 12, 2, 8)
    }
  }
}

function drawStartSign(ctx, cX, groundY) {
  const px = 200 - cX
  ctx.fillStyle = '#5d3a1a'
  ctx.fillRect(px - 3, groundY - 80, 6, 66)
  ctx.fillStyle = '#d4a84b'
  ctx.strokeStyle = '#8B6914'
  ctx.lineWidth = 2
  ctx.fillRect(px - 45, groundY - 108, 90, 32)
  ctx.strokeRect(px - 45, groundY - 108, 90, 32)
  ctx.font = 'bold 11px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#3d2200'
  ctx.fillText('START →', px, groundY - 92)
}

function drawMonk(ctx, zone, cX, groundY, w, t, isNearby) {
  const wx = zone.worldX - cX
  if (wx < -160 || wx > w + 160) return

  const color = zone.color
  const bob = Math.sin(t * 0.0018 + zone.worldX * 0.001) * 3
  const by = groundY + bob

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  ctx.beginPath()
  ctx.ellipse(wx, groundY + 5, 28, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── Staff (behind body) ──
  ctx.fillStyle = '#7a5030'
  ctx.fillRect(wx + 22, by - 148, 7, 122)
  // Staff orb
  if (isNearby) { ctx.shadowColor = color; ctx.shadowBlur = 18 }
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(wx + 25, by - 152, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(wx + 20, by - 157, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // ── Robe ──
  ctx.fillStyle = color + 'dd'
  ctx.beginPath()
  ctx.moveTo(wx - 22, by)
  ctx.lineTo(wx + 18, by)
  ctx.lineTo(wx + 13, by - 76)
  ctx.lineTo(wx - 14, by - 76)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.stroke()
  // Robe folds
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(wx - 4, by); ctx.lineTo(wx - 3, by - 76)
  ctx.moveTo(wx + 7, by); ctx.lineTo(wx + 6, by - 76)
  ctx.stroke()
  // Sash
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillRect(wx - 14, by - 50, 32, 7)

  // ── Hands ──
  ctx.fillStyle = '#F5C07A'
  ctx.beginPath()
  ctx.arc(wx - 20, by - 40, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(wx + 14, by - 42, 8, 0, Math.PI * 2)
  ctx.fill()

  // ── Neck ──
  ctx.fillStyle = '#F5C07A'
  ctx.fillRect(wx - 7, by - 90, 14, 16)

  // ── Head ──
  ctx.fillStyle = '#F5C07A'
  ctx.beginPath()
  ctx.arc(wx, by - 103, 21, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // ── Turban ──
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(wx, by - 110, 21, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(wx - 22, by - 112, 44, 10)
  // Turban stripe
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(wx - 22, by - 110, 44, 4)
  // Turban gem
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(wx, by - 118, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(wx, by - 118, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // ── Eyes ──
  if (isNearby) {
    ctx.strokeStyle = '#3a2a1a'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(wx - 8, by - 105, 4.5, Math.PI + 0.4, -0.4)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(wx + 8, by - 105, 4.5, Math.PI + 0.4, -0.4)
    ctx.stroke()
  } else {
    ctx.fillStyle = '#3a2a1a'
    ctx.beginPath()
    ctx.arc(wx - 8, by - 105, 3, 0, Math.PI * 2)
    ctx.arc(wx + 8, by - 105, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(wx - 7, by - 107, 1, 0, Math.PI * 2)
    ctx.arc(wx + 9, by - 107, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Smile ──
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.arc(wx, by - 97, 7, 0.25, Math.PI - 0.25)
  ctx.stroke()

  // ── Halo when nearby ──
  if (isNearby) {
    const ha = 0.22 + 0.18 * Math.abs(Math.sin(t * 0.003))
    ctx.globalAlpha = ha
    ctx.strokeStyle = color
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.arc(wx, by - 103, 34, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(wx, by - 103, 44, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // ── Floating icon above ──
  const iconBob = Math.sin(t * 0.002 + zone.worldX * 0.005) * 5
  ctx.font = '20px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(zone.icon, wx, by - 170 + iconBob)

  // ── Name label ──
  ctx.font = `${isNearby ? 'bold ' : ''}12px "Segoe UI", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = isNearby ? '#111' : '#555'
  ctx.fillText(zone.name, wx, by - 156)

  // ── "Walk closer" hint when not nearby ──
  if (!isNearby) {
    const d = Math.abs(zone.worldX - (wx + cX))  // approximation
    // small dots indicating approach
  }
}

function drawPlayer(ctx, player, cX, groundY, t) {
  const sx = player.x - cX
  const screenY = groundY - player.y   // feet screen position
  const dir = player.facing
  const walking = player.moving && player.onGround
  const wc = walking ? Math.sin(t * 0.014) : 0

  const SCALE = 1.9
  ctx.save()
  ctx.translate(sx, screenY)
  ctx.scale(SCALE, SCALE)

  // Shadow (only when above ground)
  if (player.y > 2) {
    ctx.globalAlpha = Math.max(0.05, 0.22 - player.y * 0.001)
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(0, -1, 15, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Left leg
  ctx.save()
  ctx.translate(-7, -16)
  ctx.rotate((wc * 18 * Math.PI) / 180)
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(-5, 0, 11, 18)
  ctx.fillStyle = '#7c4b2a'
  ctx.fillRect(-6, 16, 12, 6)
  ctx.restore()

  // Right leg
  ctx.save()
  ctx.translate(7, -16)
  ctx.rotate((-wc * 18 * Math.PI) / 180)
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(-6, 0, 11, 18)
  ctx.fillStyle = '#7c4b2a'
  ctx.fillRect(-5, 16, 12, 6)
  ctx.restore()

  // Body
  ctx.fillStyle = '#dc2626'
  ctx.fillRect(-12, -38, 24, 22)
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(-8, -32, 16, 14)

  // Left arm
  ctx.save()
  ctx.translate(-12, -34)
  ctx.rotate((-wc * 22 * Math.PI) / 180)
  ctx.fillStyle = '#f5c07a'
  ctx.fillRect(-5, 0, 9, 16)
  ctx.restore()

  // Right arm
  ctx.save()
  ctx.translate(12, -34)
  ctx.rotate((wc * 22 * Math.PI) / 180)
  ctx.fillStyle = '#f5c07a'
  ctx.fillRect(-4, 0, 9, 16)
  ctx.restore()

  // Head
  ctx.fillStyle = '#f5c07a'
  ctx.beginPath()
  ctx.arc(0, -48, 13, 0, Math.PI * 2)
  ctx.fill()

  // Cap
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.arc(0, -54, 13, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(-14, -52, 28, 6)

  // Eye
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(dir * 5, -48, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Mustache
  ctx.fillStyle = '#4a2c00'
  ctx.fillRect(dir * 2 - 6, -44, 14, 4)

  ctx.restore()
}

function drawCollectibleCoin(ctx, coin, cX, groundY, w, t) {
  if (coin.collected) return
  const sx = coin.x - cX
  if (sx < -40 || sx > w + 40) return

  const bob = Math.sin(t * 0.003 + coin.x * 0.01) * 5
  const cy = groundY - coin.y - 22 + bob

  // Spinning: x-radius oscillates (coin face vs edge)
  const spin = Math.abs(Math.cos(t * 0.006 + coin.x * 0.008))
  const rx = Math.max(1, 10 * spin)
  const ry = 13

  ctx.save()
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 18

  // Outer rim (darker gold)
  ctx.fillStyle = '#FFB800'
  ctx.beginPath()
  ctx.ellipse(sx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Main face
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.ellipse(sx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0

  // Inner ring detail
  if (rx > 4) {
    ctx.strokeStyle = '#CC8800'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.ellipse(sx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Shine streak
  if (rx > 5) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.beginPath()
    ctx.ellipse(sx - rx * 0.28, cy - ry * 0.26, rx * 0.32, ry * 0.26, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawFinishFlag(ctx, cX, groundY, w, t) {
  const px = FINISH_X - cX
  if (px < -120 || px > w + 120) return

  // Pole
  ctx.fillStyle = '#aaa'
  ctx.fillRect(px - 3, groundY - 210, 6, 210)

  // Checkered flag
  const fw = 80, fh = 50, cols = 8, rows = 5
  const cw = fw / cols, ch = fh / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111111'
      ctx.fillRect(px + 3 + c * cw, groundY - 210 + r * ch, cw, ch)
    }
  }

  // FINISH label
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 0.003))
  ctx.globalAlpha = pulse
  ctx.font = 'bold 14px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = '#ffd700'
  ctx.fillText('🏁 FINISH', px + fw / 2 + 3, groundY - 216)
  ctx.globalAlpha = 1
}

function drawHUD(ctx, w, h, playerX, score) {
  // Title bar
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillRect(w / 2 - 130, 12, 260, 42)
  ctx.strokeStyle = 'rgba(100,180,255,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(w / 2 - 130, 12, 260, 42)

  ctx.font = 'bold 15px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#1a4a7a'
  ctx.fillText('MUKUL VASHISHT', w / 2, 20)

  ctx.font = '9px "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(30,80,140,0.7)'
  ctx.fillText('← → MOVE  ·  ↑ / W JUMP  ·  E EXPLORE', w / 2, 40)

  // Score box top-left
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillRect(14, 14, 120, 38)
  ctx.strokeStyle = 'rgba(200,150,0,0.5)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, 120, 38)
  ctx.font = '9px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#8B6000'
  ctx.fillText('SCORE', 22, 20)
  ctx.font = 'bold 20px "Segoe UI", sans-serif'
  ctx.fillStyle = '#CC8800'
  ctx.fillText(score, 22, 30)

  const mw = 160, mh = 12, mx = w - mw - 14, my = 14
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillRect(mx, my, mw, mh)
  ctx.strokeStyle = 'rgba(100,180,255,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(mx, my, mw, mh)
  for (const z of ZONES_2D) {
    const dx = mx + (z.worldX / WORLD_WIDTH) * mw
    ctx.fillStyle = z.color
    ctx.fillRect(dx - 3, my + 2, 7, mh - 4)
  }
  const pdx = mx + (playerX / WORLD_WIDTH) * mw
  ctx.fillStyle = '#1a4a7a'
  ctx.fillRect(pdx - 2, my, 4, mh)
  ctx.font = '8px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(30,80,140,0.55)'
  ctx.fillText('MAP', mx, my - 10)
}

// ── Main component ─────────────────────────────────────────────

export default function Game2D({ onNearbyChange, modalOpen, paused, score, onGameEnd, gameFinished, onAddScore }) {
  const canvasRef = useRef(null)
  const [nearbyZone, setNearbyZone] = useState(null)
  const stateRef = useRef(null)
  const nearbyRef = useRef(null)
  const modalRef = useRef(modalOpen)
  const pausedRef = useRef(paused)
  const finishedRef = useRef(gameFinished)
  const scoreRef = useRef(score)
  const endFiredRef = useRef(false)
  const starsRef = useRef(COINS_DATA.map(s => ({ ...s, collected: false })))
  const skyImgRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => { skyImgRef.current = img }
    img.onerror = () => { skyImgRef.current = null }   // falls back to gradient
    img.src = '/images/sky.png'
  }, [])

  useEffect(() => { modalRef.current = modalOpen }, [modalOpen])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { finishedRef.current = gameFinished }, [gameFinished])
  useEffect(() => { scoreRef.current = score }, [score])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const state = {
      player: { x: 200, y: 0, vy: 0, onGround: true, facing: 1, moving: false },
      cameraX: 0,
      keys: {},
      mleft: false,
      mright: false,
      mjump: false,
      jumpQueued: false,
    }
    stateRef.current = state

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    function onKeyDown(e) {
      const wasJump = !state.keys[e.code] &&
        (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space')
      state.keys[e.code] = true

      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) {
        e.preventDefault()
      }
      if (wasJump && state.player.onGround && !pausedRef.current) {
        state.jumpQueued = true
      }
    }
    function onKeyUp(e) { delete state.keys[e.code] }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)


    let animId
    function loop(t) {
      const w = canvas.width
      const h = canvas.height
      const groundY = Math.floor(h * GROUND_RATIO)
      const p = state.player

      if (!pausedRef.current && !finishedRef.current) {
        // Horizontal movement
        const goL = state.keys['ArrowLeft'] || state.keys['KeyA'] || state.mleft
        const goR = state.keys['ArrowRight'] || state.keys['KeyD'] || state.mright
        if (goL) { p.x -= PLAYER_SPEED; p.facing = -1 }
        if (goR) { p.x += PLAYER_SPEED; p.facing = 1 }
        p.moving = goL || goR
        p.x = Math.max(40, Math.min(WORLD_WIDTH - 40, p.x))

        // Jump
        if ((state.jumpQueued || state.mjump) && p.onGround) {
          p.vy = JUMP_FORCE
          p.onGround = false
        }
        state.jumpQueued = false

        // Gravity
        if (!p.onGround) p.vy -= GRAVITY
        const prevY = p.y
        p.y += p.vy

        // Ground collision
        p.onGround = false
        if (p.y <= 0) {
          p.y = 0
          p.vy = 0
          p.onGround = true
        }

        // Platform collision (land from above only)
        const halfW = 14
        for (const plat of PLATFORMS) {
          if (p.x + halfW > plat.x && p.x - halfW < plat.x + plat.w) {
            if (prevY >= plat.h && p.y < plat.h && p.vy <= 0) {
              p.y = plat.h
              p.vy = 0
              p.onGround = true
            } else if (p.onGround === false && Math.abs(p.y - plat.h) < 2 && p.vy <= 0) {
              p.y = plat.h
              p.vy = 0
              p.onGround = true
            }
          }
        }
      } else {
        p.moving = false
      }

      // Camera
      state.cameraX = Math.max(0, Math.min(WORLD_WIDTH - w, p.x - w / 2))
      const cX = state.cameraX

      // Star collection
      for (const star of starsRef.current) {
        if (!star.collected && Math.abs(p.x - star.x) < 28 && Math.abs(p.y - star.y) < 30) {
          star.collected = true
          onAddScore?.(10)
        }
      }

      // Finish trigger
      if (!endFiredRef.current && p.x >= FINISH_X) {
        endFiredRef.current = true
        onGameEnd?.()
      }

      // Nearby zone (only at ground level or near ground)
      const nearby = p.y < 60
        ? (ZONES_2D.find(z => Math.abs(z.worldX - p.x) < INTERACT_DIST) ?? null)
        : null
      if (nearby?.id !== nearbyRef.current?.id) {
        nearbyRef.current = nearby
        setNearbyZone(nearby)
        onNearbyChange?.(nearby)
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h)
      drawSky(ctx, w, h, skyImgRef.current)
      drawSun(ctx, w)
      drawMountains(ctx, cX, groundY, w)
      drawClouds(ctx, cX, w, t)
      drawGround(ctx, cX, groundY, w, h)
      drawTrees(ctx, cX, groundY, w)
      drawBushes(ctx, cX, groundY, w)
      drawPlatforms(ctx, cX, groundY, w)
      drawStartSign(ctx, cX, groundY)
      drawFinishFlag(ctx, cX, groundY, w, t)
      for (const coin of starsRef.current) {
        drawCollectibleCoin(ctx, coin, cX, groundY, w, t)
      }
      for (const zone of ZONES_2D) {
        drawMonk(ctx, zone, cX, groundY, w, t, nearby?.id === zone.id)
      }
      drawPlayer(ctx, p, cX, groundY, t)
      if (!pausedRef.current) drawHUD(ctx, w, h, p.x, scoreRef.current)

      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {!paused && (
        <div className="mobile-controls">
          <button
            className="mobile-btn"
            onPointerDown={() => stateRef.current && (stateRef.current.mleft = true)}
            onPointerUp={() => stateRef.current && (stateRef.current.mleft = false)}
            onPointerLeave={() => stateRef.current && (stateRef.current.mleft = false)}
            onContextMenu={e => e.preventDefault()}
            aria-label="Move Left"
          >◀</button>

          <div className="mobile-center" />

          <div className="mobile-right-cluster">
            <button
              className="mobile-btn mobile-jump-btn"
              onPointerDown={() => {
                if (stateRef.current?.player.onGround) stateRef.current.mjump = true
              }}
              onPointerUp={() => stateRef.current && (stateRef.current.mjump = false)}
              onPointerLeave={() => stateRef.current && (stateRef.current.mjump = false)}
              onContextMenu={e => e.preventDefault()}
              aria-label="Jump"
            >▲</button>
            <button
              className="mobile-btn"
              onPointerDown={() => stateRef.current && (stateRef.current.mright = true)}
              onPointerUp={() => stateRef.current && (stateRef.current.mright = false)}
              onPointerLeave={() => stateRef.current && (stateRef.current.mright = false)}
              onContextMenu={e => e.preventDefault()}
              aria-label="Move Right"
            >▶</button>
          </div>
        </div>
      )}
    </>
  )
}
