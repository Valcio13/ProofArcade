import type { ReactNode } from 'react'

type ProductHeroProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  compact?: boolean
}

function ProductHero({ eyebrow, title, description, actions, aside, compact = false }: ProductHeroProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_22%),linear-gradient(160deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
      <div className={aside ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]' : 'space-y-4'}>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">{eyebrow}</p>
          <h1 className={`mt-3 font-['Georgia'] leading-none text-white ${compact ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-5xl'}`}>
            {title}
          </h1>
          {description ? <div className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</div> : null}
          {actions ? <div className="mt-5">{actions}</div> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}

export default ProductHero
