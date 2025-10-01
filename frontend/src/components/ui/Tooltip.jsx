import { useState } from 'react';

/**
 * Tooltip Component
 * 
 * A reusable tooltip with positioning support.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to attach tooltip to
 * @param {string} props.content - Tooltip text content
 * @param {'top' | 'bottom' | 'left' | 'right'} props.position - Tooltip position (default: 'top')
 * @param {string} props.className - Additional CSS classes
 */
export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!content) return children;
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-text-primary',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-text-primary',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-text-primary',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-text-primary'
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`
            absolute z-50 px-3 py-2 
            bg-text-primary text-white 
            text-sm rounded-md shadow-lg
            max-w-xs whitespace-normal
            pointer-events-none
            ${positionClasses[position]}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
        >
          {content}
          <div 
            className={`
              absolute w-0 h-0 
              border-4
              ${arrowClasses[position]}
            `.trim().replace(/\s+/g, ' ')}
          />
        </div>
      )}
    </div>
  );
}

