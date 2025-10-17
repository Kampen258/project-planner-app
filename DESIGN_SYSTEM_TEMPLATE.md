# ProjectFlow Design System

## Design Philosophy

### Core Principles
- **Clarity**: Every interface element should have a clear purpose and intuitive interaction
- **Consistency**: Unified visual language across all components and pages
- **Accessibility**: WCAG 2.1 AA compliant with semantic markup and proper contrast ratios
- **Modern Aesthetics**: Glassmorphism, subtle animations, and contemporary visual patterns
- **Performance**: Lightweight components with optimized animations and minimal bundle impact

### Visual Identity
ProjectFlow embodies productivity through elegant simplicity. Our design combines:
- **Glass morphism** for depth and modern appeal
- **Gradient overlays** for visual hierarchy and brand identity
- **Subtle animations** for feedback and delight
- **Clean typography** for excellent readability
- **Intuitive iconography** for universal understanding

## Color System

### Primary Palette
```css
/* Brand Colors */
--primary-50: #f0f9ff;   /* Lightest blue */
--primary-100: #e0f2fe;  /* Very light blue */
--primary-200: #bae6fd;  /* Light blue */
--primary-300: #7dd3fc;  /* Medium light blue */
--primary-400: #38bdf8;  /* Medium blue */
--primary-500: #0ea5e9;  /* Primary blue */
--primary-600: #0284c7;  /* Medium dark blue */
--primary-700: #0369a1;  /* Dark blue */
--primary-800: #075985;  /* Very dark blue */
--primary-900: #0c4a6e;  /* Darkest blue */

/* Secondary Colors */
--secondary-50: #fef3c7;   /* Light amber */
--secondary-100: #fde68a;  /* Pale amber */
--secondary-200: #fcd34d;  /* Light amber */
--secondary-300: #f59e0b;  /* Medium amber */
--secondary-400: #d97706;  /* Amber */
--secondary-500: #b45309;  /* Dark amber */
--secondary-600: #92400e;  /* Very dark amber */
```

### Semantic Colors
```css
/* Success */
--success-50: #ecfdf5;
--success-500: #10b981;
--success-600: #059669;
--success-900: #064e3b;

/* Warning */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-900: #78350f;

/* Error */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-900: #7f1d1d;

/* Info */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-900: #1e3a8a;
```

### Neutral Palette
```css
/* Grays */
--neutral-0: #ffffff;     /* Pure white */
--neutral-50: #f9fafb;    /* Almost white */
--neutral-100: #f3f4f6;   /* Very light gray */
--neutral-200: #e5e7eb;   /* Light gray */
--neutral-300: #d1d5db;   /* Medium light gray */
--neutral-400: #9ca3af;   /* Medium gray */
--neutral-500: #6b7280;   /* Medium gray */
--neutral-600: #4b5563;   /* Medium dark gray */
--neutral-700: #374151;   /* Dark gray */
--neutral-800: #1f2937;   /* Very dark gray */
--neutral-900: #111827;   /* Almost black */
--neutral-950: #030712;   /* Pure black alternative */
```

### Glass Morphism Colors
```css
/* Glass Effects */
--glass-white: rgba(255, 255, 255, 0.25);
--glass-white-strong: rgba(255, 255, 255, 0.35);
--glass-dark: rgba(0, 0, 0, 0.25);
--glass-dark-strong: rgba(0, 0, 0, 0.35);

/* Backdrop Blur Values */
--blur-sm: blur(4px);
--blur-md: blur(8px);
--blur-lg: blur(16px);
--blur-xl: blur(24px);
--blur-2xl: blur(40px);
```

## Typography

### Font Stack
```css
/* Primary Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

/* Monospace for code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Monaco', 'Consolas', monospace;

/* Display Font (for headings) */
--font-display: 'Cal Sans', 'Inter', sans-serif;
```

