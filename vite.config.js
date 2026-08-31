import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

// ─── ENV LOADER ─────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '.env')
    const content = readFileSync(envPath, 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim()
    }
    return env
  } catch { return {} }
}

// ─── DB HELPER ───────────────────────────────────────────────────────────────
async function getDbClient() {
  const ENV = loadEnv()
  const { Client } = await import('pg')
  const dbUrl = ENV.DATABASE_URL.replace(/[?&]channel_binding=[^&]*/g, '')
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  return client
}

// ─── SEED / MIGRATE on startup ───────────────────────────────────────────────
async function seedDatabase() {
  let client
  try {
    client = await getDbClient()

    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id          VARCHAR(10)  PRIMARY KEY,
        workflow    VARCHAR(100) NOT NULL,
        type        VARCHAR(100) NOT NULL,
        name        VARCHAR(100) NOT NULL,
        start_time  VARCHAR(20),
        end_time    VARCHAR(20),
        runtime     VARCHAR(50),
        status      VARCHAR(20)  NOT NULL,
        team        VARCHAR(100),
        environment VARCHAR(50),
        job_date    DATE,
        has_ai_fix  BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMPTZ  DEFAULT NOW()
      )
    `)

    const { rows: existing } = await client.query('SELECT COUNT(*) as cnt FROM jobs')
    if (parseInt(existing[0].cnt) === 0) {
      const JOBS = [
        ['j1','ETL Pipelines','Kafka → Snowflake','payments-etl-daily',    '06:00:00',null,        '1h 24m',    'running','Data Engineering',    'Production','2024-05-20',false],
        ['j2','BigQuery Jobs', 'BigQuery ML',      'risk-score-batch',       '04:10:00','05:48:00', '38m 14s',   'success','Analytics',            'Production','2024-05-21',false],
        ['j3','ETL Pipelines','CRM → DW',          'customer-sync-api',      '08:14:00','08:14:32', '32s',       'failed', 'Customer Support',     'Production','2024-05-20',true ],
        ['j4','Batch Reports','PostgreSQL',         'inventory-recon-nightly','04:00:00',null,        '2h 14m',    'warning','Finance',              'Production','2024-05-22',false],
        ['j5','Kafka Streams','Real-time',          'fraud-detection-stream', '00:00:00',null,        'Continuous','running','Machine Learning',     'Production','2024-05-23',false],
        ['j6','BigQuery Jobs','BigQuery SQL',        'bq-revenue-report',      '08:14:00','08:14:32', '32s',       'failed', 'Product',              'Production','2024-05-24',true ],
        ['j7','Airflow DAGs', 'Airflow',            'airflow-dag-reports',    '07:00:00',null,        '48m',       'warning','Operations',           'Production','2024-05-25',false],
        ['j8','Batch Reports','Airflow DAG',        'report-gen-monthly',     null,       null,        null,        'queued', 'Marketing',            'UAT',        '2024-05-26',false],
        ['j9','ETL Pipelines','REST API → BQ',      'supplier-data-sync',     '05:30:00','06:14:00', '44m 12s',   'success','Platform Engineering', 'Production','2024-05-27',false],
      ]
      for (const row of JOBS) {
        await client.query(
          `INSERT INTO jobs (id,workflow,type,name,start_time,end_time,runtime,status,team,environment,job_date,has_ai_fix)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
          row
        )
      }
      console.log('[NexaOps] ✅ Seeded', JOBS.length, 'jobs into NeonDB')
    } else {
      // Always distribute statuses on startup for realistic dev data
      await client.query(`
        UPDATE jobs SET
          status = (ARRAY['failed','failed','warning','running','success','success','success','running','warning','success'])[floor(random()*10+1)],
          has_ai_fix = false
      `)
      await client.query(`UPDATE jobs SET has_ai_fix = true WHERE status = 'failed'`)
      console.log('[NexaOps] ✅ Distributed job statuses across failed/running/success/warning')
      console.log('[NexaOps] ✅ NeonDB ready —', existing[0].cnt, 'jobs in database')
    }
  } catch (e) {
    console.error('[NexaOps] ⚠️  DB seed error:', e.message)
  } finally {
    client?.end()
  }
}

// ─── READ BODY ───────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch(e) { reject(e) } })
    req.on('error', reject)
  })
}

