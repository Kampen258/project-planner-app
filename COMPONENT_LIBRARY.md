# ProjectFlow Component Library

## Table of Contents
- [Basic Components](#basic-components)
- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Form Components](#form-components)
- [Feedback Components](#feedback-components)
- [Data Display](#data-display)
- [Interactive Components](#interactive-components)
- [Project-Specific Components](#project-specific-components)

---

## Basic Components

### Button

Versatile button component with glass morphism and multiple variants.

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onClick,
  ...props
}) => {
  const baseClasses = 'btn focus-ring transition-all duration-200 relative overflow-hidden';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    glass: 'btn-glass',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};
```

**Usage Examples:**
```tsx
<Button variant="primary" size="lg">Create Project</Button>
<Button variant="glass" icon={<PlusIcon />}>Add Task</Button>
<Button variant="danger" loading>Deleting...</Button>
```

### GlassCard

A beautiful glass morphism card component.

```tsx
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  padding = 'md',
  blur = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  return (
    <div
      className={cn(
        'glass-card',
        paddingClasses[padding],
        blurClasses[blur],
        hover && 'hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};
```

**Usage Examples:**
```tsx
<GlassCard>
  <h3>Project Overview</h3>
  <p>Your project statistics</p>
</GlassCard>

<GlassCard padding="lg" blur="xl" className="border-primary-500/20">
  <ProjectMetrics />
</GlassCard>
```

---

## Layout Components

### Container

Responsive container with max-width constraints.

```tsx
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn('container-custom', sizeClasses[size], className)}>
      {children}
    </div>
  );
};
```

### PageLayout

Main page layout with glass navigation and sidebar.

```tsx
interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  sidebar?: ReactNode;
  showSidebar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar,
  showSidebar = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Glass Navigation */}
      <nav className="glass-nav header-height flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Logo />
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center space-x-4">{actions}</div>}
      </nav>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className="glass-sidebar sidebar-width h-screen sticky top-0 p-6">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={cn('flex-1 p-6', showSidebar && 'content-area')}>
          {children}
        </main>
      </div>
    </div>
  );
};
```

---

## Navigation Components

### Navbar

Glass morphism navigation bar.

```tsx
interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

interface NavbarProps {
  items: NavItem[];
  logo?: ReactNode;
  actions?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ items, logo, actions }) => {
  return (
    <nav className="glass-nav">
      <Container className="flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-8">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.active
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      </Container>
    </nav>
  );
};
```

### Sidebar

Collapsible sidebar with glass effect.

```tsx
interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, collapsed = false, onToggle }) => {
  return (
    <aside className={cn('glass-sidebar transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex justify-center"
      >
        <MenuIcon className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* Navigation Items */}
      <nav className="px-4 space-y-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg transition-colors',
              item.active
                ? 'bg-primary-500/20 text-primary-600'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
};
```

---

## Form Components

### Input

Glass-style input with validation states.

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'glass';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  variant = 'default',
  icon,
  iconPosition = 'left',
  className,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}

        <input
          className={cn(
            variant === 'glass' ? 'form-input-glass' : 'form-input',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
            className
          )}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}
      {helper && !error && <div className="text-xs text-neutral-500 mt-1">{helper}</div>}
    </div>
  );
};
```

### TextArea

Multi-line input with glass styling.

```tsx
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'glass';
  resizable?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helper,
  variant = 'default',
  resizable = true,
  className,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <textarea
        className={cn(
          variant === 'glass' ? 'form-input-glass' : 'form-input',
          !resizable && 'resize-none',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
          className
        )}
        {...props}
      />

      {error && <div className="form-error">{error}</div>}
      {helper && !error && <div className="text-xs text-neutral-500 mt-1">{helper}</div>}
    </div>
  );
};
```

### Select

Custom select dropdown with glass styling.

```tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  variant?: 'default' | 'glass';
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  variant = 'default'
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <select
        className={cn(
          variant === 'glass' ? 'form-input-glass' : 'form-input',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-500'
        )}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
};
```

---

## Feedback Components

### Alert

Contextual alert component with icons and actions.

```tsx
interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  icon,
  actions,
  dismissible = false,
  onDismiss
}) => {
  const typeStyles = {
    info: 'bg-info-50 border-info-200 text-info-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800'
  };

  const iconMap = {
    info: <InfoIcon className="w-5 h-5" />,
    success: <CheckIcon className="w-5 h-5" />,
    warning: <WarningIcon className="w-5 h-5" />,
    error: <XIcon className="w-5 h-5" />
  };

  return (
    <div className={cn('p-4 border rounded-lg', typeStyles[type])}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon || iconMap[type]}
        </div>

        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>

        <div className="ml-4 flex space-x-2">
          {actions}
          {dismissible && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-black/5 rounded"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Toast

Notification toast with auto-dismiss.

```tsx
interface ToastProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onDismiss
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className="glass-card max-w-sm animate-slide-in-right">
      <Alert type={type} title={title} dismissible onDismiss={onDismiss}>
        {message}
      </Alert>
    </div>
  );
};
```

### LoadingSpinner

Animated loading spinner.

```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-500',
    white: 'border-white/20 border-t-white',
    neutral: 'border-neutral-200 border-t-neutral-500'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};
