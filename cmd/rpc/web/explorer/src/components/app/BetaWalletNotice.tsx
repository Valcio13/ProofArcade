type BetaWalletNoticeProps = {
  title?: string
  body?: string
}

export default function BetaWalletNotice({
  title = 'Beta wallet notice',
  body = 'ProofArcade wallet access is still beta. Avoid storing meaningful value until the custody model is fully client-side. Back up your encrypted wallet after creating one — use the Export Backup option in the wallet menu.',
}: BetaWalletNoticeProps) {
  return (
    <div className="rounded-r-xl border-l-4 border-[#f0cf52] bg-[#f0cf52]/10 py-4 pl-5 pr-5 text-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0cf52]">⚠ {title}</p>
      <p className="mt-2 leading-6 text-[#f2e7be]">{body}</p>
    </div>
  )
}
