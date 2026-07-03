import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Securing AI — Enterprise AI Security Training';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #0f172a 0%, #0b1220 60%, #020617 100%)',
          padding: '64px 80px',
          color: '#f1f5f9',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* TOP ROW — brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(34, 211, 238, 0.10)',
              border: '1px solid rgba(34, 211, 238, 0.35)',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22d3ee"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
              Securing AI
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#64748b',
                fontFamily: 'monospace',
                marginTop: 2,
              }}
            >
              AI Security Training
            </span>
          </div>
        </div>

        {/* SPACER */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* MIDDLE — headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: '#34d399',
              }}
            />
            <span
              style={{
                fontSize: 16,
                color: '#34d399',
                fontFamily: 'monospace',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Free · No tracking
            </span>
          </div>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 18px',
            }}
          >
            <span>Practice</span>
            <span style={{ color: '#f87171' }}>attacking,</span>
            <span style={{ color: '#22d3ee' }}>defending,</span>
            <span>and</span>
            <span style={{ color: '#34d399' }}>operating</span>
            <span>AI systems.</span>
          </span>
          <span
            style={{
              fontSize: 24,
              color: '#94a3b8',
              marginTop: 8,
              maxWidth: 1000,
            }}
          >
            Three dojos. Real scoring. Mapped to the top 2026 AI security
            certifications.
          </span>
        </div>

        {/* SPACER */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* BOTTOM — cert chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            fontFamily: 'monospace',
            fontSize: 18,
          }}
        >
          {[
            'CompTIA SecAI+',
            'ISC2 CAISP',
            'GIAC GOAA / GASAE',
            'EC-Council C|AI Security',
            'OWASP LLM Top 10',
            'NIST AI RMF',
            'ISO/IEC 42001',
            'EU AI Act',
            'MITRE ATT&CK',
          ].map((c) => (
            <span
              key={c}
              style={{
                display: 'flex',
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid rgba(34, 211, 238, 0.25)',
                color: '#67e8f9',
                background: 'rgba(34, 211, 238, 0.06)',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
