/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{ts,tsx}",
	  "./components/**/*.{ts,tsx}",
	  "./app/**/*.{ts,tsx}",
	  "./src/**/*.{ts,tsx}",
	  "*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  container: {
		center: true,
		padding: "2rem",
		screens: {
		  "2xl": "1400px",
		},
	  },
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
  
		  //Preserving original colors
		  tealBlue: {
			DEFAULT: "#2F5C7E", // Teal/blue from logo
			foreground: "#ffffff",
		  },
		  lightYellowLime: {
			DEFAULT: "#C5D86D", // Light yellow/lime from logo
			foreground: "#000000",
		  },
		  goldOrange: {
			DEFAULT: "#E6A65D", // Gold/orange from logo
			foreground: "#000000",
		  },
		},
		backgroundImage: {
		  "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
		  "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
		},
		animation: {
		  gradient: "gradient 8s linear infinite",
		  float: "float 3s ease-in-out infinite",
		},
		keyframes: {
		  gradient: {
			"0%, 100%": {
			  "background-size": "200% 200%",
			  "background-position": "left center",
			},
			"50%": {
			  "background-size": "200% 200%",
			  "background-position": "right center",
			},
		  },
		  float: {
			"0%, 100%": {
			  transform: "translateY(0)",
			},
			"50%": {
			  transform: "translateY(-10px)",
			},
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
