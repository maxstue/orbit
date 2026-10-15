import { m } from '@/paraglide/messages.js'

import type { Locale } from '../data/worlds'
import type { Transmission } from './content'

/** `comfortable` scales the terminal typography up one step for long-form reading. */
type ContentProps = { comfortable?: boolean }

export function TransmissionDetails({
  details,
  comfortable,
}: ContentProps & { details: Transmission['details'] }) {
  if (details.length === 0) return null

  return (
    <dl className="my-[30px] mt-[35px] border-t border-[var(--line)]">
      {details.map((detail) => (
        <div
          className={`grid gap-4 border-b border-[var(--line)] py-3.5 ${comfortable ? 'grid-cols-[140px_1fr] max-[620px]:grid-cols-1 max-[620px]:gap-1.5' : 'grid-cols-[110px_1fr] max-[620px]:grid-cols-[90px_1fr]'}`}
          key={detail.label}
        >
          <dt
            className={`font-mono tracking-[0.1em] text-[var(--dim)] uppercase ${comfortable ? 'pt-0.5 text-[10px]' : 'text-[8px]'}`}
          >
            {detail.label}
          </dt>
          <dd className={`m-0 font-mono leading-[1.45] ${comfortable ? 'text-[13px]' : 'text-xs'}`}>
            {detail.href ? (
              <a
                className="text-[var(--lime)]"
                href={detail.href}
                target={detail.href.startsWith('http') ? '_blank' : undefined}
                rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {detail.value}
              </a>
            ) : (
              detail.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function MissionLog({
  missions,
  locale,
  comfortable,
}: ContentProps & { missions: NonNullable<Transmission['missionLog']>; locale: Locale }) {
  const options = { locale }

  return (
    <section className="mt-8" aria-label={m.workbench_mission_log_label({}, options)}>
      <div
        className={`mb-4 flex items-center gap-3 font-mono tracking-[0.15em] text-[var(--cyan)] ${comfortable ? 'text-[10px]' : 'text-[8px]'}`}
      >
        <span className="h-px flex-1 bg-[var(--line)]" />
        {m.workbench_mission_log_label({}, options)}
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <ol className="relative ml-1 border-l border-[var(--line)] pl-5">
        {missions.map((mission) => (
          <li className="relative pb-7 last:pb-0" key={`${mission.period}-${mission.organization}`}>
            <span
              className={`absolute top-1 -left-[25px] size-2 rounded-full border ${mission.current ? 'border-[var(--lime)] bg-[var(--lime)] shadow-[0_0_0_5px_rgb(220_239_104_/_10%),0_0_12px_var(--lime)]' : 'border-[var(--dim)] bg-[var(--space)]'}`}
              aria-hidden="true"
            />
            <div
              className={`mb-2 flex flex-wrap items-center justify-between gap-2 font-mono tracking-[0.11em] ${comfortable ? 'text-[10px]' : 'text-[8px]'}`}
            >
              <span className="text-[var(--dim)]">{mission.period}</span>
              <span className={mission.current ? 'text-[var(--lime)]' : 'text-[var(--cyan)]'}>
                {mission.current && (
                  <i className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-current" />
                )}
                {mission.status}
              </span>
            </div>
            <h3
              className={`leading-tight tracking-[-0.025em] text-[var(--paper)] ${comfortable ? 'text-xl' : 'text-lg'}`}
            >
              {mission.title}
            </h3>
            <p
              className={`mt-1 font-mono tracking-[0.08em] text-[var(--coral)] ${comfortable ? 'text-[11px]' : 'text-[9px]'}`}
            >
              {mission.organization}
            </p>
            <p
              className={`mt-3 leading-[1.6] text-[#c7c7bd] ${comfortable ? 'text-[15px]' : 'text-[13px]'}`}
            >
              {mission.summary}
            </p>
            <ul
              className="mt-3 flex flex-wrap gap-1.5"
              aria-label={m.workbench_mission_tools_label({}, options)}
            >
              {mission.tags.map((tag) => (
                <li
                  className={`border border-[var(--line)] px-2 py-1 font-mono tracking-[0.08em] text-[var(--dim)] ${comfortable ? 'text-[9px]' : 'text-[7px]'}`}
                  key={tag}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function TransmissionDownloads({
  downloads,
  comfortable,
}: ContentProps & { downloads: NonNullable<Transmission['downloads']> }) {
  return (
    <div className={`grid grid-cols-2 gap-3 max-[620px]:grid-cols-1 ${comfortable ? 'mt-8' : ''}`}>
      {downloads.map((download) => (
        <a
          className={`group flex min-h-12 items-center justify-between border border-[var(--cyan)] px-4 font-mono tracking-[0.09em] text-[var(--cyan)] no-underline transition-colors hover:bg-[var(--cyan)] hover:text-[var(--space)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lime)] ${comfortable ? 'text-[10px]' : 'text-[9px]'}`}
          href={download.href}
          download
          key={download.href}
        >
          {download.label}
          <span
            aria-hidden="true"
            className="text-base transition-transform group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </a>
      ))}
    </div>
  )
}

export function TransmissionQuote({ quote, comfortable }: ContentProps & { quote: string }) {
  return (
    <blockquote
      className={`border-l-[3px] border-[var(--coral)] py-1.5 pl-[18px] font-mono leading-[1.5] font-bold text-[var(--paper)] ${comfortable ? 'mt-9 text-[15px]' : 'mt-[25px] text-sm'}`}
    >
      {quote}
    </blockquote>
  )
}
