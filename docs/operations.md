# Orbit Operations

## Delivery

Pull requests execute formatting, linting, type checks, unit tests, a production
Worker build, and the selected Playwright accessibility suite. Only a successful
push to `main` enters the serialized `orbit-production` deployment job. The job
publishes `orbit-field-log` to `https://me.justmax.xyz` and smoke-tests `/en`,
`/de`, and `/en/workbench`.

The GitHub `production` environment requires these secrets:

| Secret                  | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Select the `justMax` Cloudflare account.                  |
| `CLOUDFLARE_API_TOKEN`  | Deploy the Worker and update its Sentry secret.           |
| `VITE_SENTRY_DSN`       | Enable browser and Worker event delivery.                 |
| `SENTRY_AUTH_TOKEN`     | Upload source maps to the `maxstue/orbit` Sentry project. |

The Sentry token is consumed only by the production build. Local development,
tests, and builds work without a DSN or upload token. Each production release is
named with the deployed Git commit. Source maps are hidden, uploaded during the
production build, and removed from the deployment output afterward.

To correct a bad release, revert the responsible commit and push the revert to
`main`. For urgent rollback, select the previous healthy version in Cloudflare
Workers & Pages under `orbit-field-log`, deploy that version, and then follow up
with a corrective commit so Git and production converge again.

## Observability baseline

Browser and Worker traces use a five-percent sample rate. Session Replay is not
enabled. Cloudflare invocation logs and traces remain enabled at the Worker
level; Sentry retention follows the active organization plan and should be
reviewed quarterly together with quota consumption.

Allowed event dimensions are deliberately low-cardinality: normalized route
shape, locale, theme, reduced-motion state, and a fixed technical source. User
objects, request bodies, cookies, headers, query strings, and URL fragments are
removed before delivery.

The initial Sentry alert baseline should contain:

- a new-issue alert for the `production` environment;
- a regression alert for reopened production issues;
- a quota alert at 80 percent of the monthly event or span allowance;
- ownership notifications for route, hydration, and UI-degradation errors.

After the first credentialed deployment, verify one controlled browser error and
one controlled Worker error. Both must show the Git commit as release, the
normalized route, and no personal or free-text request data. Confirm LCP, CLS,
and interaction latency in Sentry's Web Vitals view after real traffic arrives.
