import React from 'react';

/**
 * Icon Component
 *
 * A reusable wrapper for SVG icons that provides consistent sizing and styling.
 * Works with SVG files imported as React components using the ?react suffix.
 *
 * @example
 * import PlusIcon from '@/assets/icons/plus.svg?react';
 *
 * <Icon component={PlusIcon} size="md" className="text-primary-500" />
 */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** The SVG component to render (imported with ?react suffix) */
  component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  /** Predefined size or use className for custom sizing */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  '2xl': 'w-12 h-12',
};

export const Icon: React.FC<IconProps> = ({
  component: IconComponent,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const sizeClass = sizeClasses[size];
  const combinedClassName = `${sizeClass} ${className}`.trim();

  return (
    <IconComponent
      className={combinedClassName}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    />
  );
};

/**
 * Example Usage:
 *
 * import { Icon } from '@/components/common/Icon';
 * import PlusIcon from '@/assets/icons/plus.svg?react';
 * import TrashIcon from '@/assets/icons/trash.svg?react';
 *
 * function MyComponent() {
 *   return (
 *     <div className="glass-card">
 *       <button className="btn-primary">
 *         <Icon component={PlusIcon} size="sm" className="mr-2" />
 *         Add Item
 *       </button>
 *
 *       <button className="text-error-500 hover:text-error-600">
 *         <Icon
 *           component={TrashIcon}
 *           size="md"
 *           aria-label="Delete item"
 *         />
 *       </button>
 *
 *       // Or use SVG directly without wrapper
 *       <PlusIcon className="w-5 h-5 text-white/70" />
 *     </div>
 *   );
 * }
 */
