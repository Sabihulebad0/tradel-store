/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Plus Jakarta Sans',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Sora',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			brand: {
  				'50': '#eff4fa',
  				'100': '#dae6f6',
  				'200': '#b1ccf1',
  				'300': '#77a9ee',
  				'400': '#2f7fee',
  				'500': '#095fd7',
  				'600': '#0349ab',
  				'700': '#00398a',
  				'800': '#002f70',
  				'900': '#002a66',
  				'950': '#00193d'
  			},
  			accent: {
  				'50': '#fff9eb',
  				'100': '#fff0cc',
  				'200': '#ffe099',
  				'300': '#ffce5c',
  				'400': '#ffbf29',
  				'500': '#ffb300',
  				'600': '#e09600',
  				'700': '#b87400',
  				'800': '#8b5504',
  				'900': '#6b3f06',
  				'950': '#442604',
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			ink: {
  				'50': '#f6f7f9',
  				'100': '#edeff2',
  				'200': '#d6dae1',
  				'300': '#b3bbc7',
  				'400': '#8b97a7',
  				'500': '#657386',
  				'600': '#4d596a',
  				'700': '#3b4554',
  				'800': '#2d3643',
  				'900': '#1d252f',
  				'950': '#121821'
  			},
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			}
  		},
  		boxShadow: {
  			card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
  			cardhover: '0 12px 24px -8px rgba(16,24,40,0.12), 0 4px 8px -4px rgba(16,24,40,0.08)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.4s ease-out',
  			'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1)',
  			'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)',
  			'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.22,1,0.36,1)',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			shimmer: 'shimmer 1.5s infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: 0
  				},
  				'100%': {
  					opacity: 1
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(16px)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			slideInLeft: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: 0,
  					transform: 'scale(0.96)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'scale(1)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