// ─── API ROUTER (port 8000) ──────────────────────────────────────────────────
async function routeApi(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname
  const method = req.method

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  let client
  try {
    // ── AUTH ──────────────────────────────────────────────────────────────
    if (path === '/auth/login' && method === 'POST') {
      res.writeHead(200)
      res.end(JSON.stringify({ access_token: 'nexaops-dev-token', token_type: 'bearer', user: { name: 'Developer', email: 'dev@nexaops.io' } }))
      return
    }
    if (path === '/auth/me' && method === 'GET') {
      res.writeHead(200)
      res.end(JSON.stringify({ name: 'Developer', email: 'dev@nexaops.io', role: 'admin' }))
      return
    }
    if (path === '/auth/register' && method === 'POST') {
      res.writeHead(200)
      res.end(JSON.stringify({ access_token: 'nexaops-dev-token', token_type: 'bearer' }))
      return
    }

    // ── JOBS ─────────────────────────────────────────────────────────────
    client = await getDbClient()

    if (path === '/jobs/summary' && method === 'GET') {
      const { rows } = await client.query(`SELECT status, COUNT(*) as count FROM jobs GROUP BY status`)
      const counts = rows.reduce((a, r) => { a[r.status] = parseInt(r.count); return a }, {})
      const total = Object.values(counts).reduce((s, n) => s + n, 0)
      res.writeHead(200)
      res.end(JSON.stringify({ total, running: counts.running||0, failed: counts.failed||0, succeeded: counts.success||0, sla_risk: counts.warning||0, queued: counts.queued||0 }))
      return
    }

    if (path === '/jobs' && method === 'GET') {
      const status = url.searchParams.get('status')
      const limit  = parseInt(url.searchParams.get('limit') || '100')
      let q = 'SELECT * FROM jobs'
      const params = []
      if (status) { q += ' WHERE status = $1'; params.push(status) }
      q += ` ORDER BY job_date DESC LIMIT $${params.length + 1}`
      params.push(limit)
      const { rows } = await client.query(q, params)
      const jobs = rows.map(r => ({
        id: r.id, workflow: r.workflow, type: r.type, name: r.name,
        start: r.start_time, end: r.end_time, runtime: r.runtime, status: r.status,
        team: r.team, environment: r.environment, jobDate: r.job_date,
        hasAiFix: r.has_ai_fix
      }))
      res.writeHead(200)
      res.end(JSON.stringify({ jobs, total: jobs.length }))
      return
    }

    const jobMatch = path.match(/^\/jobs\/([^/]+)$/)
    if (jobMatch && method === 'GET') {
      const { rows } = await client.query('SELECT * FROM jobs WHERE id = $1', [jobMatch[1]])
      if (!rows.length) { res.writeHead(404); res.end(JSON.stringify({ error: 'Job not found' })); return }
      const r = rows[0]
      res.writeHead(200)
      res.end(JSON.stringify({ id: r.id, workflow: r.workflow, type: r.type, name: r.name, start: r.start_time, end: r.end_time, runtime: r.runtime, status: r.status, team: r.team, environment: r.environment }))
      return
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────
    if (path === '/dashboard/summary' && method === 'GET') {
      const { rows: counts } = await client.query(`SELECT status, COUNT(*) as c FROM jobs GROUP BY status`)
      const byStatus = counts.reduce((a, r) => { a[r.status] = parseInt(r.c); return a }, {})
      const total = Object.values(byStatus).reduce((s, n) => s + n, 0)
      res.writeHead(200)
      res.end(JSON.stringify({
        total_jobs: total,
        running: byStatus.running || 0,
        failed: byStatus.failed || 0,
        succeeded: byStatus.success || 0,
        sla_risk: byStatus.warning || 0,
        queued: byStatus.queued || 0,
        success_rate: total > 0 ? (((byStatus.success||0) / total) * 100).toFixed(1) + '%' : '0%',
        active_workflows: total,
        cloud_cost: 42800,
        avg_runtime_mins: 47,
        failed_today: byStatus.failed || 0,
        ai_fixes_applied: 2
      }))
      return
    }

    if (path === '/dashboard/status-breakdown' && method === 'GET') {
      const { rows } = await client.query(`SELECT status, COUNT(*) as count FROM jobs GROUP BY status ORDER BY count DESC`)
      res.writeHead(200)
      res.end(JSON.stringify(rows.map(r => ({ status: r.status, count: parseInt(r.count) }))))
      return
    }

    if (path === '/dashboard/active-alerts' && method === 'GET') {
      const { rows } = await client.query(`SELECT * FROM jobs WHERE status IN ('failed','warning') ORDER BY job_date DESC`)
      res.writeHead(200)
      res.end(JSON.stringify({ alerts: rows.map(r => ({
        id: r.id, job: r.name, workflow: r.workflow, status: r.status,
        runtime: r.runtime, hasAiFix: r.has_ai_fix,
        message: r.status === 'failed' ? `Job ${r.name} failed${r.has_ai_fix ? ' — AI fix ready' : ''}` : `Job ${r.name} is at SLA risk (running ${r.runtime})`
      })) }))
      return
    }

    if (path === '/dashboard/sla-breaches' && method === 'GET') {
      const { rows } = await client.query(`SELECT * FROM jobs WHERE status = 'warning' ORDER BY job_date DESC`)
      const parseRuntimeMins = rt => {
        if (!rt) return 0
        const h = rt.match(/(\d+)h/), m = rt.match(/(\d+)m/)
        return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0)
      }
      res.writeHead(200)
      res.end(JSON.stringify({ top_sla_breaches: rows.map((r, i) => ({
        id: r.id, job: r.name, workflow: r.workflow, runtime: r.runtime,
        overdue_mins: Math.max(20, parseRuntimeMins(r.runtime) - 60 + i * 10),
        breach_count: Math.max(1, 3 - i), team: r.team
      })) }))
      return
    }

    if (path === '/dashboard/long-running' && method === 'GET') {
      const { rows } = await client.query(`SELECT * FROM jobs WHERE status IN ('running','warning') AND runtime IS NOT NULL ORDER BY job_date DESC`)
      const parseRuntimeMins = rt => {
        if (!rt) return 0
        const h = rt.match(/(\d+)h/), m = rt.match(/(\d+)m/)
        return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0)
      }
      res.writeHead(200)
      res.end(JSON.stringify({ top_long_running: rows.map(r => ({
        id: r.id, job: r.name, workflow: r.workflow, runtime: r.runtime,
        runtime_mins: parseRuntimeMins(r.runtime), status: r.status
      })) }))
      return
    }

    if (path === '/dashboard/high-cpu' && method === 'GET') {
      const { rows } = await client.query(`SELECT * FROM jobs WHERE status IN ('running','warning') ORDER BY job_date DESC LIMIT 5`)
      const cpuLevels = [96, 94, 91, 89, 87]
      res.writeHead(200)
      res.end(JSON.stringify({ top_high_cpu: rows.map((r, i) => ({
        id: r.id, job: r.name, workflow: r.workflow, runtime: r.runtime,
        cpu_pct: cpuLevels[i] || 80, cores: 8
      })) }))
      return
    }

    if (path === '/dashboard/daily-trend' && method === 'GET') {
      const { rows } = await client.query(`SELECT job_date, status, COUNT(*) as count FROM jobs GROUP BY job_date, status ORDER BY job_date`)
      res.writeHead(200); res.end(JSON.stringify(rows))
      return
    }

    if (path === '/dashboard/report' && method === 'GET') {
      const { rows } = await client.query('SELECT * FROM jobs ORDER BY job_date DESC')
      const byWorkflow = rows.reduce((acc, r) => { acc[r.workflow] = (acc[r.workflow] || 0) + 1; return acc }, {})
      res.writeHead(200); res.end(JSON.stringify({
        workflows: Object.entries(byWorkflow).map(([name, total]) => ({ name, total })),
        jobs: rows, generated_at: new Date().toISOString()
      }))
      return
    }

    // Not found
    if (path === '/admin/fix-statuses' && method === 'GET') {
      const client2 = new Client({ connectionString: loadEnv().DATABASE_URL, ssl: { rejectUnauthorized: false } })
      await client2.connect()
      try {
        await client2.query(`UPDATE jobs SET status = (ARRAY['failed','failed','warning','running','success','success','success','running','warning','success'])[floor(random()*10+1)], has_ai_fix = false`)
        await client2.query(`UPDATE jobs SET has_ai_fix = true WHERE status = 'failed'`)
        const { rows } = await client2.query(`SELECT status, COUNT(*) as cnt FROM jobs GROUP BY status ORDER BY cnt DESC`)
        json(res, { success: true, distribution: rows })
      } finally { client2.end() }
      return
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' }))

  } catch (e) {
    console.error('[NexaOps API]', e.message)
    res.writeHead(500); res.end(JSON.stringify({ error: e.message }))
  } finally {
    client?.end()
  }
}

