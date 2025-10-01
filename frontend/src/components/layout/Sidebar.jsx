/**
 * Sidebar Component
 * 
 * Left sidebar with examples, controls, and metrics
 * Width: 300px, scrollable content
 */
export default function Sidebar({ children, className = '' }) {
  return (
    <aside className={`w-[300px] bg-bg-secondary border-r border-border-subtle overflow-y-auto ${className}`}>
      <div className="p-6 space-y-8">
        {children || (
          <>
            {/* Examples Section */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Examples
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary rounded-md transition-all duration-fast">
                  Algorithm Design
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary rounded-md transition-all duration-fast">
                  System Architecture
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary rounded-md transition-all duration-fast">
                  Code Review
                </button>
              </div>
            </section>

            {/* Controls Section */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Controls
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-sm text-text-secondary">Auto-layout</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-sm text-text-secondary">Show edges</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-text-secondary">Animations</span>
                </label>
              </div>
            </section>

            {/* Metrics Section */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Nodes</span>
                  <span className="text-sm font-semibold text-text-primary">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Connections</span>
                  <span className="text-sm font-semibold text-text-primary">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Depth</span>
                  <span className="text-sm font-semibold text-text-primary">0</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </aside>
  )
}

