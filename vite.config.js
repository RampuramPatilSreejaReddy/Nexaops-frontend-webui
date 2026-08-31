import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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

// ─── BODY PARSER ─────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch(e) { reject(e) } })
    req.on('error', reject)
  })
}

// ─── VITE PLUGIN (chatbot only) ──────────────────────────────────────────────
function nexaOpsPlugin() {
  return {
    name: 'nexaops-chatbot',
    async configureServer(server) {
      // API server runs separately: cd nexaops-api-service && uvicorn main:app --reload
      // Chatbot fetches live context from http://localhost:8000 (Python FastAPI backend)

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

          // Fetch live context from Python backend
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
                jobs.jobs.map(j => `  • ${j.name} [${j.status.toUpperCase()}] workflow:${j.workflow} runtime:${j.runtime||'N/A'}`).join('\n'))
            }
            if (alerts?.length) parts.push(`ACTIVE ALERTS:\n${alerts.map(a => `  • ${a.job} — ${a.message}`).join('\n')}`)
            if (sla?.length)    parts.push(`SLA BREACHES:\n${sla.map(s => `  • ${s.job} (${s.workflow}) running ${s.runtime}`).join('\n')}`)
            liveContext = parts.length ? `\n\n### LIVE NEXAOPS DATA\n${parts.join('\n\n')}` : '\n\n(No live data available)'
          } catch(e) {
            liveContext = `\n\n(Data fetch error: ${e.message})`
          }

          // Optional Jira lookup
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

          // Groq chat completion
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
