type BetaWalletNoticeProps = {
  title?: string
  body?: string
}

export default function BetaWalletNotice({
  title = 'Beta wallet notice',
  body = 'ProofArcade wallet access is still beta. Back up your encrypted wallet after creating it, and avoid storing meaningful value until the custody model is fully client-side.',
}: BetaWalletNoticeProps) {
  return (
    <div className="rounded-[1.35rem] border border-[#f0cf52]/25 bg-[#f0cf52]/8 px-4 py-4 text-sm text-[#f7e5a6]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0cf52]">{title}</p>
      <p className="mt-2 leading-6 text-[#f2e7be]">{body}</p>
    </div>
  )
}
