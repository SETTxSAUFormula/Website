import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const validPayload = {
  name: 'Test Applicant',
  email: 'applicant@example.com',
  phone: '05000000000',
  university: 'sau',
  academicDepartment: 'Makine Mühendisliği',
  classLevel: '2',
  primaryTeam: 'powertrain',
  secondaryTeam: '',
  departmentMotivation:
    'Güç aktarımı tasarımı ve test süreçlerinde sorumluluk almak istiyorum.',
  weeklyHours: '5-8',
  summerParticipation: 'yes',
  busyPeriods: 'yes',
  communityExperience: 'no',
  motivation: 'Üretim ve tasarım deneyimi kazanmak istiyorum.',
  responsibilityScenario:
    'Takım liderime haber verir ve yeni bir plan yaparım.',
  motivationFactor: 'Takım olarak bir araç üretmek.',
  consent: true,
  language: 'tr',
  turnstileToken: 'test-token-with-at-least-twenty-characters',
};

// Compile the real Worker modules in an isolated context. Only external services
// are replaced; the production INSERT, schema, list and review SQL run in SQLite.
async function harness(options = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    readFileSync(
      path.join(root, 'drizzle/0000_thin_doctor_faustus.sql'),
      'utf8',
    ),
  );
  sqlite.exec(
    readFileSync(path.join(root, 'drizzle/0008_foamy_darkstar.sql'), 'utf8'),
  );
  const calls = [];
  const database = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      let values = [];
      return {
        bind(...args) {
          values = args;
          return this;
        },
        async run() {
          calls.push('database');
          if (options.insertError) throw new Error('Database unavailable');
          if (options.insertResult) return options.insertResult;
          const result = statement.run(...values);
          return { success: true, meta: { changes: Number(result.changes) } };
        },
        async all() {
          return { results: statement.all(...values) };
        },
      };
    },
  };
  const runtimeEnv = {
    APPLICATIONS_DB: options.noDatabase ? undefined : database,
    TURNSTILE_SECRET_KEY: options.noSecret ? undefined : 'test-secret',
    TURNSTILE_SITE_KEY: 'test-site-key',
    ...(options.contact ? { RESEND_API_KEY: 'test-contact-key' } : {}),
  };
  const context = vm.createContext({
    Request,
    Response,
    FormData,
    URL,
    Headers,
    AbortSignal,
    crypto,
    console: { error() {} },
    async fetch(url, init) {
      calls.push(url);
      if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
        assert.equal(init.body.get('secret'), 'test-secret');
        assert.equal(init.body.get('response'), validPayload.turnstileToken);
        if (options.verificationError) throw new Error('Timeout');
        if (options.verificationStatus)
          return new Response('unavailable', {
            status: options.verificationStatus,
          });
        return Response.json(
          options.verification ?? {
            success: true,
            hostname: 'sauformula.org',
            action: options.contact ? 'contact' : 'application',
          },
        );
      }
      assert.ok(options.contact, 'Application flow must never send email');
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(init.headers.Authorization, 'Bearer test-contact-key');
      return Response.json({ id: 'test-contact-email' });
    },
  });
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const code = ts.transpileModule(
      readFileSync(path.join(root, file), 'utf8'),
      {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      },
    ).outputText;
    const module = new vm.SourceTextModule(code, { context, identifier: file });
    cache.set(file, module);
    return module;
  }
  const envModule = new vm.SyntheticModule(
    ['env'],
    function () {
      this.setExport('env', runtimeEnv);
    },
    { context },
  );
  const accessModule = new vm.SyntheticModule(
    ['requireCloudflareAccess'],
    function () {
      this.setExport('requireCloudflareAccess', async () =>
        options.unauthorized ? null : { email: 'admin@sauformula.org' },
      );
    },
    { context },
  );
  const route = load(
    options.admin
      ? 'app/api/admin/applications/route.ts'
      : options.contact
      ? 'app/api/contact/route.ts'
      : 'app/api/application/route.ts',
  );
  await route.link((specifier) => {
    if (specifier === 'cloudflare:workers') return envModule;
    if (specifier === '@/lib/applications-db')
      return load('lib/applications-db.ts');
    if (specifier === '@/lib/cloudflare-access') return accessModule;
    throw new Error(`Unexpected import: ${specifier}`);
  });
  await route.evaluate();
  return {
    sqlite,
    database,
    calls,
    route: route.namespace,
    db: cache.get('lib/applications-db.ts')?.namespace,
  };
}

