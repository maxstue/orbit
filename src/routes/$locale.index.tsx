import { createFileRoute } from '@tanstack/react-router'

import { localeSchema } from '@/features/star-system/data/worlds'
import { getRouteMetadata } from '@/features/star-system/i18n/metadata'

export const Route = createFileRoute('/$locale/')({
  head: ({ params }) => getRouteMetadata(localeSchema.catch('en').parse(params.locale)),
  component: EmptyRoute,
})

function EmptyRoute() {
  return null
}
