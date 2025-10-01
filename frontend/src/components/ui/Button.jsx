/**
 * Button Component
 * 
 * A reusable button component with multiple variants following the research-grade design system.
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'text'} props.variant - Button style variant (default: 'secondary')
 * @param {'sm' | 'md' | 'lg'} props.size - Button size (default: 'md')
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type attribute (default: 'button')
 */
export default function Button({ 
  variant = 'secondary', 
  size = 'md', 
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'font-sans font-medium rounded-md transition-all duration-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-accent-primary text-white border-none shadow-sm hover:bg-[#1D4ED8] hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm',
    secondary: 'bg-bg-secondary text-text-primary border border-border-default hover:border-border-strong hover:bg-bg-tertiary hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:shadow-none',
    text: 'bg-transparent text-accent-primary border-none hover:bg-bg-tertiary active:bg-border-subtle'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button 
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

