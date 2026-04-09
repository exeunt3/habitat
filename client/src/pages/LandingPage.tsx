import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Animated background ────────────────────────────────────────────────────────

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let t = 0

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      t += 0.0015
      const w = canvas!.width
      const h = canvas!.height

      ctx.fillStyle = '#05060c'
      ctx.fillRect(0, 0, w, h)

      const blobs = [
        { x: 0.25 + Math.sin(t * 0.5) * 0.15, y: 0.35 + Math.cos(t * 0.4) * 0.12, r: 0.55, color: '8, 18, 48', op: 0.18 },
        { x: 0.72 + Math.cos(t * 0.45) * 0.12, y: 0.65 + Math.sin(t * 0.6) * 0.10, r: 0.42, color: '4, 14, 38', op: 0.14 },
        { x: 0.55 + Math.sin(t * 0.35 + 2) * 0.18, y: 0.18 + Math.cos(t * 0.42) * 0.08, r: 0.35, color: '12, 24, 55', op: 0.12 },
      ]

      for (const b of blobs) {
        const gx = b.x * w, gy = b.y * h, gr = b.r * Math.max(w, h)
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
        grad.addColorStop(0, `rgba(${b.color}, ${b.op})`)
        grad.addColorStop(1, `rgba(${b.color}, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      ctx.fillStyle = 'rgba(180, 200, 255, 1)'
      for (let i = 0; i < 48; i++) {
        const sx = ((i * 137.508 * w) % w)
        const sy = ((i * 97.3 * h) % h)
        ctx.globalAlpha = 0.08 + Math.sin(t * 0.8 + i) * 0.06
        ctx.fillRect(sx, sy, 1, 1)
      }
      ctx.globalAlpha = 1

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

const BLUE      = 'rgba(65,130,255,0.92)'
const BLUE_DIM  = 'rgba(65,130,255,0.18)'
const BLUE_RULE = 'rgba(65,130,255,0.55)'

// Full-width section wrapper + inner centering (Sensoria zone approach)
function Zone({
  children,
  overlay = 'transparent',
  topBorder = false,
  bottomBorder = false,
}: {
  children: React.ReactNode
  overlay?: string
  topBorder?: boolean
  bottomBorder?: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        background: overlay,
        borderTop:    topBorder    ? '1px solid rgba(255,255,255,0.07)' : undefined,
        borderBottom: bottomBorder ? '1px solid rgba(255,255,255,0.07)' : undefined,
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 40px' }}>
        {children}
      </div>
    </div>
  )
}

// Section label with accent mark
function Label({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: BLUE_RULE,
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ display: 'inline-block', width: 28, height: 1, background: BLUE_RULE }} />
      {children}
    </div>
  )
}

const H2: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(36px, 5vw, 56px)',
  fontWeight: 700,
  color: '#dde3f2',
  lineHeight: 1.1,
  letterSpacing: '-0.025em',
  margin: '0 0 24px',
}

const body: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 17,
  lineHeight: 1.72,
  color: 'rgba(158,172,205,0.82)',
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        backgroundImage: 'url(/demo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 38%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay — gradient so image peeks through at the right edge */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, rgba(5,6,12,0.91) 0%, rgba(5,6,12,0.82) 55%, rgba(5,6,12,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* Wordmark — branch icon + logotype */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48, opacity: 0.55 }}>
          <svg width="22" height="20" viewBox="0 0 52 44" fill="none" style={{ flexShrink: 0 }}>
            <path d="M26 44 L26 28" stroke="rgba(65,130,255,1)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M26 28 L12 16" stroke="rgba(65,130,255,1)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M26 28 L40 16" stroke="rgba(65,130,255,1)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 16 L5 8"   stroke="rgba(65,130,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 16 L17 7"  stroke="rgba(65,130,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M40 16 L35 7"  stroke="rgba(65,130,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M40 16 L47 8"  stroke="rgba(65,130,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="5"  cy="7"  r="2.2" fill="rgba(65,130,255,0.9)" />
            <circle cx="17" cy="6"  r="2.2" fill="rgba(65,130,255,0.9)" />
            <circle cx="35" cy="6"  r="2.2" fill="rgba(65,130,255,0.9)" />
            <circle cx="47" cy="7"  r="2.2" fill="rgba(65,130,255,0.9)" />
            <path d="M26 34 L34 24" stroke="rgba(65,130,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <circle cx="35" cy="23" r="1.8" fill="rgba(65,130,255,0.6)" />
          </svg>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c8d4f0',
            }}
          >
            Habitat
          </span>
        </div>

        <h1
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(54px, 9vw, 100px)',
            fontWeight: 700,
            color: '#eaecf5',
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            margin: '0 0 32px',
            maxWidth: 820,
          }}
        >
          The invisible,<br />made ambient.
        </h1>

        <p
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(17px, 2.4vw, 21px)',
            color: 'rgba(150,168,210,0.8)',
            lineHeight: 1.65,
            maxWidth: 560,
            margin: '0 0 56px',
          }}
        >
          Habitat translates qualitative signals into living ecosystems —
          for teams navigating change, and individuals seeking clarity.
          Not a dashboard. A presence.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/demo/reef"
            style={{
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 600,
              padding: '15px 34px',
              borderRadius: 8,
              background: BLUE,
              color: '#fff',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Explore a demo
          </Link>
          <Link
            to="/setup"
            style={{
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 500,
              padding: '15px 34px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.13)',
              color: 'rgba(185,205,245,0.8)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
              e.currentTarget.style.color = '#dde3f2'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'
              e.currentTarget.style.color = 'rgba(185,205,245,0.8)'
            }}
          >
            Set up your deployment
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            opacity: 0.28,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '0.18em', color: '#8899bb' }}>SCROLL</div>
          <div style={{ width: 1, height: 36, background: 'rgba(140,160,210,0.5)' }} />
        </div>
      </section>
      </div>
    </div>
  )
}

// ── What is it ─────────────────────────────────────────────────────────────────

function WhatIsIt() {
  return (
    <Zone overlay="rgba(0,0,0,0.22)" topBorder bottomBorder>
      <section style={{ padding: '110px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px 80px',
            alignItems: 'start',
          }}
        >
          <div>
            <Label>For Organizations</Label>
            <h2 style={{ ...H2, fontSize: 'clamp(28px, 3.8vw, 42px)' }}>
              A read on your team that leaders can feel.
            </h2>
            <p style={{ ...body, marginBottom: 20 }}>
              Habitat collects short, anonymous feedback on a rolling basis.
              The responses don't go into a spreadsheet — they feed a real-time ecosystem.
            </p>
            <p style={body}>
              When the team is thriving, the world is vibrant: coral grows, fish school,
              water runs clear. When stress accumulates, things change — subtly at first,
              then unmistakably. Leaders develop intuition the same way they learn to read weather.
            </p>
          </div>

          <div>
            <Label>For Individuals</Label>
            <h2 style={{ ...H2, fontSize: 'clamp(28px, 3.8vw, 42px)' }}>
              A mirror for your inner landscape.
            </h2>
            <p style={{ ...body, marginBottom: 20 }}>
              Habitat also works as a personal practice. Answer three questions about your
              energy, connection, and clarity — and watch a living environment shift to
              reflect your inner state over time.
            </p>
            <p style={body}>
              No journaling prompts, no graphs to interpret. Just a quiet ambient signal —
              a creek filling with life, or running dry — that makes the invisible
              suddenly perceptible.
            </p>
          </div>
        </div>
      </section>
    </Zone>
  )
}

// ── The Problem ───────────────────────────────────────────────────────────────

function TheProblem() {
  const items = [
    {
      n: '01',
      title: 'Reports nobody reads.',
      body: 'Annual surveys and quarterly check-ins produce data that sits in shared drives. By the time leadership reviews it, the moment has passed.',
    },
    {
      n: '02',
      title: 'Numbers without texture.',
      body: "A score of 6.8 out of 10 means nothing in the gut. It doesn\u2019t convey urgency. It doesn\u2019t help you feel the right thing and act.",
    },
    {
      n: '03',
      title: 'Blind spots, compounding.',
      body: "Problems build quietly \u2014 in teams and in ourselves. By the time they surface, they\u2019ve been running for weeks, sometimes months.",
    },
  ]

  return (
    <Zone>
      <section style={{ padding: '110px 0' }}>
        <Label>The Problem</Label>
        <h2 style={H2}>
          Most wellbeing slips past unnoticed.
        </h2>
        <p style={{ ...body, marginBottom: 64, maxWidth: 580 }}>
          Whether you're leading a team or tending to your own inner life, the challenge is the same:
          experience is continuous, but our tools for understanding it are episodic and abstract.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 2,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.n}
              style={{
                padding: '40px 36px 44px',
                borderLeft: i === 0 ? `1px solid ${BLUE_DIM}` : '1px solid rgba(255,255,255,0.055)',
                borderRight: i === items.length - 1 ? `1px solid rgba(255,255,255,0.055)` : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: 'rgba(65,130,255,0.3)',
                  marginBottom: 28,
                }}
              >
                {item.n}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#d8e0f2',
                  lineHeight: 1.3,
                  letterSpacing: '-0.015em',
                  marginBottom: 16,
                }}
              >
                {item.title}
              </div>
              <div style={{ ...body, fontSize: 15, lineHeight: 1.68 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>
    </Zone>
  )
}

// ── The Evidence ──────────────────────────────────────────────────────────────

function TheEvidence() {
  const refs = [
    {
      quote: 'Frequent, brief check-ins predict team retention and performance better than annual surveys — and the effect size is large.',
      source: 'Harter et al. (2002).',
      journal: 'Journal of Applied Psychology, 87(2), 268–279.',
    },
    {
      quote: 'Ambient displays create shared awareness without requiring active attention, reducing the cognitive cost of staying informed.',
      source: 'Mankoff et al. (2003).',
      journal: 'ACM CHI Conference on Human Factors in Computing Systems.',
    },
    {
      quote: 'Ecological momentary assessment — capturing states as they occur — reveals patterns of wellbeing that retrospective reports consistently miss.',
      source: 'Shiffman, Stone & Hufford (2008).',
      journal: 'Annual Review of Clinical Psychology, 4, 1–32.',
    },
    {
      quote: 'Abstract data presented as natural metaphors is processed faster and retained longer than equivalent numerical dashboards.',
      source: 'Ware, C. (2012).',
      journal: 'Information Visualization: Perception for Design, Morgan Kaufmann.',
    },
    {
      quote: 'Regular reflection on subjective experience — through brief structured check-ins — predicts sustained wellbeing gains over time.',
      source: 'Lyubomirsky & Layous (2013).',
      journal: 'Current Directions in Psychological Science, 22(1), 57–62.',
    },
    {
      quote: 'Psychological safety — the belief that one won\'t be punished for speaking up — is the most important factor in high-performing teams.',
      source: 'Edmondson, A. (1999).',
      journal: 'Administrative Science Quarterly, 44(2), 350–383.',
    },
  ]

  return (
    <Zone overlay="rgba(0,0,0,0.2)" topBorder bottomBorder>
      <section style={{ padding: '110px 0' }}>
        <Label>The Evidence</Label>
        <h2 style={H2}>Built on what the research actually says.</h2>
        <p style={{ ...body, marginBottom: 64, maxWidth: 600 }}>
          Habitat synthesizes decades of organizational psychology, human-computer interaction,
          and personal informatics research — for both the collective and the individual.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {refs.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '32px 30px',
                background: 'rgba(255,255,255,0.018)',
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: 'rgba(205,218,245,0.88)',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  margin: '0 0 14px',
                }}
              >
                "{r.quote}"
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  color: 'rgba(110,135,185,0.6)',
                  margin: 0,
                  lineHeight: 1.5,
                  letterSpacing: '0.01em',
                }}
              >
                {r.source} <em>{r.journal}</em>
              </p>
            </div>
          ))}
        </div>
      </section>
    </Zone>
  )
}

// ── Demo thumbnails ───────────────────────────────────────────────────────────

function ReefThumbnail() {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="reef-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#071830" />
          <stop offset="100%" stopColor="#0a1e3a" />
        </linearGradient>
        <radialGradient id="reef-glow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="rgba(30,90,200,0.28)" />
          <stop offset="100%" stopColor="rgba(5,10,30,0)" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#reef-bg)" />
      <rect width="400" height="240" fill="url(#reef-glow)" />
      <path d="M0,38 Q50,30 100,38 Q150,46 200,38 Q250,30 300,38 Q360,46 400,38 L400,0 L0,0 Z" fill="rgba(15,50,130,0.45)" />
      <path d="M0,42 Q60,34 120,42 Q180,50 240,42 Q300,34 360,42 Q385,46 400,42" stroke="rgba(80,160,255,0.25)" strokeWidth="1.5" fill="none" />
      <polygon points="70,0 90,0 65,240 45,240" fill="rgba(50,110,255,0.055)" />
      <polygon points="190,0 210,0 200,240 180,240" fill="rgba(50,110,255,0.07)" />
      <polygon points="300,0 318,0 330,240 312,240" fill="rgba(50,110,255,0.045)" />
      <ellipse cx="130" cy="95" rx="15" ry="6" fill="rgba(100,185,255,0.72)" />
      <polygon points="145,95 155,89 155,101" fill="rgba(100,185,255,0.72)" />
      <ellipse cx="270" cy="75" rx="12" ry="5" fill="rgba(70,200,230,0.65)" />
      <polygon points="282,75 290,70 290,80" fill="rgba(70,200,230,0.65)" />
      <ellipse cx="330" cy="125" rx="10" ry="4" fill="rgba(90,155,255,0.6)" />
      <polygon points="340,125 347,121 347,129" fill="rgba(90,155,255,0.6)" />
      <ellipse cx="180" cy="140" rx="13" ry="5" fill="rgba(55,130,255,0.55)" />
      <polygon points="193,140 201,136 201,144" fill="rgba(55,130,255,0.55)" />
      <rect x="58" y="180" width="7" height="60" rx="3.5" fill="rgba(50,120,220,0.82)" />
      <path d="M62,190 Q42,165 35,148" stroke="rgba(55,125,225,0.75)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M62,185 Q80,160 88,143" stroke="rgba(55,125,225,0.75)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M62,192 Q62,168 62,150" stroke="rgba(55,125,225,0.7)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="35" cy="146" r="7" fill="rgba(40,100,200,0.55)" />
      <circle cx="88" cy="141" r="6" fill="rgba(40,100,200,0.55)" />
      <circle cx="62" cy="148" r="5" fill="rgba(40,100,200,0.5)" />
      <rect x="196" y="158" width="8" height="82" rx="4" fill="rgba(75,155,255,0.85)" />
      <path d="M200,168 Q178,143 170,125" stroke="rgba(75,155,255,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M200,165 Q222,140 230,122" stroke="rgba(75,155,255,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="170" cy="122" r="7" fill="rgba(50,120,220,0.5)" />
      <circle cx="230" cy="120" r="6" fill="rgba(50,120,220,0.5)" />
      <rect x="322" y="190" width="6" height="50" rx="3" fill="rgba(40,105,200,0.78)" />
      <path d="M325,196 Q305,168 298,150" stroke="rgba(45,110,210,0.72)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M325,194 Q340,162 348,145" stroke="rgba(45,110,210,0.72)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M325,196 Q322,165 324,145" stroke="rgba(45,110,210,0.68)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="0" y="222" width="400" height="18" fill="rgba(12,28,65,0.65)" rx="2" />
      <circle cx="155" cy="168" r="2.5" fill="rgba(130,190,255,0.28)" />
      <circle cx="245" cy="118" r="1.8" fill="rgba(130,190,255,0.22)" />
      <circle cx="90" cy="145" r="1.5" fill="rgba(130,190,255,0.28)" />
      <circle cx="350" cy="165" r="2" fill="rgba(130,190,255,0.2)" />
    </svg>
  )
}

function TreeThumbnail() {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="tree-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060d0a" />
          <stop offset="100%" stopColor="#081208" />
        </linearGradient>
        <radialGradient id="tree-glow" cx="50%" cy="42%" r="38%">
          <stop offset="0%" stopColor="rgba(50,160,60,0.2)" />
          <stop offset="100%" stopColor="rgba(5,20,8,0)" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#tree-bg)" />
      <rect width="400" height="240" fill="url(#tree-glow)" />
      <rect x="0" y="210" width="400" height="30" fill="rgba(10,25,12,0.8)" />
      <path d="M0,210 Q40,204 80,210 Q120,216 160,210 Q200,204 240,210 Q280,216 320,210 Q360,204 400,210" stroke="rgba(30,80,30,0.4)" strokeWidth="1.5" fill="none" />
      <rect x="60" y="155" width="8" height="55" rx="2" fill="rgba(15,40,18,0.7)" />
      <ellipse cx="64" cy="138" rx="22" ry="28" fill="rgba(12,42,16,0.65)" />
      <rect x="330" y="160" width="7" height="50" rx="2" fill="rgba(15,40,18,0.7)" />
      <ellipse cx="333" cy="143" rx="20" ry="26" fill="rgba(12,42,16,0.65)" />
      <path d="M196,240 L196,210 Q196,195 200,185 Q204,175 200,165" stroke="rgba(55,32,12,1)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M200,165 Q196,155 200,145" stroke="rgba(55,32,12,0.95)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M200,175 Q175,162 155,148" stroke="rgba(55,32,12,0.9)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M200,172 Q225,158 248,143" stroke="rgba(55,32,12,0.9)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M200,160 Q185,148 172,134" stroke="rgba(55,32,12,0.85)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M200,158 Q215,146 230,131" stroke="rgba(55,32,12,0.85)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M200,148 Q200,135 200,120" stroke="rgba(55,32,12,0.85)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M155,148 Q140,140 128,130" stroke="rgba(45,28,10,0.8)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M248,143 Q262,135 274,124" stroke="rgba(45,28,10,0.8)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M172,134 Q158,126 148,116" stroke="rgba(45,28,10,0.78)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M230,131 Q244,123 254,112" stroke="rgba(45,28,10,0.78)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="200" cy="75" rx="55" ry="48" fill="rgba(28,95,28,0.85)" />
      <ellipse cx="150" cy="100" rx="42" ry="36" fill="rgba(25,90,25,0.8)" />
      <ellipse cx="252" cy="98" rx="40" ry="35" fill="rgba(25,90,25,0.8)" />
      <ellipse cx="200" cy="65" rx="40" ry="32" fill="rgba(35,115,32,0.78)" />
      <ellipse cx="130" cy="92" rx="30" ry="26" fill="rgba(30,100,28,0.72)" />
      <ellipse cx="270" cy="90" rx="30" ry="26" fill="rgba(30,100,28,0.72)" />
      <ellipse cx="200" cy="58" rx="28" ry="22" fill="rgba(45,140,38,0.65)" />
      <ellipse cx="195" cy="52" rx="18" ry="14" fill="rgba(60,175,48,0.45)" />
      <ellipse cx="148" cy="80" rx="16" ry="12" fill="rgba(55,165,44,0.38)" />
      <ellipse cx="255" cy="78" rx="16" ry="12" fill="rgba(55,165,44,0.38)" />
    </svg>
  )
}

function CreekThumbnail() {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="creek-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0a06" />
          <stop offset="100%" stopColor="#100c07" />
        </linearGradient>
        <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(50,130,180,0.75)" />
          <stop offset="100%" stopColor="rgba(30,90,140,0.65)" />
        </linearGradient>
        <radialGradient id="creek-sky" cx="50%" cy="0%" r="65%">
          <stop offset="0%" stopColor="rgba(80,55,20,0.25)" />
          <stop offset="100%" stopColor="rgba(10,8,4,0)" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#creek-bg)" />
      <rect width="400" height="240" fill="url(#creek-sky)" />
      <ellipse cx="200" cy="30" rx="160" ry="50" fill="rgba(200,130,40,0.1)" />
      <rect x="30" y="80" width="10" height="130" rx="3" fill="rgba(35,22,10,0.9)" />
      <ellipse cx="35" cy="68" rx="30" ry="38" fill="rgba(28,45,18,0.82)" />
      <ellipse cx="35" cy="58" rx="22" ry="28" fill="rgba(35,58,22,0.75)" />
      <rect x="75" y="95" width="8" height="115" rx="3" fill="rgba(35,22,10,0.85)" />
      <ellipse cx="79" cy="83" rx="24" ry="32" fill="rgba(28,45,18,0.78)" />
      <ellipse cx="79" cy="74" rx="18" ry="22" fill="rgba(38,62,24,0.7)" />
      <rect x="355" y="85" width="10" height="125" rx="3" fill="rgba(35,22,10,0.9)" />
      <ellipse cx="360" cy="72" rx="28" ry="36" fill="rgba(28,45,18,0.82)" />
      <ellipse cx="360" cy="62" rx="20" ry="26" fill="rgba(35,58,22,0.75)" />
      <rect x="315" y="100" width="8" height="110" rx="3" fill="rgba(35,22,10,0.85)" />
      <ellipse cx="319" cy="88" rx="22" ry="30" fill="rgba(28,45,18,0.78)" />
      <ellipse cx="319" cy="80" rx="16" ry="20" fill="rgba(38,62,24,0.7)" />
      <path d="M0,175 Q30,162 60,158 Q90,155 115,160 Q130,163 140,170" stroke="rgba(50,38,22,0.7)" strokeWidth="2" fill="rgba(28,20,10,0.6)" />
      <path d="M0,240 L0,175 Q30,162 60,158 Q90,155 115,160 Q130,163 140,170 L140,240 Z" fill="rgba(22,16,8,0.85)" />
      <path d="M400,170 Q375,158 348,155 Q320,153 295,158 Q278,162 265,170" stroke="rgba(50,38,22,0.7)" strokeWidth="2" fill="rgba(28,20,10,0.6)" />
      <path d="M400,240 L400,170 Q375,158 348,155 Q320,153 295,158 Q278,162 265,170 L265,240 Z" fill="rgba(22,16,8,0.85)" />
      <path d="M140,240 L140,170 Q155,160 200,158 Q245,157 265,170 L265,240 Z" fill="url(#water-grad)" />
      <path d="M155,185 Q200,180 248,185" stroke="rgba(120,200,240,0.3)" strokeWidth="1.5" fill="none" />
      <path d="M150,200 Q200,194 252,200" stroke="rgba(120,200,240,0.25)" strokeWidth="1.5" fill="none" />
      <path d="M148,215 Q200,208 255,215" stroke="rgba(120,200,240,0.2)" strokeWidth="1.5" fill="none" />
      <ellipse cx="200" cy="172" rx="55" ry="8" fill="rgba(160,220,255,0.12)" />
      <rect x="138" y="165" width="130" height="8" rx="2" fill="rgba(80,50,20,0.9)" />
      <rect x="142" y="158" width="122" height="7" rx="2" fill="rgba(75,46,18,0.85)" transform="rotate(-2, 203, 161)" />
      <rect x="145" y="150" width="115" height="6" rx="2" fill="rgba(70,44,17,0.8)" transform="rotate(1.5, 202, 153)" />
      <line x1="155" y1="173" x2="148" y2="145" stroke="rgba(65,40,15,0.75)" strokeWidth="3" strokeLinecap="round" />
      <line x1="175" y1="173" x2="170" y2="143" stroke="rgba(65,40,15,0.72)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="200" y1="173" x2="198" y2="140" stroke="rgba(65,40,15,0.75)" strokeWidth="3" strokeLinecap="round" />
      <line x1="225" y1="173" x2="228" y2="142" stroke="rgba(65,40,15,0.72)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="248" y1="173" x2="252" y2="144" stroke="rgba(65,40,15,0.7)" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="115" cy="172" rx="18" ry="10" fill="rgba(55,35,15,0.95)" />
      <circle cx="130" cy="169" r="8" fill="rgba(55,35,15,0.95)" />
      <ellipse cx="133" cy="162" rx="3" ry="4" fill="rgba(45,28,12,0.9)" />
      <circle cx="137" cy="170" r="2" fill="rgba(30,18,8,0.9)" />
      <circle cx="134" cy="167" r="1.5" fill="rgba(200,180,140,0.8)" />
      <ellipse cx="97" cy="176" rx="14" ry="5" fill="rgba(45,28,12,0.9)" transform="rotate(-15, 97, 176)" />
      <line x1="88" y1="174" x2="108" y2="177" stroke="rgba(35,22,10,0.6)" strokeWidth="1" />
      <line x1="87" y1="177" x2="107" y2="180" stroke="rgba(35,22,10,0.6)" strokeWidth="1" />
      <ellipse cx="160" cy="230" rx="8" ry="4" fill="rgba(40,32,20,0.6)" />
      <ellipse cx="185" cy="225" rx="6" ry="3" fill="rgba(40,32,20,0.55)" />
      <ellipse cx="215" cy="228" rx="7" ry="3.5" fill="rgba(40,32,20,0.6)" />
      <ellipse cx="240" cy="222" rx="5" ry="2.5" fill="rgba(40,32,20,0.55)" />
      <ellipse cx="200" cy="190" rx="30" ry="6" fill="rgba(200,150,60,0.07)" />
    </svg>
  )
}

// ── The Demos ─────────────────────────────────────────────────────────────────

function TheDemos() {
  const demos = [
    {
      to: '/demo/reef',
      label: 'Reef — Team',
      title: 'The Coral Reef',
      description: 'A shallow tropical reef ecosystem. Coral health mirrors team wellbeing, fish population reflects engagement, and water clarity shows trust. Watch it respond as signals shift.',
      accent: 'rgba(30, 100, 200, 0.45)',
      accentLight: 'rgba(70, 148, 255, 0.85)',
      thumbnail: <ReefThumbnail />,
    },
    {
      to: '/demo/tree',
      label: 'Forest — Team',
      title: 'The Living Tree',
      description: 'A single old-growth tree in a forest clearing. Its foliage density and color reflect organizational vitality. Bare branches signal distress. A full canopy signals flourishing.',
      accent: 'rgba(20, 110, 55, 0.45)',
      accentLight: 'rgba(65, 205, 105, 0.85)',
      thumbnail: <TreeThumbnail />,
    },
    {
      to: '/demo/creek',
      label: 'Creek — Personal',
      title: 'The Beaver Creek',
      description: 'A mountain creek shaped by beaver activity. Water flow reflects your sense of energy. The beaver colony mirrors connection. Stream clarity maps to your confidence in what lies ahead.',
      accent: 'rgba(140, 90, 25, 0.45)',
      accentLight: 'rgba(215, 155, 65, 0.85)',
      thumbnail: <CreekThumbnail />,
    },
  ]

  return (
    <Zone>
      <section style={{ padding: '110px 0' }}>
        <Label>Live Demos</Label>
        <h2 style={H2}>Three worlds. One signal.</h2>
        <p style={{ ...body, marginBottom: 64, maxWidth: 580 }}>
          Each theme encodes the same underlying data differently.
          Two for organizations, one for individuals. The aesthetics are a matter of context.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {demos.map(demo => (
            <Link
              key={demo.to}
              to={demo.to}
              style={{
                display: 'block',
                textDecoration: 'none',
                border: `1px solid ${demo.accent}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.22s, transform 0.22s',
                background: 'rgba(255,255,255,0.018)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = demo.accentLight
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = demo.accent
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
                {demo.thumbnail}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 14,
                    fontFamily: FONT,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: demo.accentLight,
                    background: 'rgba(4,5,10,0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: `1px solid ${demo.accent}`,
                  }}
                >
                  {demo.label}
                </div>
              </div>

              <div style={{ padding: '24px 24px 28px' }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#d8e0f2',
                    letterSpacing: '-0.01em',
                    marginBottom: 10,
                  }}
                >
                  {demo.title}
                </div>
                <div style={{ ...body, fontSize: 14, lineHeight: 1.65 }}>
                  {demo.description}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 600,
                    color: demo.accentLight,
                    opacity: 0.88,
                  }}
                >
                  Launch demo →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Zone>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Configure',
      body: 'Set up Habitat for your context — a team deployment or a personal practice. Choose a visual theme, define your questions, set your cadence.',
    },
    {
      n: '02',
      title: 'Respond',
      body: 'Answer three short questions. Takes under a minute. For teams: shared anonymously across participants. For individuals: just you.',
    },
    {
      n: '03',
      title: 'Display',
      body: 'Put the visualization on a screen, pin it in a tab, or keep it open in the background. The signal is ambient — it doesn\'t demand attention.',
    },
    {
      n: '04',
      title: 'Attune',
      body: 'Over time, patterns emerge. The ecosystem becomes a read on what\'s actually happening — beneath the noise, before the crisis.',
    },
  ]

  return (
    <Zone overlay="rgba(0,0,0,0.18)" topBorder bottomBorder>
      <section style={{ padding: '110px 0' }}>
        <Label>How It Works</Label>
        <h2 style={H2}>Running in an afternoon.</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 0,
            marginTop: 60,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.n}
              style={{
                padding: '40px 32px 44px',
                borderRight: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 42,
                  fontWeight: 700,
                  color: BLUE_DIM,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: 24,
                }}
              >
                {step.n}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#cdd7ef',
                  letterSpacing: '-0.01em',
                  marginBottom: 12,
                }}
              >
                {step.title}
              </div>
              <div style={{ ...body, fontSize: 14, lineHeight: 1.68 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>
    </Zone>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <Zone topBorder>
      <footer
        style={{
          padding: '44px 0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Minimal branching mark */}
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <path d="M10 18 L10 11" stroke="rgba(65,130,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 11 L4 6"  stroke="rgba(65,130,255,0.35)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 11 L16 6" stroke="rgba(65,130,255,0.35)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="4"  cy="5"  r="1.8" fill="rgba(65,130,255,0.35)" />
            <circle cx="16" cy="5"  r="1.8" fill="rgba(65,130,255,0.35)" />
            <circle cx="10" cy="2"  r="1.8" fill="rgba(65,130,255,0.3)" />
            <path d="M10 8 L10 3" stroke="rgba(65,130,255,0.25)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: 'rgba(120,140,180,0.5)',
              letterSpacing: '0.04em',
            }}
          >
            Habitat
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { to: '/setup', label: 'Set up a deployment' },
            { to: '/login',  label: 'Sign in' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: 'rgba(130,155,210,0.55)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(170,195,245,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(130,155,210,0.55)')}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </Zone>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#05060c', overflowX: 'hidden' }}>
      <AnimatedBackground />
      <Hero />
      <WhatIsIt />
      <TheProblem />
      <TheEvidence />
      <TheDemos />
      <HowItWorks />
      <Footer />
    </div>
  )
}
