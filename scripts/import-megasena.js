#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const Database = require('better-sqlite3');
const AdmZip = require('adm-zip');

const CAIXA_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';
const CAIXA_PAGE = 'https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx';
const FALLBACK_ASSETS_CSV = path.resolve(process.cwd(), 'assets', 'base_hitorica.csv');

const BASEDOSDADOS_URL = process.env.BASEDOSDADOS_MEGASENA_URL || null;

function parseArgs(argv) {
  const args = {
    db: path.resolve(process.cwd(), 'data', 'megasena.sqlite'),
    url: null,
    source: 'auto', // auto|file|zip|api
    lastN: 300,
    fromContest: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--db' && next) {
      args.db = path.resolve(process.cwd(), next);
      i += 1;
    } else if (a === '--url' && next) {
      args.url = next;
      i += 1;
    } else if (a === '--source' && next) {
      args.source = next;
      i += 1;
    } else if (a === '--lastN' && next) {
      args.lastN = Number(next);
      i += 1;
    } else if (a === '--fromContest' && next) {
      args.fromContest = Number(next);
      i += 1;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    }
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toInt(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function toISOFromBR(dateBR) {
  if (!dateBR) return '';
  const m = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(String(dateBR).trim());
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function normalizeNumbers(arr) {
  if (!Array.isArray(arr)) return null;
  const nums = [];
  for (const v of arr) {
    const n = toInt(v);
    if (n == null) continue;
    if (n >= 1 && n <= 60) nums.push(n);
  }
  const unique = Array.from(new Set(nums));
  unique.sort((a, b) => a - b);
  return unique.length >= 6 ? unique.slice(0, 6) : null;
}

function normalizeDraw(obj) {
  if (!obj || typeof obj !== 'object') return null;

  const keys = Object.keys(obj);
  const findByKeyIncludes = (needle) => {
    const lowerNeedle = String(needle).toLowerCase();
    const k = keys.find((x) => String(x).toLowerCase().includes(lowerNeedle));
    return k ? obj[k] : undefined;
  };

  const contest =
    toInt(obj.contest) ??
    toInt(obj.concurso) ??
    toInt(obj.numero) ??
    toInt(obj.Concurso) ??
    toInt(findByKeyIncludes('concurso'));

  const dateISO =
    (typeof obj.dateISO === 'string' && obj.dateISO) ||
    toISOFromBR(obj.dataApuracao) ||
    toISOFromBR(obj.data) ||
    (typeof obj.date === 'string' ? obj.date : '') ||
    '';

  const numbers =
    normalizeNumbers(obj.numbers) ||
    normalizeNumbers(obj.listaDezenas) ||
    normalizeNumbers(obj.dezenas) ||
    normalizeNumbers(obj.resultado) ||
    normalizeNumbers(obj['Bola1'] ? [obj['Bola1'], obj['Bola2'], obj['Bola3'], obj['Bola4'], obj['Bola5'], obj['Bola6']] : null);

  if (contest == null || !numbers) return null;
  return { contest, dateISO, numbers };
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json,text/plain,*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return await res.json();
}

async function downloadText(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'text/csv,application/json,text/plain,*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return await res.text();
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/zip,application/octet-stream,*/*',
      'User-Agent': 'site_jogos_import/1.0',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }

  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function downloadHtml(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html,*/*',
      'User-Agent': 'site_jogos_import/1.0',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return await res.text();
}

function decodeHtmlEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractZipLinksFromHtml(html) {
  const links = [];
  const re = /href\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeHtmlEntities(m[1]);
    if (href && href.toLowerCase().includes('.zip')) {
      links.push(href);
    }
  }
  return links;
}

function scoreZipUrl(url) {
  const u = String(url).toLowerCase();
  let score = 0;
  if (u.includes('result')) score += 5; // resultados/result
  if (u.includes('mega')) score += 5;
  if (u.includes('sena')) score += 2;
  if (u.endsWith('.zip') || u.includes('.zip?')) score += 2;
  return score;
}

async function findOfficialZipUrl() {
  const html = await downloadHtml(CAIXA_PAGE);
  const hrefs = extractZipLinksFromHtml(html);
  if (!hrefs.length) return null;

  const absolute = hrefs
    .map((h) => {
      try {
        return new URL(h, CAIXA_PAGE).href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!absolute.length) return null;

  // Must contain 'Resultados' and '.zip' per requirement (case-insensitive).
  const required = absolute.filter((u) => /resultados/i.test(u) && /\.zip/i.test(u));
  const candidates = required.length ? required : absolute;

  candidates.sort((a, b) => scoreZipUrl(b) - scoreZipUrl(a));
  return candidates[0] || null;
}

function pickZipEntry(entries) {
  const files = entries
    .filter((e) => !e.isDirectory)
    .map((e) => ({
      name: e.entryName,
      size: e.getData().length,
      entry: e,
    }));

  const wanted = files.filter((f) => /\.(csv|json)$/i.test(f.name));
  const list = wanted.length ? wanted : files;
  list.sort((a, b) => b.size - a.size);
  return list[0]?.entry ?? null;
}

function tryParseCsv(text, delimiter) {
  const res = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    delimiter: delimiter || undefined,
  });
  return res;
}

async function loadFromCaixaApi({ lastN, fromContest }) {
  const latestPayload = await fetchJson(CAIXA_BASE);
  const latest = fromContest ?? latestPayload.numero;
  if (!Number.isFinite(latest)) throw new Error('Could not determine latest contest number');

  const start = Math.max(1, latest - (lastN - 1));
  const draws = [];

  // Simple sequential fetch (reliable). Increase later if you want concurrency.
  for (let c = latest; c >= start; c -= 1) {
    try {
      const payload = await fetchJson(`${CAIXA_BASE}/${c}`);
      const d = normalizeDraw(payload);
      if (d) draws.push(d);
    } catch {
      // ignore missing/failed contests
    }
  }

  draws.sort((a, b) => b.contest - a.contest);
  return draws;
}

function loadFromJsonText(text) {
  const parsed = JSON.parse(text);
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.draws)
      ? parsed.draws
      : Array.isArray(parsed?.resultados)
        ? parsed.resultados
        : Array.isArray(parsed?.concursos)
          ? parsed.concursos
          : [];

  const draws = [];
  for (const it of items) {
    const d = normalizeDraw(it);
    if (d) draws.push(d);
  }

  draws.sort((a, b) => b.contest - a.contest);
  return draws;
}

function loadFromCsvText(text) {
  // Caixa historical exports are often ';' separated.
  const resSemi = tryParseCsv(text, ';');
  const resComma = tryParseCsv(text, ',');
  const res = (Array.isArray(resSemi.data) && resSemi.data.length > 1) ? resSemi : resComma;

  if (res.errors && res.errors.length) {
    // Not fatal; many CSVs still parse fine.
    // console.warn(res.errors);
  }

  const rows = Array.isArray(res.data) ? res.data : [];
  const draws = [];

  for (const row of rows) {
    const d = normalizeDraw(row);
    if (d) draws.push(d);

    // Common Caixa CSV layout also uses columns for each ball.
    if (!d) {
      const maybe = normalizeDraw({
        ...row,
        Bola1: row.Bola1 ?? row.bola1 ?? row['Bola 1'],
        Bola2: row.Bola2 ?? row.bola2 ?? row['Bola 2'],
        Bola3: row.Bola3 ?? row.bola3 ?? row['Bola 3'],
        Bola4: row.Bola4 ?? row.bola4 ?? row['Bola 4'],
        Bola5: row.Bola5 ?? row.bola5 ?? row['Bola 5'],
        Bola6: row.Bola6 ?? row.bola6 ?? row['Bola 6'],
      });
      if (maybe) draws.push(maybe);
    }
  }

  draws.sort((a, b) => b.contest - a.contest);
  return draws;
}

async function loadFromCaixaZipOrFallbackFile() {
  try {
    console.log(`Procurando link .zip oficial na página da Caixa...`);
    const zipUrl = await findOfficialZipUrl();
    if (!zipUrl) throw new Error('Não foi possível localizar um link .zip na página');

    console.log(`Baixando ZIP: ${zipUrl}`);
    const buf = await downloadBuffer(zipUrl);
    const zip = new AdmZip(buf);
    const entry = pickZipEntry(zip.getEntries());
    if (!entry) throw new Error('ZIP não contém CSV/JSON reconhecível');

    const raw = entry.getData();
    const utf8 = raw.toString('utf8');
    const looksJson = entry.entryName.toLowerCase().endsWith('.json') || utf8.trim().startsWith('{') || utf8.trim().startsWith('[');
    let draws = looksJson ? loadFromJsonText(utf8) : loadFromCsvText(utf8);

    if (!draws.length) {
      // Some exports come in latin1.
      const latin1 = raw.toString('latin1');
      draws = looksJson ? loadFromJsonText(latin1) : loadFromCsvText(latin1);
    }

    return draws;
  } catch (e) {
    console.warn(`Falhou baixar ZIP oficial: ${e?.message ?? e}`);
  }

  // Fallback file in assets/
  try {
    if (fs.existsSync(FALLBACK_ASSETS_CSV)) {
      console.log(`Usando fallback local: ${FALLBACK_ASSETS_CSV}`);
      const raw = fs.readFileSync(FALLBACK_ASSETS_CSV);
      const utf8 = raw.toString('utf8');
      let draws = loadFromCsvText(utf8);
      if (!draws.length) {
        const latin1 = raw.toString('latin1');
        draws = loadFromCsvText(latin1);
      }
      return draws;
    }
  } catch (e) {
    console.warn(`Falhou fallback local: ${e?.message ?? e}`);
  }

  return [];
}

async function loadFromPlanBMirrors() {
  // Plano B: Base dos Dados (optional) or GitHub mirror
  if (BASEDOSDADOS_URL) {
    try {
      console.log(`Tentando Base dos Dados: ${BASEDOSDADOS_URL}`);
      const json = await fetchJson(BASEDOSDADOS_URL);
      const text = JSON.stringify(json);
      const draws = loadFromJsonText(text);
      if (draws.length) return draws;
    } catch (e) {
      console.warn(`Falhou Base dos Dados: ${e?.message ?? e}`);
    }
  }

  const ghUrls = [
    'https://raw.githubusercontent.com/deividfortuna/loterias-caixa/master/megasena.json',
    'https://raw.githubusercontent.com/deividfortuna/loterias-caixa/master/mega-sena.json',
  ];

  for (const url of ghUrls) {
    try {
      console.log(`Tentando espelho GitHub: ${url}`);
      const json = await fetchJson(url);
      const text = JSON.stringify(json);
      const draws = loadFromJsonText(text);
      if (draws.length) return draws;
    } catch (e) {
      console.warn(`Falhou espelho GitHub: ${e?.message ?? e}`);
    }
  }

  return [];
}

function initDb(db) {
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS megasena_draws (
      contest INTEGER PRIMARY KEY,
      dateISO TEXT NOT NULL,
      n1 INTEGER NOT NULL,
      n2 INTEGER NOT NULL,
      n3 INTEGER NOT NULL,
      n4 INTEGER NOT NULL,
      n5 INTEGER NOT NULL,
      n6 INTEGER NOT NULL,
      numbersJson TEXT NOT NULL
    );
  `);
}

function upsertDraws(db, draws) {
  const stmt = db.prepare(
    `INSERT INTO megasena_draws (contest, dateISO, n1, n2, n3, n4, n5, n6, numbersJson)
     VALUES (@contest, @dateISO, @n1, @n2, @n3, @n4, @n5, @n6, @numbersJson)
     ON CONFLICT(contest) DO UPDATE SET
       dateISO=excluded.dateISO,
       n1=excluded.n1,
       n2=excluded.n2,
       n3=excluded.n3,
       n4=excluded.n4,
       n5=excluded.n5,
       n6=excluded.n6,
       numbersJson=excluded.numbersJson
    `,
  );

  const tx = db.transaction((items) => {
    for (const d of items) {
      stmt.run({
        contest: d.contest,
        dateISO: d.dateISO || '',
        n1: d.numbers[0],
        n2: d.numbers[1],
        n3: d.numbers[2],
        n4: d.numbers[3],
        n5: d.numbers[4],
        n6: d.numbers[5],
        numbersJson: JSON.stringify(d.numbers),
      });
    }
  });

  tx(draws);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`\nUso:\n  node scripts/import-megasena.js [--db ./data/megasena.sqlite] [--url <arquivo.csv|arquivo.json|arquivo.zip>] [--source auto|file|zip|api] [--lastN 300] [--fromContest 2955]\n\nNotas:\n- source=auto (default): tenta baixar o ZIP oficial descobrindo o link na página da Caixa; se falhar usa ./assets/base_hitorica.csv; se falhar usa API (servicebus2).\n- source=file: usa --url (CSV/JSON/ZIP).\n- source=zip: ignora --url e sempre tenta ZIP oficial + fallback local.\n- source=api: baixa via API oficial da Caixa.\n`);
    process.exit(0);
  }

  ensureDir(path.dirname(args.db));
  const db = new Database(args.db);
  initDb(db);

  let draws = [];

  const wantFile = args.source === 'file' || (args.source === 'auto' && !!args.url);

  if (wantFile) {
    if (!args.url) throw new Error('Missing --url for --source file');

    console.log(`Baixando arquivo: ${args.url}`);
    const lower = args.url.toLowerCase();

    if (lower.includes('.zip')) {
      const buf = await downloadBuffer(args.url);
      const zip = new AdmZip(buf);
      const entry = pickZipEntry(zip.getEntries());
      if (!entry) throw new Error('ZIP não contém CSV/JSON reconhecível');
      const raw = entry.getData();
      const text = raw.toString('utf8');
      const looksJson = entry.entryName.toLowerCase().endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[');
      draws = looksJson ? loadFromJsonText(text) : loadFromCsvText(text);
      if (!draws.length) {
        const latin1 = raw.toString('latin1');
        draws = looksJson ? loadFromJsonText(latin1) : loadFromCsvText(latin1);
      }
    } else {
      const text = await downloadText(args.url);
      const looksJson = lower.includes('.json') || text.trim().startsWith('{') || text.trim().startsWith('[');
      draws = looksJson ? loadFromJsonText(text) : loadFromCsvText(text);
    }

    if (!draws.length) {
      console.warn('Nenhum concurso válido encontrado no arquivo; tentando API...');
      draws = await loadFromCaixaApi({ lastN: args.lastN, fromContest: args.fromContest });
    }
  } else if (args.source === 'zip' || args.source === 'auto') {
    // Tentativa Principal: Caixa (scraper/ZIP)
    draws = await loadFromCaixaZipOrFallbackFile();

    // Plano B: Base dos Dados ou espelho GitHub
    if (!draws.length) {
      draws = await loadFromPlanBMirrors();
    }

    // Plano C local: assets/base_hitorica.csv já foi tentado dentro do loader de ZIP.
    // Se ainda falhar: API oficial.
    if (!draws.length) {
      console.warn('Nenhum concurso válido encontrado (Caixa/BD/GitHub/Local); tentando API...');
      draws = await loadFromCaixaApi({ lastN: args.lastN, fromContest: args.fromContest });
    }
  } else {
    console.log(`Baixando via API oficial da Caixa (últimos ${args.lastN})...`);
    draws = await loadFromCaixaApi({ lastN: args.lastN, fromContest: args.fromContest });
  }

  upsertDraws(db, draws);

  const count = db.prepare('SELECT COUNT(*) as c FROM megasena_draws').get().c;
  const newest = db.prepare('SELECT contest, dateISO FROM megasena_draws ORDER BY contest DESC LIMIT 1').get();
  const oldest = db.prepare('SELECT contest, dateISO FROM megasena_draws ORDER BY contest ASC LIMIT 1').get();

  console.log(`Import concluído: ${draws.length} concursos processados.`);
  console.log(`DB: ${args.db}`);
  console.log(`Total no DB: ${count}`);
  console.log(`Mais recente: ${newest?.contest} (${newest?.dateISO})`);
  console.log(`Mais antigo: ${oldest?.contest} (${oldest?.dateISO})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
