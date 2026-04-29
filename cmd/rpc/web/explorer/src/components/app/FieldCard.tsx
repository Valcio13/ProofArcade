import type { ReactNode } from 'react'

type FieldCardProps = {
  label: string
  children: ReactNode
}

function FieldCard({ label, children }: FieldCardProps) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-black/15 p-3.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

export default FieldCard
