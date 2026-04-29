import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

function SectionCard({ title, description, children, className = '' }: SectionCardProps) {
  return (
    <div className={`rounded-[1.5rem] border border-white/10 bg-black/20 p-5 ${className}`.trim()}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default SectionCard
