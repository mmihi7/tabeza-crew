interface SectionHeadingProps {
  title: string
  description?: string
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div style={{ marginBottom: description ? '0.75rem' : '0.625rem' }}>
      <div className="text-section-heading">{title}</div>
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          {description}
        </p>
      )}
    </div>
  )
}
