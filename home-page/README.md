# ProjectFlow Home Page Components

This folder contains a complete copy of all components and files that make up the ProjectFlow home page (landing page).

## 📁 Files Included

### Core Components
- **`LandingPage.tsx`** - Main home page component with glass morphism design
- **`SimpleAuthContext.tsx`** - Authentication context provider
- **`App.tsx`** - Main application component with routing
- **`main.tsx`** - React application entry point

### Configuration & Styling
- **`index.html`** - HTML shell and root element
- **`index.css`** - Global CSS with Tailwind imports
- **`tailwind.config.ts`** - Tailwind CSS configuration (if present)

## 🎨 Home Page Features

### Visual Design
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Gradient Background**: Cyan-to-blue-to-orange diagonal gradient
- **Modern Layout**: Clean, professional design with hover effects

### Content Sections
1. **Navigation Bar**: ProjectFlow logo + Login button
2. **Hero Section**: Main headline "Plan. Execute. Succeed." + CTA buttons
3. **Features Section**: 3 feature cards (Task Management, Timeline View, Team Collaboration)
4. **Calendar Overview**: Interactive glass morphism calendar showing October 2025

### Interactive Elements
- **Hover Effects**: Smooth transitions on cards and buttons
- **Glass Morphism**: Semi-transparent overlays with backdrop blur
- **Responsive Design**: Works on desktop and mobile
- **SVG Icons**: Inline icons for features

## 🔧 Dependencies
- React + TypeScript
- React Router DOM (for navigation)
- Tailwind CSS (for styling)
- SimpleAuthContext (for user state)

## 🎯 Usage
This folder serves as a standalone reference for the home page implementation. All files work together to create the complete landing page experience.

## 📊 Architecture
```
index.html
└── main.tsx
    └── App.tsx (Router + SimpleAuthProvider)
        └── LandingPage.tsx (Complete home page)
            ├── Navigation
            ├── Hero Section
            ├── Features Grid
            └── Calendar Component
```

## 🎨 Color Scheme
- **Background**: `linear-gradient(to-br from-cyan-400 via-blue-500 to-orange-400)`
- **Glass Effects**: White overlays with 10% opacity + backdrop blur
- **Text**: White with varying opacity levels
- **Borders**: White with 20% opacity

Created: October 2025