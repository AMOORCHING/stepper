/**
 * Card Component
 * 
 * A reusable card container following the research-grade design system.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Whether to show hover effect (default: false)
 * @param {string} props.padding - Padding size: 'sm', 'md', 'lg' (default: 'md')
 */
export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}) {
  const baseClasses = 'bg-bg-secondary border border-border-subtle rounded-md shadow-sm transition-shadow duration-normal';
  
  const hoverClasses = hover ? 'hover:shadow-md' : '';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

