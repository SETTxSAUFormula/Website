import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json' with { type: 'json' };

const APPLICATIONS_DATABASE_ID =
  process.env.CLOUDFLARE_D1_DATABASE_ID ??
  '381670b8-7e92-4ddf-bb9d-040a3103ac17';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig(async ({ command }) => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');
  const localCalendarVars = Object.fromEntries(
    [
      'GOOGLE_CALENDAR_ID',
      'GOOGLE_OAUTH_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_SECRET',
      'GOOGLE_OAUTH_REFRESH_TOKEN',
    ].flatMap((name) => {
      const value = process.env[name]?.trim();
      return value ? [[name, value]] : [];
    }),
  );
  const localBindingConfig = {
    main: 'vinext/server/fetch-handler',
    // Runtime values are managed in the Cloudflare dashboard. Keep them when
    // Git-based deployments publish a new Worker version.
    keep_vars: true,
    compatibility_flags: ['nodejs_compat'],
    ...(command === 'serve' && Object.keys(localCalendarVars).length > 0
      ? { vars: localCalendarVars }
      : {}),
    d1_databases: d1
      ? [
          {
            binding: d1,
            database_name: 'sauformula-applications',
            database_id: APPLICATIONS_DATABASE_ID,
          },
        ]
      : [],
    r2_buckets: r2
      ? [
          {
            binding: r2,
            bucket_name: 'site-creator-r2',
          },
        ]
      : [],
  };

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
