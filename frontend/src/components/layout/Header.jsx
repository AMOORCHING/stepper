/**
 * Header Component
 * 
 * Application header with logo, tagline, and navigation
 * Height: 64px, white background with subtle bottom border
 */
export default function Header() {
  return (
    <header className="h-16 bg-bg-secondary border-b border-border-subtle flex items-center px-8">
      <div className="flex-1 flex items-center gap-3">
        {/* Logo/Title */}
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          ThinkSpace
        </h1>
        {/* Tagline */}
        <span className="text-sm text-text-secondary hidden md:block">
          Visualizing Claude's Extended Thinking
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <a 
          href="#examples" 
          className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-fast"
        >
          Examples
        </a>
        <a 
          href="#about" 
          className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-fast"
        >
          About
        </a>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-fast"
        >
          GitHub
        </a>
      </nav>
    </header>
  )
}

