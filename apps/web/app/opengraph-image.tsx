import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Find Film Crew Texas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#171717',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#171717',
              fontSize: '48px',
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'flex',
            }}
          >
            FC
          </div>
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '24px',
            display: 'flex',
          }}
        >
          Find Film Crew Texas
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#a3a3a3',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '800px',
            display: 'flex',
          }}
        >
          Camera Operators, DPs, Gaffers, Grips, Sound Mixers & More
        </div>
        <div
          style={{
            fontSize: '22px',
            color: '#737373',
            marginTop: '40px',
            display: 'flex',
          }}
        >
          findfilmcrewtexas.com
        </div>
      </div>
    ),
    { ...size }
  )
}
