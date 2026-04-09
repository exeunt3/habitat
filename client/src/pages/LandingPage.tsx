import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Animated gradient background canvas ───────────────────────────────────────

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
      t += 0.003
      const w = canvas!.width
      const h = canvas!.height

      // Deep base
      ctx.fillStyle = '#060912'
      ctx.fillRect(0, 0, w, h)

      // Slow drifting radial blobs
      const blobs = [
        { x: 0.3 + Math.sin(t * 0.7) * 0.18, y: 0.4 + Math.cos(t * 0.5) * 0.15, r: 0.45, color: '14, 28, 60' },
        { x: 0.7 + Math.cos(t * 0.6) * 0.14, y: 0.6 + Math.sin(t * 0.8) * 0.12, r: 0.38, color: '6, 22, 48' },
        { x: 0.5 + Math.sin(t * 0.4 + 1) * 0.20, y: 0.2 + Math.cos(t * 0.55) * 0.10, r: 0.30, color: '10, 18, 42' },
      ]

      for (const blob of blobs) {
        const gx = blob.x * w
        const gy = blob.y * h
        const gr = blob.r * Math.max(w, h)
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
        grad.addColorStop(0, `rgba(${blob.color}, 0.35)`)
        grad.addColorStop(1, `rgba(${blob.color}, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      // Subtle star field
      ctx.fillStyle = 'rgba(180, 200, 255, 0.55)'
      // deterministic from seed — draw once would be nicer but this is readable
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.508 * w) % w)
        const sy = ((i * 97.3 * h) % h)
        const alpha = 0.15 + Math.sin(t * 1.2 + i) * 0.12
        ctx.globalAlpha = alpha
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
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Shared style constants ────────────────────────────────────────────────────

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

const sectionStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 860,
  margin: '0 auto',
  padding: '80px 32px',
}

const labelStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(120, 170, 255, 0.65)',
  marginBottom: 20,
}

const headingStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(26px, 4vw, 38px)',
  fontWeight: 600,
  color: 'rgba(220, 228, 245, 0.92)',
  lineHeight: 1.3,
  margin: '0 0 20px',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 16,
  lineHeight: 1.75,
  color: 'rgba(165, 178, 205, 0.82)',
}

const divider: React.CSSProperties = {
  width: '100%',
  height: 1,
  background: 'rgba(255,255,255,0.05)',
  margin: 0,
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 clamp(20px, 6vw, 80px)',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 38%, rgba(60,120,220,0.55), rgba(10,25,70,0.0))',
          border: '1px solid rgba(80,130,255,0.25)',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="3.5" fill="rgba(100,170,255,0.7)" />
          <circle cx="11" cy="11" r="7" stroke="rgba(80,140,255,0.35)" strokeWidth="1" fill="none" />
          <circle cx="11" cy="11" r="10.2" stroke="rgba(60,110,220,0.18)" strokeWidth="0.8" fill="none" />
        </svg>
      </div>

      <div style={labelStyle}>Introducing Habitat</div>

      <h1
        style={{
          fontFamily: FONT,
          fontSize: 'clamp(38px, 7vw, 72px)',
          fontWeight: 700,
          color: 'rgba(225, 232, 250, 0.96)',
          lineHeight: 1.12,
          margin: '0 0 24px',
          letterSpacing: '-0.02em',
          maxWidth: 820,
        }}
      >
        Your team's wellbeing,<br />made visible.
      </h1>

      <p
        style={{
          fontFamily: FONT,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: 'rgba(155, 172, 210, 0.80)',
          lineHeight: 1.65,
          maxWidth: 520,
          margin: '0 0 48px',
        }}
      >
        Habitat turns anonymous employee feedback into a living ecosystem that leaders can actually feel — not just read.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/demo/reef"
          style={{
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: 10,
            background: 'rgba(50, 110, 230, 0.85)',
            color: 'rgba(220, 232, 255, 0.95)',
            textDecoration: 'none',
            letterSpacing: '0.01em',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(65, 130, 255, 0.95)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(50, 110, 230, 0.85)')}
        >
          See the reef demo
        </Link>
        <Link
          to="/demo/tree"
          style={{
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'rgba(190, 210, 245, 0.82)',
            textDecoration: 'none',
            letterSpacing: '0.01em',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            e.currentTarget.style.color = 'rgba(215, 228, 255, 0.95)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
            e.currentTarget.style.color = 'rgba(190, 210, 245, 0.82)'
          }}
        >
          See the forest demo
        </Link>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.35,
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.1em', color: '#aaa' }}>SCROLL</div>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <rect x="5.5" y="2" width="3" height="6" rx="1.5" fill="rgba(180,200,255,0.7)" />
          <rect x="0.5" y="0.5" width="13" height="19" rx="6.5" stroke="rgba(180,200,255,0.4)" />
        </svg>
      </div>
    </section>
  )
}

// ── The Problem ───────────────────────────────────────────────────────────────

function TheProblem() {
  const items = [
    {
      icon: '📊',
      title: 'Surveys that go nowhere',
      body: 'Annual engagement surveys produce decks that sit in drive folders. By the time leadership reviews them, the moment has passed.',
    },
    {
      icon: '🔢',
      title: 'Numbers without feeling',
      body: 'A score of 6.8 out of 10 is abstract. It doesn\'t convey urgency. It doesn\'t move people to act.',
    },
    {
      icon: '🙈',
      title: 'Silence between check-ins',
      body: 'Problems compound in the weeks between meetings. Leaders are navigating blind, reacting to crises that could have been caught early.',
    },
  ]

  return (
    <section style={{ ...sectionStyle, paddingTop: 100 }}>
      <div style={labelStyle}>The Problem</div>
      <h2 style={headingStyle}>Most teams are struggling in ways their leaders can't see.</h2>
      <p style={{ ...bodyStyle, marginBottom: 56, maxWidth: 600 }}>
        The tools we use to measure organizational health are designed for auditors, not humans. They produce reports when what we need is awareness.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {items.map(item => (
          <div
            key={item.title}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '28px 28px 32px',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 14 }}>{item.icon}</div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(215, 222, 240, 0.9)',
                marginBottom: 10,
              }}
            >
              {item.title}
            </div>
            <div style={{ ...bodyStyle, fontSize: 14 }}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── The Approach ──────────────────────────────────────────────────────────────

function TheApproach() {
  return (
    <section style={{ ...sectionStyle, paddingTop: 80 }}>
      <div style={labelStyle}>The Approach</div>
      <h2 style={headingStyle}>A living signal, not a static report.</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
          marginTop: 12,
        }}
      >
        <div>
          <p style={bodyStyle}>
            Habitat collects short, anonymous feedback from your team on a rolling basis — weekly or more often. The responses aren't stored in a spreadsheet. They feed a real-time simulation.
          </p>
          <p style={{ ...bodyStyle, marginTop: 16 }}>
            When the team is thriving, the ecosystem is vibrant. Coral grows, fish school, light filters through clear water. When stress accumulates, things change — subtly at first, then unmistakably.
          </p>
        </div>
        <div>
          <p style={bodyStyle}>
            The visualization is displayed passively in common spaces — a TV in the office, a pinned tab in Slack, a screen in the boardroom. No one needs to open a dashboard. The signal is ambient.
          </p>
          <p style={{ ...bodyStyle, marginTop: 16 }}>
            Leaders develop an intuition for their team's state the same way they develop intuition for weather: not by reading reports, but by paying attention over time.
          </p>
        </div>
      </div>
    </section>
  )
}

// ── The Evidence ──────────────────────────────────────────────────────────────

function TheEvidence() {
  const refs = [
    {
      quote: 'Frequent, brief check-ins predict team retention and performance better than annual surveys — and the effect size is large.',
      source: 'Harter et al. (2002). Business-unit-level relationship between employee satisfaction, employee engagement, and business outcomes.',
      journal: 'Journal of Applied Psychology, 87(2), 268–279.',
    },
    {
      quote: 'Ambient displays in the workplace create shared awareness without requiring active attention, reducing the cognitive cost of staying informed.',
      source: 'Mankoff et al. (2003). Heuristic evaluation of ambient displays.',
      journal: 'ACM CHI Conference on Human Factors in Computing Systems.',
    },
    {
      quote: 'Psychological safety — the belief that one won\'t be punished for speaking up — is the most important factor in high-performing teams.',
      source: 'Edmondson, A. (1999). Psychological safety and learning behavior in work teams.',
      journal: 'Administrative Science Quarterly, 44(2), 350–383.',
    },
    {
      quote: 'Abstract data presented as natural metaphors is processed faster and retained longer than equivalent numerical dashboards.',
      source: 'Ware, C. (2012). Information Visualization: Perception for Design (3rd ed.).',
      journal: 'Morgan Kaufmann.',
    },
  ]

  return (
    <section style={{ ...sectionStyle, paddingTop: 80 }}>
      <div style={labelStyle}>The Evidence</div>
      <h2 style={headingStyle}>Built on what the research actually says.</h2>
      <p style={{ ...bodyStyle, marginBottom: 48, maxWidth: 580 }}>
        Habitat isn't a new idea built on intuition. It synthesizes decades of organizational psychology and human-computer interaction research.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {refs.map((r, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.065)',
              borderRadius: 12,
              padding: '24px 28px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '0 20px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(100,155,255,0.5)',
                letterSpacing: '0.06em',
                paddingTop: 3,
                minWidth: 20,
                textAlign: 'right',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 15,
                  color: 'rgba(210, 222, 245, 0.88)',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  margin: '0 0 10px',
                }}
              >
                "{r.quote}"
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  color: 'rgba(130, 150, 185, 0.65)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {r.source} <em>{r.journal}</em>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── The Demos ─────────────────────────────────────────────────────────────────

function TheDemos() {
  const demos = [
    {
      to: '/demo/reef',
      label: 'Reef',
      title: 'The Coral Reef',
      description: 'A shallow tropical reef ecosystem. Coral health mirrors team wellbeing, fish population reflects engagement, and water clarity shows trust. Watch how the environment shifts as team signals change.',
      accent: 'rgba(30, 100, 200, 0.5)',
      accentLight: 'rgba(60, 140, 255, 0.8)',
      bg: 'radial-gradient(ellipse at 30% 60%, rgba(10,40,100,0.6), rgba(5,10,25,0))',
      previewBg: '#0a1628',
    },
    {
      to: '/demo/tree',
      label: 'Forest',
      title: 'The Living Tree',
      description: 'A single old-growth tree in a forest clearing. Its foliage density and color reflect organizational vitality. Bare branches signal distress. Full green canopy signals flourishing. Seasonal effects mark significant moments.',
      accent: 'rgba(20, 110, 60, 0.5)',
      accentLight: 'rgba(60, 200, 100, 0.8)',
      bg: 'radial-gradient(ellipse at 60% 40%, rgba(5,40,20,0.6), rgba(5,10,18,0))',
      previewBg: '#060d0a',
    },
  ]

  return (
    <section style={{ ...sectionStyle, paddingTop: 80 }}>
      <div style={labelStyle}>Live Demos</div>
      <h2 style={headingStyle}>Two worlds. One signal.</h2>
      <p style={{ ...bodyStyle, marginBottom: 48, maxWidth: 540 }}>
        Habitat ships with two visual themes. Both encode the same team data — the aesthetics are a matter of taste and context.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {demos.map(demo => (
          <Link
            key={demo.to}
            to={demo.to}
            style={{
              display: 'block',
              textDecoration: 'none',
              background: `${demo.bg}, rgba(255,255,255,0.025)`,
              border: `1px solid ${demo.accent}`,
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'border-color 0.25s, transform 0.25s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = demo.accentLight
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = demo.accent
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            {/* Preview area */}
            <div
              style={{
                height: 160,
                background: demo.previewBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: demo.accent,
                  filter: 'blur(32px)',
                  position: 'absolute',
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: demo.accentLight,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {demo.label} Theme
              </div>
            </div>

            {/* Text */}
            <div style={{ padding: '24px 24px 28px' }}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'rgba(215, 225, 245, 0.9)',
                  marginBottom: 10,
                }}
              >
                {demo.title}
              </div>
              <div style={{ ...bodyStyle, fontSize: 14, lineHeight: 1.65 }}>
                {demo.description}
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  color: demo.accentLight,
                  opacity: 0.85,
                }}
              >
                Launch demo →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Deploy',
      body: 'Run the setup wizard to create your organization\'s deployment. Takes under 5 minutes. You get a unique tank URL and a manager dashboard.',
    },
    {
      n: '02',
      title: 'Invite',
      body: 'Share an anonymous submission link with your team. No accounts, no login. Participants answer 3–5 short questions every week.',
    },
    {
      n: '03',
      title: 'Display',
      body: 'Put the tank view on a screen in your office or share the link in Slack. The visualization updates as responses come in.',
    },
    {
      n: '04',
      title: 'Respond',
      body: 'Use the manager dashboard to see underlying scores and trends. Side-quest events mark moments worth celebrating or addressing.',
    },
  ]

  return (
    <section style={{ ...sectionStyle, paddingTop: 80 }}>
      <div style={labelStyle}>How It Works</div>
      <h2 style={headingStyle}>Up and running in an afternoon.</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 2,
          marginTop: 12,
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step.n}
            style={{
              padding: '32px 24px 36px',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 700,
                color: 'rgba(60,110,220,0.25)',
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}
            >
              {step.n}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(210, 222, 240, 0.88)',
                marginBottom: 10,
              }}
            >
              {step.title}
            </div>
            <div style={{ ...bodyStyle, fontSize: 14 }}>{step.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        maxWidth: 860,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 13,
          color: 'rgba(130, 148, 180, 0.55)',
          letterSpacing: '0.04em',
        }}
      >
        Habitat — living organizational intelligence
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/setup"
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: 'rgba(140, 165, 215, 0.6)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(170, 195, 245, 0.85)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(140, 165, 215, 0.6)')}
        >
          Setup your deployment
        </Link>
        <Link
          to="/login"
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: 'rgba(140, 165, 215, 0.6)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(170, 195, 245, 0.85)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(140, 165, 215, 0.6)')}
        >
          Sign in
        </Link>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060912',
        overflowX: 'hidden',
      }}
    >
      <AnimatedBackground />
      <Hero />
      <hr style={divider} />
      <TheProblem />
      <hr style={divider} />
      <TheApproach />
      <hr style={divider} />
      <TheEvidence />
      <hr style={divider} />
      <TheDemos />
      <hr style={divider} />
      <HowItWorks />
      <Footer />
    </div>
  )
}
