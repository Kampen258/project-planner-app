# ProjectFlow Design System - Implementation Guide

## Quick Start

### 1. Copy Template Files
Copy the template files to your project:

```bash
# Copy configuration files
cp tailwind.config.template.ts tailwind.config.ts
cp globals.css.template src/styles/globals.css

# Create components directory structure
mkdir -p src/components/{ui,layout,forms,feedback}
```

### 2. Install Dependencies
```bash
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install class-variance-authority clsx tailwind-merge
npm install @tailwindcss/forms @tailwindcss/typography
npm install lucide-react # For icons
```

### 3. Update Your Main CSS
Replace your main CSS file with the template:
```css
/* src/styles/globals.css */
@import './globals.css.template';
```

### 4. Test Implementation
Create a simple test component:
```tsx
// src/components/Test.tsx
import { Button, GlassCard } from './ui';

export const Test = () => (
  <div className="min-h-screen bg-gradient-primary p-8">
    <GlassCard>
      <h1 className="text-2xl font-bold text-white mb-4">Design System Test</h1>
      <Button variant="primary">Primary Button</Button>
      <Button variant="glass" className="ml-4">Glass Button</Button>
    </GlassCard>
  </div>
);
```

## Installation & Setup

### Prerequisites
- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.4+
- PostCSS 8+

### Step-by-Step Setup

#### 1. Install Core Dependencies
```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2. Install Utility Dependencies
```bash
# Class manipulation utilities
npm install clsx tailwind-merge class-variance-authority

# Optional: Additional Tailwind plugins
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

# Icons (choose one)
npm install lucide-react        # Recommended
npm install @heroicons/react    # Alternative
npm install react-icons         # Alternative
```

#### 3. Configure PostCSS
Create or update `postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 4. Update TypeScript Config
Add paths for better imports:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/styles/*": ["src/styles/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

## Configuration

### Tailwind Configuration

The template includes a comprehensive Tailwind configuration. Key features:

#### Custom Color Palette
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { /* 50-950 scale */ },
        secondary: { /* 50-950 scale */ },
        // Semantic colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Glass morphism colors
        glass: {
          'white': 'rgba(255, 255, 255, 0.25)',
          'dark': 'rgba(0, 0, 0, 0.25)',
        }
      }
    }
  }
}
```

#### Glass Morphism Plugin
```ts
plugins: [
  plugin(function({ addUtilities }) {
    const glassMorphismUtilities = {
      '.glass': {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    };
    addUtilities(glassMorphismUtilities);
  })
]
```

### CSS Custom Properties

The system uses CSS custom properties for dynamic theming:

```css
:root {
  --background: 255 255 255;
  --foreground: 17 24 39;
  --primary-500: 14 165 233;
  /* ... other properties */
}

[data-theme="dark"] {
  --background: 3 7 18;
  --foreground: 249 250 251;
  /* ... other properties */
}
```

## Component Implementation

### Utility Functions

First, create utility functions for class management:

```ts
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Base Components

#### Button Implementation
```tsx
// src/components/ui/Button.tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-colored-primary',
        secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500',
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-500',
        glass: 'glass text-neutral-800 hover:bg-white/40',
        danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500'
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## Theme Integration

### Dark Mode Implementation

#### Theme Provider
```tsx
// src/components/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)

    const updateTheme = () => {
      let resolvedTheme: 'light' | 'dark' = 'light'

      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolvedTheme = theme as 'light' | 'dark'
      }

      setActualTheme(resolvedTheme)
      document.documentElement.setAttribute('data-theme', resolvedTheme)

      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    updateTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## Best Practices

### Component Organization
```
src/
   components/
      ui/                 # Base components
         Button.tsx
         Input.tsx
         GlassCard.tsx
         index.ts
      layout/            # Layout components
         PageLayout.tsx
         Sidebar.tsx
         index.ts
      forms/             # Form-specific components
      project/           # Domain-specific components
   utils/
       cn.ts              # Class name utility
       constants.ts       # Design tokens
```

### Performance Optimization

#### Lazy Loading Components
```tsx
// src/components/ui/index.ts
import { lazy } from 'react'

export const Button = lazy(() => import('./Button').then(m => ({ default: m.Button })))
export const GlassCard = lazy(() => import('./GlassCard').then(m => ({ default: m.GlassCard })))

// Usage with Suspense
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Button>Click me</Button>
    </Suspense>
  )
}
```

### Accessibility

#### Keyboard Navigation
```tsx
const AccessibleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Handle Enter and Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.currentTarget.click()
      }
      onKeyDown?.(e)
    }

    return (
      <button
        ref={ref}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        {...props}
      />
    )
  }
)
```

## Troubleshooting

### Common Issues

#### Tailwind Classes Not Applied
**Problem:** CSS classes not working
**Solution:**
```ts
// Check tailwind.config.ts content paths
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Make sure this matches your file structure
    './components/**/*.{js,jsx,ts,tsx}',
  ],
}
```

#### Glass Effect Not Working
**Problem:** Backdrop-filter not visible
**Solution:**
```css
/* Ensure proper stacking context */
.glass {
  position: relative;
  z-index: 1;
}

/* For Safari compatibility */
.glass {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
```

#### Dark Mode Not Switching
**Problem:** Theme not updating
**Solution:**
```tsx
// Ensure ThemeProvider wraps your entire app
function App() {
  return (
    <ThemeProvider>
      <ColorThemeProvider>
        {/* Your app */}
      </ColorThemeProvider>
    </ThemeProvider>
  )
}
```

## Production Checklist

### Before Deployment
- [ ] All components tested in light/dark modes
- [ ] Accessibility audit completed (WAVE, axe)
- [ ] Performance tested (Lighthouse)
- [ ] Bundle size optimized
- [ ] CSS purged of unused classes
- [ ] All TypeScript errors resolved
- [ ] Glass effects tested on Safari
- [ ] Responsive design verified on all breakpoints
- [ ] Animation performance tested on low-end devices
- [ ] Focus states working correctly
- [ ] Screen reader compatibility verified

### Performance Optimization
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check unused CSS
npx tailwindcss -i ./src/styles/globals.css -o ./dist/output.css --minify
```

## Support & Resources

### Documentation Links
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [React ARIA](https://react-spectrum.adobe.com/react-aria/)

### Community
- [Tailwind Discord](https://discord.gg/tailwindcss)
- [GitHub Discussions](https://github.com/tailwindlabs/tailwindcss/discussions)

For questions specific to this design system, please refer to the component documentation in `COMPONENT_LIBRARY.md`.