/**
 * Input Component
 * 
 * A reusable input field with label and error state support.
 * 
 * @param {Object} props
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type (default: 'text')
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.error - Whether input has error
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Whether input is required
 */
export default function Input({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  errorMessage,
  disabled = false,
  className = '',
  required = false,
  ...props
}) {
  const inputClasses = `
    font-sans text-sm w-full
    px-3 py-2.5 
    border rounded-md
    bg-white text-text-primary
    transition-all duration-fast
    placeholder:text-text-muted
    focus:outline-none focus:ring-3 focus:ring-accent-primary/10
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-accent-error focus:border-accent-error' 
      : 'border-border-default focus:border-accent-primary'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-accent-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && errorMessage && (
        <span className="text-xs text-accent-error">{errorMessage}</span>
      )}
    </div>
  );
}

