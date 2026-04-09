#!/usr/bin/env node
/**
 * Seed script for Vitaway Employee Dashboard
 *
 * Creates many random test employee accounts via the employer API, then logs in
 * as each employee to configure consent settings and profile data.
 *
 * Usage:
 *   npm run seed                       # create accounts + seed consent for all
 *   npm run seed:account               # create accounts only
 *   npm run seed:consent               # seed consent (accounts must already exist)
 *   npm run seed -- --count 50         # how many test employees to create (default 50)
 *   npm run seed -- --dry-run          # preview without making requests
 *   npm run seed -- --concurrency 8    # parallel requests (default 5)
 *
 * Required env vars (loaded from .env automatically):
 *   NEXT_PUBLIC_API_BASE_URL    - e.g. http://127.0.0.1:8000
 *   SEED_ORG_ADMIN_EMAIL        - org admin email (to create employees via employer API)
 *   SEED_ORG_ADMIN_PASSWORD     - org admin password
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const COMMAND     = args.find((a) => !a.startsWith('--')) ?? 'all';

function getFlag(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] !== undefined ? Number(args[i + 1]) : def;
}

const COUNT       = getFlag('count', 50);
const CONCURRENCY = getFlag('concurrency', 5);

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = value;
    }
  } catch { /* rely on process.env */ }
}

loadEnv();

const RAW_BASE         = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const BACKEND_BASE     = RAW_BASE.replace(/\/api\/organization\/?$/, '');
const ORG_API_BASE     = `${BACKEND_BASE}/api/organization`;
const EMP_API_BASE     = `${BACKEND_BASE}/api/organization/employee`;

const ORG_ADMIN_EMAIL    = process.env.SEED_ORG_ADMIN_EMAIL    ?? '';
const ORG_ADMIN_PASSWORD = process.env.SEED_ORG_ADMIN_PASSWORD ?? '';
const DEFAULT_PASSWORD   = 'Seed@Pass2024!';

// ─── Random helpers ───────────────────────────────────────────────────────────
function rand(arr)         { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randPhone() {
  const pfx = ['+250781','+250788','+250722','+250733','+250790','+250791','+250792'];
  return `${rand(pfx)}${String(randInt(100000, 999999))}`;
}

// ─── Name pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Amara','Amina','Ange','Axel','Beatrice','Boris','Brigitte','Bruno','Celestine','Claude',
  'Daniel','Diana','Diane','Didier','Emmanuel','Esther','Fabrice','Fiona','Florent','Francine',
  'Gabriel','Giselle','Grace','Gregoire','Hassan','Henriette','Ingrid','Isabelle','Jacques','Jean',
  'Jerome','Joelle','Jonathan','Josiane','Jules','Julien','Kamila','Kevin','Laetitia','Laurent',
  'Leila','Lionel','Lucia','Luc','Marie','Martin','Maxime','Mireille','Mohamed','Monique',
  'Nadine','Nathan','Nicolas','Noel','Olive','Pascal','Patrick','Paul','Pauline','Peter',
  'Pierre','Rachel','Raissa','Rebecca','Richard','Rose','Samuel','Sandra','Sarah','Simone',
  'Sophie','Steve','Sylvie','Thomas','Tina','Valerie','Victor','Vincent','Wycliffe','Yvette',
  'Aigerim','Aryan','Bongani','Chiamaka','Dipika','Elias','Fatou','Gareth','Hamid','Inaya',
  'Jana','Kwame','Lila','Mila','Nora','Omar','Priya','Qais','Rania','Soren',
  'Aaliya','Aaron','Abby','Abel','Abena','Abigail','Abram','Adaeze','Adaora','Adele',
  'Aden','Adina','Aditi','Adnan','Adom','Adwoa','Afia','Afua','Agnes','Aisha',
];

const LAST_NAMES = [
  'Bizimana','Hakizimana','Habimana','Ndayisaba','Nshimiyimana','Uwimana','Mukamana','Uwase',
  'Ntirushekwa','Murenzi','Gahire','Kaberuka','Kayitare','Mugabe','Rutaganda','Gasana',
  'Nkurunziza','Cyusa','Ingabire','Ndagijimana','Mutabazi','Uzabakiriho','Mutuyimana',
  'Johnson','Williams','Brown','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White',
  'Harris','Martin','Garcia','Martinez','Robinson','Clark','Lewis','Lee','Walker','Hall',
  'Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams',
  'Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell',
  'Patel','Shah','Kumar','Singh','Sharma','Gupta','Ali','Khan','Hussain','Ahmed',
  'Okafor','Osei','Mensah','Asante','Owusu','Boateng','Acheampong','Antwi','Adjei','Amoah',
  'Kimura','Tanaka','Suzuki','Watanabe','Inoue','Yamamoto','Nakamura','Kobayashi',
  'Dupont','Durand','Bernard','Lambert','Simon','Michel','Lefebvre','Leroy','Moreau','David',
  'Mueller','Schmidt','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch',
];

