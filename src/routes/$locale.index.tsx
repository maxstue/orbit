import { createFileRoute } from '@tanstack/react-router'

import { FieldLog } from '@/features/star-system/FieldLog'
import { localeSchema } from '@/features/star-system/data/worlds'
import { getRouteMetadata } from '@/features/star-system/i18n/metadata'

export const Route = createFileRoute('/$locale/')({
  head: ({ params }) => getRouteMetadata(localeSchema.catch('en').parse(params.locale)),
  component: FieldLogIndex,
})

function FieldLogIndex() {
  const { locale } = Route.useRouteContext()
  return <FieldLog locale={locale} />
}
