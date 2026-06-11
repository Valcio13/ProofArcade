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
    <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
      <div className={aside ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]' : 'space-y-4'}>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">{eyebrow}</p>
          <h1 className={`mt-3 font-bold leading-none text-white ${compact ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-5xl'}`}>
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