// ─── Employee generator ───────────────────────────────────────────────────────
const usedEmails = new Set();

function generateEmployee(idx) {
  const first = rand(FIRST_NAMES);
  const last  = rand(LAST_NAMES);
  let email;
  let attempt = 0;
  do {
    email = `${first.toLowerCase()}${attempt > 0 ? attempt : ''}.${last.toLowerCase()}${randInt(1, 9999)}@vitaway-seed.com`;
    attempt++;
  } while (usedEmails.has(email));
  usedEmails.add(email);

  return {
    firstname:           first,
    lastname:            last,
    email,
    phone:               randPhone(),
    employee_identifier: `SEED-EMP-${String(idx + 1).padStart(5, '0')}`,
    password:            DEFAULT_PASSWORD,
  };
}

// All consent types supported by the employee dashboard
const ALL_CONSENT_TYPES = ['health_data','vitals','assessments','appointments','goals','programs'];

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function httpRequest(method, url, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  return { ok: res.ok, status: res.status, data };
}

const post = (url, body, token) => httpRequest('POST', url, body, token);
const put  = (url, body, token) => httpRequest('PUT',  url, body, token);

// ─── Concurrency pool ─────────────────────────────────────────────────────────
async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function progress(current, total, label) {
  const pct = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  const txt = `  [${bar}] ${String(current).padStart(String(total).length)}/${total}  ${String(pct).padStart(3)}%  ${label.slice(0, 40).padEnd(40)}`;
  process.stdout.write(`\r${txt}`);
}

// ─── Logger ───────────────────────────────────────────────────────────────────
const c = { reset:'\x1b[0m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', cyan:'\x1b[36m', bold:'\x1b[1m', dim:'\x1b[2m' };

function ok(msg)     { process.stdout.write(`${c.green}✓${c.reset} ${msg}\n`); }
function warn(msg)   { process.stdout.write(`${c.yellow}⚠${c.reset} ${msg}\n`); }
function fail(msg)   { process.stdout.write(`${c.red}✗${c.reset} ${msg}\n`); }
function info(msg)   { process.stdout.write(`${c.cyan}→${c.reset} ${msg}\n`); }
function section(t)  { process.stdout.write(`\n${c.bold}${t}${c.reset}\n`); }

// ─── Authenticate as org admin ────────────────────────────────────────────────
async function authenticateAsAdmin() {
  if (!ORG_ADMIN_EMAIL || !ORG_ADMIN_PASSWORD) {
    process.stderr.write(`${c.red}✗${c.reset} Missing SEED_ORG_ADMIN_EMAIL or SEED_ORG_ADMIN_PASSWORD in .env\n`);
    process.exit(1);
  }

  info(`Authenticating org admin as ${ORG_ADMIN_EMAIL} …`);
  if (DRY_RUN) { ok('[dry-run] skipped'); return '__dry_run__'; }

  const { ok: success, status, data } = await post(`${ORG_API_BASE}/auth/login`, {
    email: ORG_ADMIN_EMAIL,
    password: ORG_ADMIN_PASSWORD,
  });

  if (!success) {
    process.stderr.write(`${c.red}✗${c.reset} Admin login failed (${status}): ${data?.message ?? 'unknown'}\n`);
    process.exit(1);
  }

  const token = data?.data?.token ?? data?.token ?? data?.access_token;
  if (!token) {
    process.stderr.write(`${c.red}✗${c.reset} Login OK but no token returned\n`);
    process.exit(1);
  }

  ok('Org admin authenticated');
  return token;
}