```

---

## Project-Specific Components

### ProjectCard

Card displaying project information with glass effect.

```tsx
interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    progress: number;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
    dueDate: Date;
    team: { id: string; name: string; avatar: string }[];
  };
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const statusColors = {
    planning: 'bg-info-100 text-info-800',
    active: 'bg-success-100 text-success-800',
    completed: 'bg-neutral-100 text-neutral-800',
    'on-hold': 'bg-warning-100 text-warning-800'
  };

  return (
    <GlassCard
      className="cursor-pointer hover:shadow-colored-primary"
      onClick={() => onClick?.(project)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[project.status])}>
          {project.status}
        </span>
      </div>

      <p className="text-white/80 mb-4 line-clamp-2">{project.description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-primary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-white/70">
        <div className="flex -space-x-2">
          {project.team.slice(0, 3).map((member) => (
            <img
              key={member.id}
              src={member.avatar}
              alt={member.name}
              className="w-6 h-6 rounded-full border-2 border-white"
            />
          ))}
          {project.team.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">
              +{project.team.length - 3}
            </div>
          )}
        </div>

        <span>Due {format(project.dueDate, 'MMM d')}</span>
      </div>
    </GlassCard>
  );
};
```

### TaskList

Interactive task list with drag and drop.

```tsx
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignee?: { name: string; avatar: string };
  dueDate?: Date;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onTaskReorder?: (tasks: Task[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskToggle, onTaskReorder }) => {
  const priorityColors = {
    low: 'bg-info-500',
    medium: 'bg-warning-500',
    high: 'bg-error-500'
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            'glass-card p-4 transition-all duration-200',
            task.completed && 'opacity-60'
          )}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onTaskToggle(task.id)}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                task.completed
                  ? 'bg-success-500 border-success-500'
                  : 'border-white/30 hover:border-white/50'
              )}
            >
              {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
            </button>

            <div className="flex-1">
              <h4 className={cn('font-medium text-white', task.completed && 'line-through')}>
                {task.title}
              </h4>

              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <div className={cn('w-2 h-2 rounded-full', priorityColors[task.priority])} />
                  <span className="text-xs text-white/70 capitalize">{task.priority}</span>
                </div>

                {task.assignee && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-xs text-white/70">{task.assignee.name}</span>
                  </div>
                )}

                {task.dueDate && (
                  <span className="text-xs text-white/70">
                    Due {format(task.dueDate, 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## Usage Guidelines

### Component Composition
```tsx
// Good: Compose components for complex layouts
<PageLayout
  title="Dashboard"
  sidebar={<ProjectSidebar />}
  actions={<Button variant="primary">New Project</Button>}
>
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  </Container>
</PageLayout>
```

### Theming
```tsx
// Use theme variants
<div className="theme-purple">
  <Button variant="primary">Purple Theme</Button>
</div>
```

### Accessibility
```tsx
// Always include proper ARIA attributes
<Button
  aria-label="Delete project"
  aria-describedby="delete-warning"
>
  <TrashIcon />
</Button>
```

### Performance
```tsx
// Use React.memo for expensive components
const ProjectCard = React.memo<ProjectCardProps>(({ project }) => {
  // Component implementation
});
```

For implementation details, see `IMPLEMENTATION_GUIDE.md`.