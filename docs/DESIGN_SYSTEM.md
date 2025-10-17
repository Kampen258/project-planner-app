# ProjectFlow Design System
*Comprehensive KPI Dashboard Design System*

## 🎨 **Core Design Philosophy**

ProjectFlow uses a **Glassmorphism Design System** with vibrant gradients and sophisticated transparency effects. The design emphasizes **clarity, hierarchy, and visual depth** while maintaining excellent **accessibility and usability**.

## 🌈 **Color System**

### **Background Gradients**
```css
/* Primary Background */
bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400

/* Glass Effect Base */
bg-white/10 backdrop-blur-md border border-white/20
```

### **Opacity Scale**
- `white/5` - Subtle backgrounds
- `white/10` - Standard glass effect
- `white/15` - Hover states
- `white/20` - Elevated/active elements
- `white/30` - Prominent elements

### **Status Colors**
- **Success**: `bg-green-500` / `text-green-300`
- **Warning**: `bg-yellow-500` / `text-yellow-300`
- **Error**: `bg-red-500` / `text-red-300`
- **Info**: `bg-blue-500` / `text-blue-300`
- **Neutral**: `bg-purple-500` / `text-purple-300`

### **Text Hierarchy**
- **Primary**: `text-white` (100% opacity)
- **Secondary**: `text-white/80` (80% opacity)
- **Tertiary**: `text-white/70` (70% opacity)
- **Muted**: `text-white/60` (60% opacity)
- **Disabled**: `text-white/50` (50% opacity)

## 🧩 **Component Patterns**

### **Glass Cards**
```css
/* Standard Card */
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl;
}

/* Interactive Card */
.glass-card-interactive {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl
         hover:bg-white/15 transition-all duration-300;
}
```

### **Navigation Glass**
```css
.nav-glass {
  @apply bg-white/10 backdrop-blur-md border-b border-white/20;
}
```

### **Button System**
```css
/* Primary Button */
.btn-primary {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-lg
         text-white px-4 py-2 hover:bg-white/15 transition-all duration-300;
}

/* Icon Button */
.btn-icon {
  @apply w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center;
}
```

## 📊 **KPI Dashboard Components**

### **KPI Overview Cards**
```jsx
// 4-column responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
    {/* Icon + Title */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold">KPI Title</h3>
      <div className="w-8 h-8 bg-[status-color]/30 rounded-lg flex items-center justify-center">
        <IconComponent className="w-4 h-4 text-[status-color-light]" />
      </div>
    </div>
    {/* Content */}
    <div className="space-y-2">
      <div className="text-2xl font-bold text-white">27.4</div>
      <p className="text-white/70 text-sm">Description</p>
      <p className="text-xs text-green-300">+12% trend</p>
    </div>
  </div>
</div>
```

### **Chart Container**
```jsx
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-bold text-white">Chart Title</h3>
    {/* Legend */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-white/70 text-sm">Series 1</span>
      </div>
    </div>
  </div>
  {/* Chart Content */}
  <div className="h-64">
    {/* Chart implementation */}
  </div>
</div>
```

### **Progress Bars**
```jsx
/* Standard Progress */
<div className="w-full bg-white/20 rounded-full h-2">
  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
</div>

/* Thick Progress */
<div className="w-full bg-white/20 rounded-full h-3">
  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '60%' }}></div>
</div>
```

### **Status Indicators**
```jsx
/* Risk Matrix Item */
<div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg border border-red-500/30">
  <div>
    <div className="text-white font-medium">Issue Title</div>
    <div className="text-red-300 text-sm">High Impact • High Probability</div>
  </div>
  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
</div>
```

## 📏 **Spacing & Layout**

### **Grid System**
- **1 Column**: Mobile (default)
- **2 Column**: `sm:grid-cols-2` (640px+)
- **3 Column**: `lg:grid-cols-3` (1024px+)
- **4 Column**: `lg:grid-cols-4` (1024px+)