// ─── Create employee accounts ─────────────────────────────────────────────────
async function createEmployeeAccounts(adminToken) {
  section(`Creating ${COUNT} Employee Accounts  (concurrency=${CONCURRENCY})`);

  const employees = Array.from({ length: COUNT }, (_, i) => generateEmployee(i));
  let done = 0;
  const created = [];

  const tasks = employees.map((emp) => async () => {
    progress(++done, COUNT, `${emp.firstname} ${emp.lastname}`);
    if (DRY_RUN) return emp;

    const { ok: success, status, data } = await post(`${ORG_API_BASE}/employees`, emp, adminToken);
    if (success) {
      const id = data?.data?.id ?? data?.id ?? '?';
      created.push({ ...emp, id });
      return { ...emp, id };
    }
    if (status === 422) return null; // already exists
    process.stdout.write('\n');
    fail(`${emp.email} (${status}): ${data?.message ?? 'unknown'}`);
    return null;
  });

  await runPool(tasks, CONCURRENCY);
  process.stdout.write('\n');
  info(`Accounts created: ${created.length}`);
  return created;
}

// ─── Seed consent for a single employee ───────────────────────────────────────
async function seedConsentForEmployee(emp) {
  // Login as employee
  const loginRes = await post(`${EMP_API_BASE}/auth/login`, {
    email: emp.email,
    password: DEFAULT_PASSWORD,
  });
  if (!loginRes.ok) return false;

  const empToken = loginRes.data?.data?.access_token ?? loginRes.data?.access_token ?? loginRes.data?.token;
  if (!empToken) return false;

  // Set all consent categories
  for (const consentType of ALL_CONSENT_TYPES) {
    await put(
      `${EMP_API_BASE}/consent/settings`,
      { consent_type: consentType, employer_visibility: consentType !== 'appointments' },
      empToken,
    );
  }

  // Update profile preferences
  await put(
    `${EMP_API_BASE}/profile`,
    {
      phone: emp.phone,
      preferences: { notifications_email: true, notifications_push: true, language: 'en' },
    },
    empToken,
  );

  return true;
}

// ─── Seed consent for all employees ──────────────────────────────────────────
async function seedConsentForAll(employees) {
  section(`Seeding Consent & Profile for ${employees.length} Employees  (concurrency=${CONCURRENCY})`);

  let done = 0;
  let ok_count = 0;

  const tasks = employees.map((emp) => async () => {
    progress(++done, employees.length, emp.email);
    if (DRY_RUN) { ok_count++; return; }
    const result = await seedConsentForEmployee(emp);
    if (result) ok_count++;
  });

  await runPool(tasks, CONCURRENCY);
  process.stdout.write('\n');
  info(`Consent seeded for ${ok_count}/${employees.length} employees`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function printSummary(employees) {
  section('Seed Summary');
  process.stdout.write(`  ${c.dim}Total employees seeded: ${c.reset}${c.cyan}${employees.length}${c.reset}\n`);
  process.stdout.write(`  ${c.dim}Password (all):         ${c.reset}${c.cyan}${DEFAULT_PASSWORD}${c.reset}\n`);
  if (employees.length > 0) {
    process.stdout.write(`\n  ${c.dim}Sample logins:${c.reset}\n`);
    employees.slice(0, 3).forEach((e) => {
      process.stdout.write(`    ${c.cyan}${e.email}${c.reset}\n`);
    });
    if (employees.length > 3) {
      process.stdout.write(`    ${c.dim}… and ${employees.length - 3} more${c.reset}\n`);
    }
  }
  process.stdout.write('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  process.stdout.write(`\n${c.bold}${c.cyan}Vitaway Employee Seed Script${c.reset}\n`);
  process.stdout.write(`${c.dim}Backend    : ${BACKEND_BASE}${c.reset}\n`);
  process.stdout.write(`${c.dim}Employees  : ${COUNT}  Concurrency: ${CONCURRENCY}${c.reset}\n`);
  if (DRY_RUN) process.stdout.write(`${c.yellow}Mode: DRY RUN — no data will be written${c.reset}\n`);

  switch (COMMAND) {
    case 'account': {
      const adminToken = await authenticateAsAdmin();
      const employees  = await createEmployeeAccounts(adminToken);
      printSummary(employees);
      break;
    }
    case 'consent': {
      // Consent-only mode: re-generate the same deterministic employees list
      // (same seed index → same identifier) and attempt consent for each
      const employees = Array.from({ length: COUNT }, (_, i) => generateEmployee(i));
      await seedConsentForAll(employees);
      break;
    }
    case 'all':
    default: {
      const adminToken = await authenticateAsAdmin();
      const employees  = await createEmployeeAccounts(adminToken);
      if (employees.length) await seedConsentForAll(employees);
      printSummary(employees);
    }
  }

  process.stdout.write(`\n${c.green}${c.bold}Done.${c.reset}\n\n`);
}

main().catch((err) => {
  process.stderr.write(`\n${c.red}✗ Unexpected error: ${err.message}${c.reset}\n`);
  process.exit(1);
});
