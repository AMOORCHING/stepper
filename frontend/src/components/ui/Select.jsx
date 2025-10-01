/**
 * Select Component
 * 
 * A reusable select dropdown with label and error state support.
 * 
 * @param {Object} props
 * @param {string} props.label - Select label text
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.error - Whether select has error
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Whether select is required
 */
export default function Select({ 
  label,
  options = [],
  value,
  onChange,
  error = false,
  errorMessage,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  required = false,
  ...props
}) {
  const selectClasses = `
    font-sans text-sm w-full
    px-3 py-2.5 
    border rounded-md
    bg-white text-text-primary
    transition-all duration-fast
    cursor-pointer
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <span className="text-xs text-accent-error">{errorMessage}</span>
      )}
    </div>
  );
}


