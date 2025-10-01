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
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const baseClasses = 'inline-block font-semibold uppercase tracking-wide rounded';
  
  const variantClasses = {
    analysis: 'bg-node-analysis text-white',
    decision: 'bg-node-decision text-white',
    verification: 'bg-node-verification text-white',
    alternative: 'bg-node-alternative text-white',
    implementation: 'bg-node-implementation text-white',
    default: 'bg-bg-tertiary text-text-primary border border-border-default'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
}

