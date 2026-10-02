import { ImageResponse } from 'next/og';

export const alt = 'Data Science Club — Panimalar Engineering College';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0c1222 40%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(56, 189, 248, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
            top: -100,
            right: -100,
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            textAlign: 'center',
          }}
        >
          {/* Terminal badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 30,
              padding: '8px 24px',
              marginBottom: 32,
            }}
          >
            <span style={{ color: '#38bdf8', fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
              {'>'} SYSTEM.BOOT() — DEPT. OF AI & DATA SCIENCE
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: -2,
              margin: 0,
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.1,
            }}
          >
            DATA SCIENCE CLUB
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              color: '#94a3b8',
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            Panimalar Engineering College, Chennai
          </p>

          {/* Tagline */}
          <p
            style={{
              fontSize: 20,
              color: '#38bdf8',
              marginTop: 12,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            — Top Club in Panimalar —
          </p>
          <p
            style={{
              fontSize: 16,
              color: '#64748b',
              marginTop: 6,
            }}
          >
            Turning Curiosity into Data-Driven Innovation
          </p>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
