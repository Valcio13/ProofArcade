import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Stages from '../components/Home/Stages'
import OverviewCards from '../components/Home/OverviewCards'
import ExtraTables from '../components/Home/ExtraTables'

const ExplorerHomePage = () => {
  useEffect(() => {
    document.title = 'Explorer | ProofArcade'
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_30%),linear-gradient(135deg,_rgba(31,35,52,1),_rgba(24,27,35,1))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.03)_45%,transparent_100%)]" />
        <div className="relative max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[#9fd0ff]">Explorer</p>
          <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">
            Inspect blocks, accounts, and 2048 transactions.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            This is the chain utility side of the product. Use it to inspect network activity, validate game txs,
            and explore account state while the main landing page stays focused on play.
          </p>
        </div>
      </section>

      <Stages />
      <OverviewCards />
      <ExtraTables />
    </motion.div>
  )
}

export default ExplorerHomePage