// ─── VITE PLUGIN ─────────────────────────────────────────────────────────────
function nexaOpsPlugin() {
  return {
    name: 'nexaops-backend',
    async configureServer(server) {
      // Seed DB on startup
      seedDatabase()

      // Start the API server on port 8000
      const apiServer = http.createServer(routeApi)
      apiServer.listen(8000, () => console.log('[NexaOps] 🚀 API server running on http://localhost:8000'))
      apiServer.on('error', e => {
        if (e.code === 'EADDRINUSE') console.warn('[NexaOps] ⚠️  Port 8000 already in use — API server not started')
        else console.error('[NexaOps] API server error:', e.message)
      })

      // ── Chatbot endpoint on port 5173 (/chat-api/message) ───────────────
      server.middlewares.use('/chat-api/message', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' })
          res.end(); return
        }
        if (req.method !== 'POST') { res.writeHead(405); res.end('Method Not Allowed'); return }
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        try {
          const body = await readBody(req)
          const { message } = body
          if (!message) { res.writeHead(400); res.end(JSON.stringify({ reply: 'No message provided.' })); return }
          const ENV = loadEnv()

          // Fetch context from the API server we just started
          async function fetchApi(path) {
            try {
              const r = await fetch(`http://localhost:8000${path}`)
              return r.ok ? r.json() : null
            } catch { return null }
          }

          let liveContext = ''
          try {
            const [summary, jobs, alerts, sla] = await Promise.all([
              fetchApi('/dashboard/summary'),
              fetchApi('/jobs?limit=20'),
              fetchApi('/dashboard/active-alerts'),
              fetchApi('/dashboard/sla-breaches'),
            ])
            const parts = []
            if (summary) parts.push(`DASHBOARD SUMMARY:\n${JSON.stringify(summary, null, 2)}`)
            if (jobs?.jobs?.length) {
              const counts = jobs.jobs.reduce((a, j) => { a[j.status] = (a[j.status]||0)+1; return a }, {})
              parts.push(`JOBS (${jobs.total} total — running:${counts.running||0} failed:${counts.failed||0} sla_risk:${counts.warning||0} queued:${counts.queued||0} succeeded:${counts.success||0}):\n` +
                jobs.jobs.map(j => `  • ${j.name} [${j.status.toUpperCase()}] workflow:${j.workflow} runtime:${j.runtime||'N/A'} team:${j.team}`).join('\n'))
            }
            if (alerts?.length) parts.push(`ACTIVE ALERTS:\n${alerts.map(a => `  • ${a.job} — ${a.message}`).join('\n')}`)
            if (sla?.length)    parts.push(`SLA BREACHES:\n${sla.map(s => `  • ${s.job} (${s.workflow}) running ${s.runtime}`).join('\n')}`)
            liveContext = parts.length ? `\n\n### LIVE NEXAOPS DATA\n${parts.join('\n\n')}` : '\n\n(No live data available)'
          } catch(e) {
            liveContext = `\n\n(Data fetch error: ${e.message})`
          }

          // Jira lookup
          let jiraContext = ''
          const jiraMatch = message.match(/\b([A-Z][A-Z0-9]+-\d+)\b/)
          if (jiraMatch && ENV.JIRA_BASE_URL && ENV.JIRA_EMAIL && ENV.JIRA_API_TOKEN) {
            try {
              const ticketId = jiraMatch[1]
              const creds = Buffer.from(`${ENV.JIRA_EMAIL}:${ENV.JIRA_API_TOKEN}`).toString('base64')
              const jr = await fetch(`${ENV.JIRA_BASE_URL.replace(/\/$/, '')}/rest/api/3/issue/${ticketId}`, {
                headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'application/json' }
              })
              if (jr.ok) {
                const t = await jr.json(); const f = t.fields
                jiraContext = `\n\n### JIRA ${ticketId}\nSummary: ${f.summary}\nStatus: ${f.status?.name}\nPriority: ${f.priority?.name}\nAssignee: ${f.assignee?.displayName||'Unassigned'}`
              }
            } catch {}
          }

          // Groq
          if (!ENV.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env')
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ENV.GROQ_API_KEY}` },
            body: JSON.stringify({
              model: 'qwen/qwen3.8-27b',
              max_tokens: 1024,
              messages: [
                { role: 'system', content: `You are NexaOps AI, an operational intelligence assistant. Help engineers understand job statuses, runtimes, SLA breaches, and incidents. Use the live data below to give accurate, data-driven answers. Always cite specific job names and numbers from the data.${liveContext}${jiraContext}` },
                { role: 'user', content: message }
              ]
            })
          })
          if (!groqRes.ok) throw new Error(`Groq API ${groqRes.status}: ${(await groqRes.text()).slice(0,200)}`)
          const groqData = await groqRes.json()
          res.writeHead(200); res.end(JSON.stringify({ reply: groqData.choices?.[0]?.message?.content || 'No response generated.' }))

        } catch(e) {
          console.error('[NexaOps chat-api]', e.message)
          res.writeHead(500); res.end(JSON.stringify({ reply: `Something went wrong: ${e.message}` }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), nexaOpsPlugin()],
  server: { port: 5173 }
})
