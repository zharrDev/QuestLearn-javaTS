import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global UI palette
        'pixel-navy': '#1B2430',
        'pixel-border': '#F4E9D8',
        'pixel-amber': '#E8A93B',
        'pixel-green': '#6FCF6F',
        'pixel-coral': '#E37B6B',
        'pixel-cream': '#F4E9D8',
        'pixel-dark': '#0F1218',
        'pixel-panel': '#1B2430',
        'pixel-bg': '#141B22',

        // English Village world
        'village-terracotta': '#B5533C',
        'village-grass': '#5C8A4A',
        'village-sky': '#8FC1D9',
        'village-warm': '#F5D5CB',
        'village-glow': '#D4795E',

        // Math Desert world
        'desert-teal': '#1F4E4A',
        'desert-sand': '#D9A24B',
        'desert-pyramid': '#8B6F47',
        'desert-light': '#E8F0F0',
        'desert-glow': '#C49030',

        // Logic Forest world
        'forest-green': '#1E3A2E',
        'forest-navy': '#16213A',
        'forest-lantern': '#F2C14E',
        'forest-glow': '#2A5E42',

        // Portal-specific colors (world map)
        'portal-village': '#B5533C',
        'portal-village-hover': '#D4795E',
        'portal-desert': '#C49030',
        'portal-desert-hover': '#D9A24B',
        'portal-forest': '#2A5E42',
        'portal-forest-hover': '#3D8B5F',

        // HUD colors
        'hud-bg': '#1B2430',
        'hud-border': '#2A3444',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'vt': ['"VT323"', 'monospace'],
        'body': ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'pixel': '0px',
      },
      boxShadow: {
        'pixel': '4px 4px 0px #000000',
        'pixel-sm': '2px 2px 0px #000000',
        'pixel-lg': '6px 6px 0px #000000',
        'pixel-amber': '4px 4px 0px #B8842A',
        'pixel-green': '4px 4px 0px #4A9C4A',
        'pixel-coral': '4px 4px 0px #B85A4A',
        'pixel-inset': 'inset 2px 2px 0px rgba(255,255,255,0.15), inset -2px -2px 0px rgba(0,0,0,0.3)',
        'portal-village': '0 0 20px #B5533C66, 0 0 40px #B5533C33',
        'portal-village-hover': '0 0 24px #D4795E88, 0 0 48px #D4795E44',
        'portal-desert': '0 0 20px #C4903066, 0 0 40px #C4903033',
        'portal-desert-hover': '0 0 24px #D9A24B88, 0 0 48px #D9A24B44',
        'portal-forest': '0 0 20px #2A5E4266, 0 0 40px #2A5E4233',
        'portal-forest-hover': '0 0 24px #3D8B5F88, 0 0 48px #3D8B5F44',
      },
      animation: {
        'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
        'pixel-blink': 'pixel-blink 1.2s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-bounce': 'pixel-bounce 0.4s ease-out',
        'pixel-shake': 'pixel-shake 0.3s ease-out',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'glow-amber': 'glow-amber 2s ease-in-out infinite',
        'glow-village': 'glow-village 2.5s ease-in-out infinite',
        'glow-desert': 'glow-desert 2.5s ease-in-out infinite',
        'glow-forest': 'glow-forest 2.5s ease-in-out infinite',
        'portal-breathe': 'portal-breathe 3s ease-in-out infinite',
        'star-twinkle': 'star-twinkle 3s ease-in-out infinite',
        'wizard-idle': 'wizard-idle 2s ease-in-out infinite',
        'float-gentle': 'float-gentle 4s ease-in-out infinite',
      },
      keyframes: {
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pixel-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'pixel-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 8px #6FCF6F44' },
          '50%': { boxShadow: '0 0 20px #6FCF6F88' },
        },
        'glow-amber': {
          '0%, 100%': { boxShadow: '0 0 8px #E8A93B44' },
          '50%': { boxShadow: '0 0 20px #E8A93B88' },
        },
        'glow-village': {
          '0%, 100%': { boxShadow: '0 0 15px #B5533C44, inset 0 0 10px #B5533C22' },
          '50%': { boxShadow: '0 0 30px #B5533C88, inset 0 0 15px #B5533C44' },
        },
        'glow-desert': {
          '0%, 100%': { boxShadow: '0 0 15px #C4903044, inset 0 0 10px #C4903022' },
          '50%': { boxShadow: '0 0 30px #C4903088, inset 0 0 15px #C4903044' },
        },
        'glow-forest': {
          '0%, 100%': { boxShadow: '0 0 15px #2A5E4244, inset 0 0 10px #2A5E4222' },
          '50%': { boxShadow: '0 0 30px #2A5E4288, inset 0 0 15px #2A5E4244' },
        },
        'portal-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'wizard-idle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