### Type Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
--text-7xl: 4.5rem;      /* 72px */
--text-8xl: 6rem;        /* 96px */
--text-9xl: 8rem;        /* 128px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Letter Spacing */
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0em;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Typography Usage
- **Headings**: Use display font with appropriate weight and tracking
- **Body Text**: Inter at 16px base size with 1.5 line height
- **UI Elements**: Inter at 14px for buttons, forms, and navigation
- **Captions**: Inter at 12px for metadata and secondary information
- **Code**: JetBrains Mono for code blocks and technical content

## Spacing System

### Base Unit: 4px (0.25rem)
```css
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-32: 8rem;       /* 128px */
--space-40: 10rem;      /* 160px */
--space-48: 12rem;      /* 192px */
--space-56: 14rem;      /* 224px */
--space-64: 16rem;      /* 256px */
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;     /* 2px */
--radius-md: 0.375rem;     /* 6px */
--radius-lg: 0.5rem;       /* 8px */
--radius-xl: 0.75rem;      /* 12px */
--radius-2xl: 1rem;        /* 16px */
--radius-3xl: 1.5rem;      /* 24px */
--radius-full: 9999px;     /* Perfect circle */
```

## Shadows & Elevation

### Shadow Levels
```css
/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Colored Shadows */
--shadow-primary: 0 10px 15px -3px rgb(14 165 233 / 0.1), 0 4px 6px -4px rgb(14 165 233 / 0.1);
--shadow-success: 0 10px 15px -3px rgb(16 185 129 / 0.1), 0 4px 6px -4px rgb(16 185 129 / 0.1);
--shadow-warning: 0 10px 15px -3px rgb(245 158 11 / 0.1), 0 4px 6px -4px rgb(245 158 11 / 0.1);
--shadow-error: 0 10px 15px -3px rgb(239 68 68 / 0.1), 0 4px 6px -4px rgb(239 68 68 / 0.1);
```

## Animation & Motion

### Timing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Duration Scale
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Motion Principles
- **Micro-interactions**: 150ms for hover states, 100ms for active states
- **Page transitions**: 300ms with ease-out for entering, 200ms with ease-in for exiting
- **Loading states**: 500ms+ for skeleton screens and spinners
- **Complex animations**: 700ms max for multi-step animations

## Component Patterns

### Glass Morphism Pattern
```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

### Gradient Overlays
```css
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.gradient-warm {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
```

## Accessibility Guidelines

### Color Contrast
- **AA Standard**: Minimum 4.5:1 ratio for normal text
- **AAA Standard**: Minimum 7:1 ratio for important content
- **Large Text**: Minimum 3:1 ratio for text 18px+ or 14px+ bold

### Focus States
- Always provide visible focus indicators
- Use consistent focus ring: `outline: 2px solid var(--primary-500); outline-offset: 2px;`
- Ensure focus rings have sufficient contrast

### Semantic Markup
- Use proper heading hierarchy (h1 ’ h2 ’ h3)
- Include ARIA labels for interactive elements
- Provide alt text for all images
- Use semantic HTML elements (button, nav, main, etc.)

## Dark Mode Support

### CSS Custom Properties for Dark Mode
```css
:root {
  --background: var(--neutral-0);
  --foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-500);
}

[data-theme="dark"] {
  --background: var(--neutral-950);
  --foreground: var(--neutral-50);
  --muted: var(--neutral-800);
  --muted-foreground: var(--neutral-400);
}
```

## Usage Guidelines

### Do's
 Use the established color palette
 Maintain consistent spacing using the 4px grid
 Apply glass morphism effects sparingly for hierarchy
 Use semantic color tokens for state communication
 Implement proper focus states for all interactive elements
 Test designs in both light and dark modes

### Don'ts
L Create custom colors outside the system
L Use arbitrary spacing values
L Overuse glass effects (limit to 2-3 per screen)
L Rely solely on color to communicate information
L Ignore accessibility guidelines
L Use animations longer than 700ms for UI feedback

## Implementation Notes

This design system is built to work seamlessly with:
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme switching
- **React components** with consistent prop APIs
- **TypeScript** for type-safe design tokens

For detailed implementation instructions, see `IMPLEMENTATION_GUIDE.md`.
For component specifications, see `COMPONENT_LIBRARY.md`.