function request(payload = validPayload, headers = {}) {
  return new Request('https://sauformula.org/api/application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://sauformula.org',
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

function adminDeleteRequest(ids) {
  return new Request('https://sauformula.org/api/admin/applications', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

test('additive department motivation migration preserves historical applications', () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    sqlite.exec(
      readFileSync(
        path.join(root, 'drizzle/0000_thin_doctor_faustus.sql'),
        'utf8',
      ),
    );
    sqlite
      .prepare(`
        INSERT INTO applications (
          id, submitted_at, updated_at, name, email, phone, university,
          academic_department, class_level, primary_team, programs,
          weekly_hours, summer_participation, busy_periods,
          community_experience, projects, motivation,
          responsibility_scenario, motivation_factor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        'historical-application',
        1,
        1,
        'Mevcut Başvuru',
        'existing@example.com',
        '05000000000',
        'sau',
        'Makine Mühendisliği',
        '2',
        'powertrain',
        '',
        '5-8',
        'yes',
        'yes',
        'no',
        '',
        'Mevcut motivasyon metni değişmemeli.',
        'Mevcut sorumluluk cevabı değişmemeli.',
        'Takım çalışması',
      );
    const before = sqlite
      .prepare(
        'SELECT id, name, email, motivation, status FROM applications WHERE id = ?',
      )
      .get('historical-application');

    sqlite.exec(
      readFileSync(
        path.join(root, 'drizzle/0008_foamy_darkstar.sql'),
        'utf8',
      ),
    );

    const after = sqlite
      .prepare(
        'SELECT id, name, email, motivation, status, department_motivation FROM applications WHERE id = ?',
      )
      .get('historical-application');
    for (const field of ['id', 'name', 'email', 'motivation', 'status']) {
      assert.equal(after[field], before[field]);
    }
    assert.equal(after.department_motivation, '');
    assert.equal(
      sqlite.prepare('SELECT COUNT(*) AS count FROM applications').get().count,
      1,
    );
  } finally {
    sqlite.close();
  }
});

test('Turnstile -> D1 -> admin works without any Resend key or request', async (t) => {
  const h = await harness();
  t.after(() => h.sqlite.close());
  const response = await h.route.POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, stored: true });
  assert.deepEqual(h.calls, [
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    'database',
  ]);
  const applications = await h.db.listApplications(h.database, {});
  assert.equal(applications.length, 1);
  const record = applications[0];
  assert.equal(record.name, validPayload.name);
  assert.equal(record.primaryTeam, 'powertrain');
  assert.equal(
    record.departmentMotivation,
    validPayload.departmentMotivation,
  );
  assert.equal(record.programs, '');
  assert.equal(record.projects, '');
  assert.equal(record.status, 'new');
  assert.equal(record.emailDeliveryStatus, 'not_required');
  assert.equal(record.resendEmailId, '');
  await h.db.updateApplicationReview(h.database, {
    id: record.id,
    status: 'accepted',
    assignedDepartment: 'powertrain',
    reviewerNote: 'Test review',
    reviewedBy: 'reviewer@example.com',
  });
  const accepted = await h.db.listAcceptedApplications(h.database);
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].assignedDepartment, 'powertrain');
  assert.equal(accepted[0].reviewerNote, 'Test review');
  assert.equal(
    (
      await h.db.listApplications(h.database, {
        status: 'accepted',
        team: 'powertrain',
        search: 'Test',
      })
    ).length,
    1,
  );
  assert.equal(
    await h.db.deleteApplications(h.database, [record.id, 'missing-record']),
    1,
  );
  assert.equal((await h.db.listApplications(h.database, {})).length, 0);
});

test('admin delete removes one or multiple selected applications', async (t) => {
  const h = await harness({ admin: true });
  t.after(() => h.sqlite.close());
  const first = {
    ...validPayload,
    id: 'application-one',
    submittedAt: 1,
    linkedin: '',
    portfolio: '',
    communityDetails: '',
    programs: '',
    projects: '',
    additionalNotes: '',
  };
  const second = {
    ...first,
    id: 'application-two',
    submittedAt: 2,
    email: 'second@example.com',
  };
  await h.db.insertApplication(h.database, first);
  await h.db.insertApplication(h.database, second);

  const response = await h.route.DELETE(
    adminDeleteRequest([first.id, second.id]),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, deleted: 2 });
  assert.equal((await h.db.listApplications(h.database, {})).length, 0);
});

test('admin delete requires access and valid non-empty IDs', async (t) => {
  const unauthorized = await harness({ admin: true, unauthorized: true });
  t.after(() => unauthorized.sqlite.close());
  assert.equal(
    (await unauthorized.route.DELETE(adminDeleteRequest(['application-one'])))
      .status,
    401,
  );

  const authorized = await harness({ admin: true });
  t.after(() => authorized.sqlite.close());
  for (const ids of [[], [''], Array.from({ length: 101 }, (_, index) => `id-${index}`)]) {
    assert.equal(
      (await authorized.route.DELETE(adminDeleteRequest(ids))).status,
      400,
    );
  }
});

for (const [name, options, code] of [
  ['missing D1 binding', { noDatabase: true }, 'service_unavailable'],
  ['missing Turnstile secret', { noSecret: true }, 'service_unavailable'],
  ['D1 exception', { insertError: true }, 'storage_failed'],
  [
    'unsuccessful D1 result',
    { insertResult: { success: false, meta: { changes: 0 } } },
    'storage_failed',
  ],
  [
    'D1 inserted no row',
    { insertResult: { success: true, meta: { changes: 0 } } },
    'storage_failed',
  ],
  [
    'Turnstile timeout',
    { verificationError: true },
    'verification_unavailable',
  ],
  [
    'Turnstile HTTP failure',
    { verificationStatus: 503 },
    'verification_unavailable',
  ],
]) {
  test(`does not report success for ${name}`, async (t) => {
    const h = await harness(options);
    t.after(() => h.sqlite.close());
    const response = await h.route.POST(request());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, code });
    assert.equal(
      h.sqlite.prepare('SELECT COUNT(*) AS count FROM applications').get()
        .count,
      0,
    );
    assert.ok(!h.calls.includes('https://api.resend.com/emails'));
  });
}

for (const verification of [
  { success: false },
  { success: true, hostname: 'attacker.example', action: 'application' },
  { success: true, hostname: 'sauformula.org', action: 'contact' },
]) {
  test(`rejects invalid Turnstile evidence: ${JSON.stringify(verification)}`, async (t) => {
    const h = await harness({ verification });
    t.after(() => h.sqlite.close());
    const response = await h.route.POST(request());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, 'verification_failed');
    assert.ok(!h.calls.includes('database'));
  });
}

test('reports invalid fields and rejects malformed requests before external work', async (t) => {
  const h = await harness();
  t.after(() => h.sqlite.close());
  const response = await h.route.POST(
    request({
      ...validPayload,
      email: 'bad',
      motivation: 'short',
      departmentMotivation: 'x'.repeat(2001),
      secondaryTeam: 'powertrain',
      university: '__proto__',
    }),
  );
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.code, 'validation_failed');
  assert.deepEqual(result.fields.sort(), [
    'departmentMotivation',
    'email',
    'motivation',
    'secondaryTeam',
    'university',
  ]);
  for (const payload of [null, [], 'string']) {
    assert.equal(
      (await (await h.route.POST(request(payload))).json()).code,
      'invalid_request',
    );
  }
  assert.equal(
    (
      await h.route.POST(
        request(validPayload, { Origin: 'https://attacker.example' }),
      )
    ).status,
    403,
  );
  assert.equal(
    (await h.route.POST(request(validPayload, { 'Content-Length': '48001' })))
      .status,
    413,
  );
  assert.equal(
    (
      await (
        await h.route.POST(request({ ...validPayload, turnstileToken: '' }))
      ).json()
    ).code,
    'verification_required',
  );
  assert.deepEqual(h.calls, []);
});

test('historical email status remains readable alongside new panel-only records', async (t) => {
  const h = await harness();
  t.after(() => h.sqlite.close());
  await h.route.POST(request());
  h.sqlite.exec(
    "UPDATE applications SET email_delivery_status = 'sent', resend_email_id = 'old-email'",
  );
  await h.route.POST(request({ ...validPayload, email: 'new@example.com' }));
  const rows = await h.db.listApplications(h.database, {});
  assert.equal(rows.length, 2);
  assert.ok(
    rows.some(
      (row) =>
        row.emailDeliveryStatus === 'sent' && row.resendEmailId === 'old-email',
    ),
  );
  assert.ok(rows.some((row) => row.emailDeliveryStatus === 'not_required'));
});

test('department motivation is optional and legacy-style applications stay empty', async (t) => {
  const h = await harness();
  t.after(() => h.sqlite.close());
  const { departmentMotivation: _omitted, ...legacyStylePayload } = validPayload;
  const response = await h.route.POST(request(legacyStylePayload));
  assert.equal(response.status, 200);
  const [record] = await h.db.listApplications(h.database, {});
  assert.equal(record.departmentMotivation, '');
});

test('contact form continues to verify Turnstile and send through Resend', async (t) => {
  const h = await harness({ contact: true });
  t.after(() => h.sqlite.close());
  const response = await h.route.POST(
    request({
      name: 'Test Contact',
      email: 'contact@example.com',
      subject: 'Genel iletişim',
      message: 'A test contact message.',
      turnstileToken: validPayload.turnstileToken,
    }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.deepEqual(h.calls, [
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    'https://api.resend.com/emails',
  ]);
});

test('field feedback explains missing values, short answers and invalid URLs in both languages', async () => {
  const source = ts.transpileModule(
    readFileSync(path.join(root, 'lib/application-feedback.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.ESNext } },
  ).outputText;
  const feedback = await import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  );
  assert.equal(
    feedback.applicationFieldError(
      { value: '  ', required: true, type: 'text' },
      'tr',
    ),
    'Bu alan zorunludur.',
  );
  assert.match(
    feedback.applicationFieldError(
      { value: 'short', required: true, type: 'textarea', minLength: 20 },
      'en',
    ),
    /20 characters/,
  );
  assert.match(
    feedback.applicationFieldError(
      { value: 'ftp://example.com', required: false, type: 'url' },
      'tr',
    ),
    /https/,
  );
  assert.equal(
    feedback.applicationFieldError(
      { value: '', required: false, type: 'url' },
      'en',
    ),
    '',
  );
  assert.match(
    feedback.applicationErrorMessage('storage_failed', 'tr'),
    /kaydedilemedi/,
  );
  assert.match(
    feedback.applicationErrorMessage('unknown-code', 'en'),
    /unexpected response/,
  );
});
