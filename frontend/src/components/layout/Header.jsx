/**
 * Header Component - Exa.ai inspired
 * 
 * Clean, minimal header with logo and navigation
 */
export default function Header() {
  return (
    <header className="h-20 bg-[#f5f5f5] border-b border-white/10 flex items-center px-8">
      <div className="flex-1 flex items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-black">
            Stepper
          </h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex items-center gap-8">
        <a 
          href="https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          Research
        </a>
        <a 
          href="https://github.com/amoorching/stepper" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          GitHub
        </a>
      </nav>
    </header>
  )
}

