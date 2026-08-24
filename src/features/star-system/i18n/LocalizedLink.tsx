import { Link } from '@tanstack/react-router'

import type { Locale, WorldId } from '../data/worlds'

type LocalizedLinkProps = {
  locale: Locale
  signal?: WorldId
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}

export function LocalizedLink({ locale, signal, ...props }: LocalizedLinkProps) {
  if (signal) {
    return <Link to="/$locale/$signal" params={{ locale, signal }} {...props} />
  }

  return <Link to="/$locale" params={{ locale }} {...props} />
}
