import * as React from 'react'

type LogoProps = {
  size?: number
  className?: string
  title?: string
}

// Simple abstract mark with gradient, designed to fit the site’s blue→purple aesthetic
export default function Logo({ size = 32, className = '', title = 'OM logo' }: LogoProps) {
  const id = React.useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={`g1-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id={`g2-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect x="3" y="3" width="58" height="58" rx="16" fill={`url(#g1-${id})`} />
      {/* Orbit ring */}
      <circle cx="32" cy="32" r="18" fill="none" stroke={`url(#g2-${id})`} strokeWidth="4" />
      {/* Monogram-like center */}
      <path
        d="M22 32c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M22 22v20"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
