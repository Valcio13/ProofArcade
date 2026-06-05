import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  maxWidthClass?: string
  paddingClass?: string
}

function PageShell({
  children,
  maxWidthClass = 'max-w-[1200px]',
  paddingClass = 'px-4 py-8 sm:px-6 lg:px-8',
}: PageShellProps) {
  return <div className={`mx-auto ${maxWidthClass} ${paddingClass}`}>{children}</div>
}

export default PageShell
