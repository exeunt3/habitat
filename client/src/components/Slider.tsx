import { useRef, useState } from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function Slider({ value, onChange, min = 1, max = 10 }: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pressing, setPressing] = useState(false)
  const dragging = useRef(false)

  const pct = ((value - min) / (max - min)) * 100

  function valueFromClient(clientX: number): number {
    if (!containerRef.current) return value
    const { left, width } = containerRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width))
    return Math.round(ratio * (max - min)) + min
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault()
    dragging.current = true
    setPressing(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange(valueFromClient(e.clientX))
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    onChange(valueFromClient(e.clientX))
  }

  function onPointerUp() {
    dragging.current = false
    setPressing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1
      : 0
    if (dir !== 0) {
      e.preventDefault()
      onChange(Math.max(min, Math.min(max, value + dir)))
    }
  }

  return (
    <div style={{ paddingBottom: 8, userSelect: 'none' }}>
      {/* Interactive area */}
      <div
        ref={containerRef}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        style={{
          position: 'relative',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none',
          touchAction: 'none',
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: '#EAEAE6',
            borderRadius: 1,
          }}
        >
          {/* Filled portion */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: '#2C2C2A',
              borderRadius: 1,
            }}
          />
        </div>

        {/* Thumb */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${pct}%`,
            transform: `translateX(-50%) scale(${pressing ? 1.12 : 1})`,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: pressing
              ? '0 2px 12px rgba(0,0,0,0.18), 0 0 0 1.5px rgba(0,0,0,0.09)'
              : '0 1px 5px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 500,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
            pointerEvents: 'none',
            transition: pressing
              ? 'transform 0.06s ease, box-shadow 0.06s ease'
              : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.1s ease',
          }}
        >
          {value}
        </div>
      </div>

      {/* Min / max labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 2,
        }}
      >
        <span style={{ fontSize: 11, color: '#C4C4BF', fontVariantNumeric: 'tabular-nums' }}>
          {min}
        </span>
        <span style={{ fontSize: 11, color: '#C4C4BF', fontVariantNumeric: 'tabular-nums' }}>
          {max}
        </span>
      </div>
    </div>
  )
}