### **Gap Scale**
- `gap-2` (8px) - Tight spacing
- `gap-4` (16px) - Standard spacing
- `gap-6` (24px) - Loose spacing
- `gap-8` (32px) - Section spacing

### **Padding Scale**
- `p-3` (12px) - Compact elements
- `p-4` (16px) - Standard elements
- `p-6` (24px) - Cards and containers
- `p-8` (32px) - Large containers

### **Border Radius**
- `rounded-lg` (8px) - Buttons, inputs
- `rounded-2xl` (16px) - Cards, containers
- `rounded-full` - Icons, badges

## 🎯 **Dashboard Layout Structure**

### **Header Section**
```jsx
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">Page Title</h1>
    <p className="text-white/70">Description</p>
  </div>
  <div className="flex gap-4 mt-4 lg:mt-0">
    {/* Filters/Actions */}
  </div>
</div>
```

### **KPI Grid**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* KPI Cards */}
</div>
```

### **Main Content Grid**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
  <div className="lg:col-span-2">{/* Main chart */}</div>
  <div className="lg:col-span-1">{/* Sidebar component */}</div>
</div>
```

### **Secondary Grid**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Side-by-side components */}
</div>
```

## 🔤 **Typography Scale**

### **Headings**
- `text-3xl font-bold` - Page titles (H1)
- `text-2xl font-bold` - Section titles (H2)
- `text-xl font-bold` - Card titles (H3)
- `text-lg font-semibold` - Subsections (H4)

### **Body Text**
- `text-base` - Standard body (16px)
- `text-sm` - Secondary text (14px)
- `text-xs` - Meta information (12px)

### **Display Text**
- `text-2xl font-bold` - KPI numbers
- `text-lg font-bold` - Statistics
- `font-medium` - Labels and captions

## 🎨 **Interactive States**

### **Hover Effects**
```css
.interactive-element {
  @apply transition-all duration-300;
}

.interactive-element:hover {
  @apply bg-white/15 scale-[1.02];
}
```

### **Focus States**
```css
.focusable {
  @apply focus:outline-none focus:ring-2 focus:ring-white/50;
}
```

### **Active States**
```css
.active-state {
  @apply bg-white/20 border-white/40;
}
```

## 📱 **Responsive Behavior**

### **Mobile First**
All components start with mobile-optimized layouts and scale up:

```jsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

### **Breakpoints**
- **sm**: 640px (2 columns)
- **md**: 768px (Navigation changes)
- **lg**: 1024px (3-4 columns)
- **xl**: 1280px (Full layout)

## 🎯 **Chart Design Guidelines**

### **Color Scheme**
- **Primary**: `#3b82f6` (Blue)
- **Secondary**: `#10b981` (Green)
- **Accent**: `#f59e0b` (Orange)
- **Danger**: `#ef4444` (Red)
- **Info**: `#8b5cf6` (Purple)

### **Chart Elements**
- **Grid Lines**: `rgba(255,255,255,0.1)`
- **Axis Labels**: `text-white/70 text-xs`
- **Data Points**: Bold colors with transparency
- **Legends**: `text-white/70 text-sm`

## ⚡ **Performance Guidelines**

### **Backdrop Blur Optimization**
- Use sparingly on frequently updated elements
- Combine with `will-change: auto` for animations
- Test on lower-end devices

### **Transition Performance**
- Use `transition-all duration-300` consistently
- Avoid animating expensive properties
- Use `transform` over position changes

## 🔧 **Implementation Notes**

### **CSS Custom Properties**
Consider creating CSS variables for common glass effects:

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-hover: rgba(255, 255, 255, 0.15);
}
```

### **Accessibility**
- Maintain 4.5:1 contrast ratio with white text
- Use proper ARIA labels for charts
- Ensure keyboard navigation works
- Test with screen readers

This design system ensures **consistent, beautiful, and functional** KPI dashboards that scale across all device sizes while maintaining the distinctive ProjectFlow glassmorphism aesthetic.