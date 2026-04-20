/**
 * Zoho-style section card: bordered, subtle shadow, optional header + subtitle + actions.
 */
export function Card({ title, subtitle, actions, children, bodyClass = '' }) {
  return (
    <section className="z-card">
      {(title || actions) && (
        <header className="z-card-header">
          <div>
            {title ? <h3 className="z-card-title">{title}</h3> : null}
            {subtitle ? <div className="z-card-subtitle">{subtitle}</div> : null}
          </div>
          {actions ? <div className="z-card-actions">{actions}</div> : null}
        </header>
      )}
      <div className={`z-card-body ${bodyClass}`.trim()}>{children}</div>
    </section>
  )
}

export function CardGrid({ cols = 4, children }) {
  const gridTemplate = {
    2: 'repeat(2, minmax(0, 1fr))',
    3: 'repeat(3, minmax(0, 1fr))',
    4: 'repeat(4, minmax(0, 1fr))',
    6: 'repeat(6, minmax(0, 1fr))',
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate[cols] || gridTemplate[4],
        gap: 14,
      }}
    >
      {children}
    </div>
  )
}
