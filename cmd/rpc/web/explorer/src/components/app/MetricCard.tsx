type MetricCardProps = {
  label: string
  value: string
  compact?: boolean
}

function MetricCard({ label, value, compact = false }: MetricCardProps) {
  return (
    <div className={`rounded-[1rem] border border-white/10 bg-slate-950/50 ${compact ? 'px-4 py-3' : 'px-4 py-4'}`}>
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>{value}</p>
    </div>
  )
}

export default MetricCard
