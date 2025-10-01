/**
 * Badge Component
 * 
 * A reusable badge for displaying node types and other categorical information.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'analysis' | 'decision' | 'verification' | 'alternative' | 'implementation' | 'default'} props.variant - Badge color variant (default: 'default')
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size (default: 'md')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Custom background color (overrides variant)
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  color
}) {
  const baseClasses = 'inline-block font-semibold uppercase tracking-wide rounded-sm';
  
  const variantColors = {
    analysis: '#000000',
    decision: '#DC2626',
    verification: '#059669',
    alternative: '#D97706',
    implementation: '#000000',
    default: null
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const bgColor = color || variantColors[variant];
  const defaultClasses = variant === 'default' ? 'bg-bg-tertiary text-text-primary border border-border-default' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${defaultClasses} ${className}`;
  
  return (
    <span 
      className={classes}
      style={bgColor ? { backgroundColor: bgColor, color: 'white' } : {}}
    >
      {children}
    </span>
  );
}

