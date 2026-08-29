import React, { useEffect, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowUpRight, BookOpen, Bot, Check, CheckCircle2, ChevronRight,
  Clock3, Copy, Database, FileText, GitBranch, KeyRound, Network, PlugZap,
  Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, TerminalSquare,
  Users, Workflow, XCircle, Zap
} from 'lucide-react'

const PAGE_CONFIG = {
  incidents: { eyebrow: 'Response center', title: 'Incidents', description: 'Coordinate active incidents, ownership, and operational response.', icon: AlertTriangle, action: 'Create incident', stats: [['2', 'Active incidents', 'text-red-600'], ['1', 'Awaiting owner', 'text-amber-600'], ['8m', 'Median response', 'text-blue-600']] },
  brain: { eyebrow: 'Operational intelligence', title: 'Knowledge Brain', description: 'Search previous incidents, fixes, and proven operational decisions.', icon: Sparkles, action: 'Add knowledge', stats: [['248', 'Knowledge entries', 'text-blue-600'], ['94%', 'Match confidence', 'text-green-600'], ['18', 'Added this month', 'text-slate-700']] },
  integrations: { eyebrow: 'Connected systems', title: 'Integrations', description: 'Manage the services that feed NexaOps with signals and workflow events.', icon: PlugZap, action: 'Connect service', stats: [['12', 'Connected services', 'text-blue-600'], ['11', 'Healthy connections', 'text-green-600'], ['1', 'Needs attention', 'text-amber-600']] },
  runbooks: { eyebrow: 'Standardized response', title: 'Runbooks', description: 'Turn reliable operational knowledge into repeatable response workflows.', icon: BookOpen, action: 'New runbook', stats: [['36', 'Published runbooks', 'text-blue-600'], ['8', 'Used this week', 'text-green-600'], ['3', 'Drafts', 'text-slate-700']] },
  settings: { eyebrow: 'Workspace controls', title: 'Settings', description: 'Configure workspace access, notifications, and operational preferences.', icon: Settings2, action: 'Save changes', stats: [['4', 'Workspace admins', 'text-blue-600'], ['3', 'Alert policies', 'text-green-600'], ['24h', 'Token lifetime', 'text-slate-700']] },
}

// ── INCIDENT TABLE DATA ────────────────────────────────────────────────────
const INCIDENTS = [
  {
    id: 'INC-2048', url: '#inc-2048',
    workflow: 'Customer Master Synchronization', jobName: 'customer-sync-api',
    assignee: 'Meera Rajan', assigneeInitials: 'MR',
    team: 'Data Engineering', manager: 'Suresh Iyer',
    status: 'Investigating', priority: 'P1', tone: 'red',
    createdAt: '28-Aug-2026 08:14', updatedAt: '28-Aug-2026 08:22',
    detail: 'BigQuery JOIN type mismatch — INT64 vs STRING',
  },
  {
    id: 'INC-2047', url: '#inc-2047',
    workflow: 'Inventory Reconciliation', jobName: 'inventory-recon-nightly',
    assignee: 'Arjun Kumar', assigneeInitials: 'AK',
    team: 'Platform Engineering', manager: 'Divya Nair',
    status: 'AI Analysis', priority: 'P2', tone: 'amber',
    createdAt: '28-Aug-2026 07:40', updatedAt: '28-Aug-2026 08:14',
    detail: 'SLA breach — nightly reconciliation ran 2h 14m',
  },
  {
    id: 'INC-2041', url: '#inc-2041',
    workflow: 'Fraud Detection Streaming', jobName: 'kafka-consumer-lag',
    assignee: 'Priya Shah', assigneeInitials: 'PS',
    team: 'Data Engineering', manager: 'Suresh Iyer',
    status: 'Monitoring', priority: 'P3', tone: 'blue',
    createdAt: '28-Aug-2026 06:30', updatedAt: '28-Aug-2026 08:10',
    detail: 'Kafka consumer lag exceeding 50K messages threshold',
  },
  {
    id: 'INC-2038', url: '#inc-2038',
    workflow: 'Revenue Reporting', jobName: 'bq-revenue-report',
    assignee: 'Rahul Das', assigneeInitials: 'RD',
    team: 'Analytics', manager: 'Kavitha Menon',
    status: 'Resolved', priority: 'P2', tone: 'green',
    createdAt: '27-Aug-2026 22:05', updatedAt: '28-Aug-2026 07:58',
    detail: 'Schema column removed — downstream query failed',
  },
  {
    id: 'INC-2034', url: '#inc-2034',
    workflow: 'Customer Feature Pipeline', jobName: 'spark-user-features',
    assignee: 'Nisha Pillai', assigneeInitials: 'NP',
    team: 'Machine Learning', manager: 'Arun Balaji',
    status: 'Resolved', priority: 'P3', tone: 'green',
    createdAt: '27-Aug-2026 18:20', updatedAt: '27-Aug-2026 20:45',
    detail: 'Spark executor OOM — heap size insufficient for weekly run',
  },
  {
    id: 'INC-2029', url: '#inc-2029',
    workflow: 'Risk Score Calculation', jobName: 'risk-score-batch',
    assignee: 'Meera Rajan', assigneeInitials: 'MR',
    team: 'Data Engineering', manager: 'Suresh Iyer',
    status: 'Closed', priority: 'P2', tone: 'slate',
    createdAt: '26-Aug-2026 04:10', updatedAt: '26-Aug-2026 06:48',
    detail: 'BigQuery ML slot contention — batch delayed 38 min',
  },
]

const DATA = {
  incidents: INCIDENTS,
  brain: [
    { id: 'INC-4788', name: 'BigQuery JOIN type mismatch', detail: 'CAST(customer_id AS STRING) applied', tag: '96% match', state: 'Verified', age: '02 Apr 2025', tone: 'green' },
    { id: 'INC-4620', name: 'Informatica null primary key', detail: 'NULL filter added to source qualifier', tag: '89% match', state: 'Verified', age: '12 Jan 2025', tone: 'green' },
    { id: 'INC-4512', name: 'Kafka consumer lag', detail: 'Partition rebalance and throughput tuning', tag: '84% match', state: 'Verified', age: '18 Dec 2024', tone: 'blue' },
  ],
  integrations: [
    { id: '01', name: 'GitHub Actions', detail: 'CI/CD pipeline events', tag: 'Healthy', state: '12 workflows', age: 'Synced now', tone: 'green' },
    { id: '02', name: 'BigQuery', detail: 'Warehouse job telemetry', tag: 'Healthy', state: '48 jobs', age: 'Synced 2m ago', tone: 'green' },
    { id: '03', name: 'Apache Kafka', detail: 'Streaming health signals', tag: 'Attention', state: '2 topics', age: 'Checked 8m ago', tone: 'amber' },
  ],
  runbooks: [
    { id: 'RB-021', name: 'BigQuery schema mismatch', detail: 'Data platform', tag: 'Published', state: '12 uses', age: 'Updated today', tone: 'green' },
    { id: 'RB-018', name: 'Kafka consumer recovery', detail: 'Streaming', tag: 'Published', state: '8 uses', age: 'Updated yesterday', tone: 'green' },
    { id: 'RB-011', name: 'Failed Airflow DAG recovery', detail: 'Orchestration', tag: 'Draft', state: '0 uses', age: 'Updated 3d ago', tone: 'slate' },
  ],
}

const badge = { red: 'bg-red-50 text-red-700 border-red-200', amber: 'bg-amber-50 text-amber-700 border-amber-200', green: 'bg-green-50 text-green-700 border-green-200', blue: 'bg-blue-50 text-blue-700 border-blue-200', slate: 'bg-slate-100 text-slate-600 border-slate-200' }
const ROW_ICONS = { incidents: ShieldCheck, brain: FileText, integrations: Database, runbooks: TerminalSquare }

export default function WorkspacePage({ pageKey }) {
  const config = PAGE_CONFIG[pageKey]
  const Icon = config.icon
  const [query, setQuery] = useState('')
  const [selectedKnowledge, setSelectedKnowledge] = useState(null)
  const [knowledgeEntries, setKnowledgeEntries] = useState([])
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false)
  useEffect(() => {
    if (!selectedKnowledge) return
    requestAnimationFrame(() => document.getElementById(`knowledge-detail-${selectedKnowledge.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
  }, [selectedKnowledge])
  if (pageKey === 'settings') return <SettingsPage config={config} />
  if (pageKey === 'integrations') return <IntegrationsModule config={config} />

  // ── Incidents gets its own dedicated table view ─────────────
  if (pageKey === 'incidents') {
    return <IncidentsPage config={config} />
  }

  const sourceRows = pageKey === 'brain' ? [...knowledgeEntries, ...DATA.brain] : DATA[pageKey]
  const rows = sourceRows.filter(r => `${r.id} ${r.name} ${r.detail}`.toLowerCase().includes(query.toLowerCase()))
  const RowIcon = ROW_ICONS[pageKey]
  return <div className={`min-h-full shrink-0 p-5 md:p-6 flex flex-col gap-5 bg-[#f7f9fc] ${pageKey === 'brain' ? 'knowledge-brain' : ''}`}>
    <PageHeader config={config} onAction={pageKey === 'brain' ? () => setKnowledgeModalOpen(true) : undefined} />
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">{config.stats.map(([v, l, c]) => <Metric key={l} value={v} label={l} color={c} />)}</section>
    {pageKey === 'brain' && <BrainPrompt entries={sourceRows} />}
    {pageKey === 'runbooks' && <RunbookCoverage />}
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon size={16} className="text-blue-600" /> {pageKey === 'brain' ? 'Recent knowledge matches' : pageKey === 'integrations' ? 'Connected services' : 'Runbook library'}</div>
        <div className="flex gap-2"><div className="relative hidden sm:block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} aria-label={`Search ${config.title}`} placeholder="Search..." className="w-44 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-slate-50" /></div><button className="w-8 h-8 grid place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 bg-white"><SlidersHorizontal size={14} /></button></div>
      </div>
      <div className="divide-y divide-slate-100">{rows.map(row => <React.Fragment key={row.id}><div onClick={() => pageKey === 'brain' && setSelectedKnowledge(selectedKnowledge?.id === row.id ? null : row)} className={`grid grid-cols-[auto_minmax(220px,1.5fr)_minmax(160px,1fr)_92px_112px_32px] items-center gap-4 px-4 py-3.5 transition-colors ${pageKey === 'brain' ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-slate-50'}`}><div className="w-8 h-8 grid place-items-center rounded-lg bg-slate-100 text-slate-500"><RowIcon size={15} /></div><div className="min-w-0"><div className="text-xs font-semibold text-slate-800 truncate">{row.id} <span className="text-slate-300 mx-1">/</span> {row.name}</div><div className="text-xs text-slate-400 mt-1 truncate">{row.detail}</div></div><span className="text-xs text-slate-500 truncate">{row.state}</span><span className={`justify-self-start text-[11px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap ${badge[row.tone]}`}>{row.tag}</span><span className="text-xs text-slate-500 whitespace-nowrap">{row.age}</span><button aria-label={`Open ${row.id}`} className={`w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 ${selectedKnowledge?.id === row.id ? 'rotate-90 text-blue-600 bg-blue-50' : ''}`}><ChevronRight size={16} /></button></div>{pageKey === 'brain' && selectedKnowledge?.id === row.id && <KnowledgeDetail item={row} onClose={() => setSelectedKnowledge(null)} />}</React.Fragment>)}</div>
    </section>
    {pageKey === 'brain' && knowledgeModalOpen && <KnowledgeEntryModal onClose={() => setKnowledgeModalOpen(false)} onSave={entry => { setKnowledgeEntries(items => [entry, ...items]); setKnowledgeModalOpen(false); setSelectedKnowledge(entry) }} />}
  </div>
}

// ════════════════════════════════════════════════════════════
// INCIDENTS PAGE — full table layout
// ════════════════════════════════════════════════════════════
const STATUS_STYLE = {
  'Investigating': 'bg-red-50 text-red-700 border-red-200',
  'AI Analysis':   'bg-violet-50 text-violet-700 border-violet-200',
  'Monitoring':    'bg-blue-50 text-blue-700 border-blue-200',
  'Resolved':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed':        'bg-slate-100 text-slate-500 border-slate-200',
}
const PRIORITY_STYLE = {
  P1: 'bg-red-50 text-red-700 border-red-200',
  P2: 'bg-amber-50 text-amber-700 border-amber-200',
  P3: 'bg-blue-50 text-blue-700 border-blue-200',
}

function IncidentsPage({ config }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const statuses = ['All', 'Investigating', 'AI Analysis', 'Monitoring', 'Resolved', 'Closed']
  const priorities = ['All', 'P1', 'P2', 'P3']

  const rows = INCIDENTS.filter(r => {
    const q = query.toLowerCase()
    const matchQ = !q || `${r.id} ${r.workflow} ${r.jobName} ${r.assignee} ${r.team} ${r.manager} ${r.detail}`.toLowerCase().includes(q)
    const matchS = statusFilter === 'All' || r.status === statusFilter
    const matchP = priorityFilter === 'All' || r.priority === priorityFilter
    return matchQ && matchS && matchP
  })

  const counts = {
    active:   INCIDENTS.filter(r => ['Investigating','AI Analysis','Monitoring'].includes(r.status)).length,
    awaiting: INCIDENTS.filter(r => r.status === 'Investigating').length,
    p1:       INCIDENTS.filter(r => r.priority === 'P1').length,
  }

  return (
    <div className="min-h-full shrink-0 flex flex-col gap-5 p-5 md:p-6 bg-[#f7f9fc]">

      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Incidents</h1>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">Response Center</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Coordinate active incidents, ownership, and operational response.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition-colors">
          <Plus size={15} /> Create Incident
        </button>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
          <div className="text-2xl font-semibold font-mono text-red-600">{counts.active}</div>
          <div className="text-xs text-slate-500 mt-1">Active incidents</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
          <div className="text-2xl font-semibold font-mono text-amber-600">{counts.awaiting}</div>
          <div className="text-xs text-slate-500 mt-1">Awaiting owner decision</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
          <div className="text-2xl font-semibold font-mono text-red-600">{counts.p1}</div>
          <div className="text-xs text-slate-500 mt-1">P1 — critical severity</div>
        </div>
      </section>

      {/* P1 Alert Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 grid place-items-center rounded-lg bg-red-100 text-red-600 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-800">P1 customer-sync-api needs a decision</div>
              <p className="text-xs text-slate-500 mt-1">AI isolated a type mismatch and found a verified fix from a similar incident.</p>
            </div>
            <button className="text-xs font-semibold text-red-700 whitespace-nowrap shrink-0">
              Review <ArrowUpRight size={13} className="inline" />
            </button>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">On-call coverage</div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white grid place-items-center text-[10px] text-blue-700 font-bold">MR</span>
              <span className="w-7 h-7 rounded-full bg-violet-100 border-2 border-white grid place-items-center text-[10px] text-violet-700 font-bold">AK</span>
            </div>
            <span className="text-xs text-slate-600">2 responders online</span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

        {/* Table toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <AlertTriangle size={16} className="text-blue-600" />
            All Incidents
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md ml-1">{rows.length}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search incidents…"
                className="h-8 w-52 pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 outline-none focus:border-blue-400"
            >
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Table itself */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'Incident ID', 'Workflow Name', 'Failed Job', 'Assignee',
                  'Team', 'Manager / Reporting', 'Status', 'Priority',
                  'Created', 'Last Updated',
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-xs text-slate-400">No incidents match the selected filters.</td></tr>
              ) : rows.map(row => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-slate-50/70 border-l-2 ${
                    row.status === 'Investigating' ? 'border-l-red-400' :
                    row.status === 'AI Analysis'  ? 'border-l-violet-400' :
                    row.status === 'Monitoring'   ? 'border-l-blue-400' :
                    'border-l-transparent'
                  }`}
                >
                  {/* Incident ID — hyperlink */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <a
                      href={row.url}
                      onClick={e => e.preventDefault()}
                      className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
                    >
                      {row.id}
                    </a>
                  </td>

                  {/* Workflow name */}
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-700 truncate max-w-[180px]" title={row.workflow}>{row.workflow}</div>
                  </td>

                  {/* Failed job name */}
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-slate-600 text-[11px] truncate max-w-[160px]" title={row.jobName}>{row.jobName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">{row.detail}</div>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold shrink-0 ${
                        row.tone === 'red'   ? 'bg-red-100 text-red-700' :
                        row.tone === 'amber' ? 'bg-amber-100 text-amber-700' :
                        row.tone === 'blue'  ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{row.assigneeInitials}</span>
                      <span className="text-slate-700 font-medium">{row.assignee}</span>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-slate-600">{row.team}</span>
                  </td>

                  {/* Manager */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-slate-600">{row.manager}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold ${STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        row.status === 'Investigating' ? 'bg-red-500' :
                        row.status === 'AI Analysis'   ? 'bg-violet-500' :
                        row.status === 'Monitoring'    ? 'bg-blue-500' :
                        row.status === 'Resolved'      ? 'bg-emerald-500' :
                        'bg-slate-400'
                      }`} />
                      {row.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${PRIORITY_STYLE[row.priority] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {row.priority}
                    </span>
                  </td>

                  {/* Created date */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-[10px] text-slate-500">{row.createdAt}</span>
                  </td>

                  {/* Updated date */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-[10px] text-slate-500">{row.updatedAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-400">Showing {rows.length} of {INCIDENTS.length} incidents</span>
          <div className="flex items-center gap-1">
            <button className="h-7 px-2.5 rounded border border-slate-200 text-[11px] text-slate-500 bg-white hover:border-slate-300 disabled:opacity-40" disabled>← Prev</button>
            <span className="h-7 px-2.5 rounded border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 grid place-items-center">1</span>
            <button className="h-7 px-2.5 rounded border border-slate-200 text-[11px] text-slate-500 bg-white hover:border-slate-300 disabled:opacity-40" disabled>Next →</button>
          </div>
        </div>

      </section>
    </div>
  )
}

function PageHeader({ config, onAction }) { return <header className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-2.5"><h1 className="text-lg font-semibold tracking-tight text-slate-900">{config.title}</h1><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">{config.eyebrow}</span></div><p className="text-xs text-slate-500 mt-1">{config.description}</p></div><button onClick={onAction} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20"><Plus size={15} />{config.action}</button></header> }
function Metric({ value, label, color }) { return <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm"><div className={`text-2xl font-semibold font-mono ${color}`}>{value}</div><div className="text-xs text-slate-500 mt-1">{label}</div></div> }
function IncidentSignal() { return <section className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4"><div className="flex items-start gap-3"><div className="w-9 h-9 grid place-items-center rounded-lg bg-red-100 text-red-600"><AlertTriangle size={18}/></div><div className="flex-1"><div className="text-sm font-semibold text-slate-800">P1 customer-sync-api needs a decision</div><p className="text-xs text-slate-500 mt-1">AI isolated a type mismatch and found a verified fix from a similar incident.</p></div><button className="text-xs font-semibold text-red-700">Review <ArrowUpRight size={13} className="inline"/></button></div></div><div className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">On-call coverage</div><div className="flex items-center gap-2 mt-3"><div className="flex -space-x-2"><span className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white grid place-items-center text-[10px] text-blue-700">MR</span><span className="w-7 h-7 rounded-full bg-violet-100 border-2 border-white grid place-items-center text-[10px] text-violet-700">AK</span></div><span className="text-xs text-slate-600">2 responders online</span></div></div></section> }
function BrainPrompt({ entries }) { const [question, setQuestion] = useState('Why do BigQuery customer sync jobs fail?'); const [answer, setAnswer] = useState(null); const ask = () => { const terms = question.toLowerCase().split(/\s+/).filter(word => word.length > 2); const matches = entries.filter(entry => terms.some(word => `${entry.name} ${entry.detail}`.toLowerCase().includes(word))).slice(0, 3); setAnswer({ matches, text: matches.length ? `I found ${matches.length} related knowledge ${matches.length === 1 ? 'entry' : 'entries'}. The recommended approach is to validate the root cause, apply the documented resolution, then confirm the workflow completes successfully.` : 'No direct matches were found. Try including a workflow, incident, or error message.' }) }; return <section className="rounded-xl bg-slate-900 p-5 text-white overflow-hidden relative"><Sparkles className="absolute -right-4 -top-4 text-blue-400/20" size={120}/><div className="relative"><div className="flex items-center gap-2 text-sm font-semibold"><Bot size={17} className="text-blue-300"/> Ask the Operations Assistant</div><p className="text-xs text-slate-300 mt-1">Find fixes and explain patterns across your incident history.</p><div className="mt-4 flex gap-2 max-w-2xl"><input value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => event.key === 'Enter' && ask()} aria-label="Ask the Operations Assistant" className="flex-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-400"/><button onClick={ask} className="px-3 rounded-lg bg-blue-500 text-xs font-semibold">Ask</button></div>{answer && <div className="mt-4 max-w-2xl rounded-lg border border-blue-400/30 bg-blue-500/10 p-3 text-xs text-slate-200"><b className="text-blue-300">AI recommendation</b><p className="mt-1">{answer.text}</p>{answer.matches.length > 0 && <div className="mt-3 space-y-1.5">{answer.matches.map(item => <div key={item.id} className="rounded bg-white/5 px-2 py-1.5"><b>{item.name}</b><span className="ml-2 text-slate-300">{item.detail}</span></div>)}</div>}</div>}</div></section> }
function KnowledgeDetail({ item, onClose }) { return <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Sparkles size={16} className="text-blue-600"/><h3 className="text-sm font-semibold text-slate-800">Verified resolution for {item.id}</h3></div><p className="text-xs text-slate-500 mt-1">This resolution was successfully used for a similar production incident.</p></div><button onClick={e => { e.stopPropagation(); onClose() }} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Close</button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"><div className="md:col-span-2 rounded-lg bg-white border border-blue-100 p-3"><div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Recommended fix</div><code className="block mt-2 text-xs text-slate-700 font-mono">{item.detail}</code><p className="text-xs text-slate-500 mt-2">Apply the type normalization before the join, then rerun the affected workflow.</p></div><div className="rounded-lg bg-white border border-blue-100 p-3"><div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Evidence</div><div className="text-lg font-mono font-semibold text-green-600 mt-1">{item.tag}</div><div className="text-xs text-slate-500 mt-1">confidence · verified</div></div></div><div className="flex items-center justify-between mt-3"><span className="text-xs text-slate-500">Outcome: incident resolved without rollback</span><button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"><Copy size={13}/> Reuse this fix</button></div></div> }
function KnowledgeEntryModal({ onClose, onSave }) { const [form, setForm] = useState({ title: '', incident: '', category: 'Incident resolution', tags: '', rootCause: '', resolution: '', status: 'Verified', attachments: '' }); const update = event => setForm(value => ({ ...value, [event.target.name]: event.target.value })); const save = event => { event.preventDefault(); if (!form.title.trim()) return; onSave({ id: `KB-${Date.now().toString().slice(-5)}`, name: form.title.trim(), detail: form.resolution.trim() || form.rootCause.trim() || 'Knowledge entry saved', tag: form.status, state: form.category, age: 'Just now', tone: form.status === 'Verified' ? 'green' : 'blue', ...form }) }; const field = 'mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400'; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={event => event.target === event.currentTarget && onClose()}><form onSubmit={save} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900">Add knowledge entry</h2><p className="mt-1 text-xs text-slate-500">Capture a reusable incident resolution for the operations team.</p></div><button type="button" onClick={onClose} aria-label="Close add knowledge" className="text-slate-400 hover:text-slate-700"><XCircle size={18}/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600 sm:col-span-2">Title<input required name="title" value={form.title} onChange={update} className={field}/></label><label className="text-xs font-medium text-slate-600">Incident or workflow<input name="incident" value={form.incident} onChange={update} className={field}/></label><label className="text-xs font-medium text-slate-600">Category<select name="category" value={form.category} onChange={update} className={field}><option>Incident resolution</option><option>Workflow optimization</option><option>Runbook</option><option>Operational decision</option></select></label><label className="text-xs font-medium text-slate-600">Tags<input name="tags" value={form.tags} onChange={update} className={field}/></label><label className="text-xs font-medium text-slate-600">Status<select name="status" value={form.status} onChange={update} className={field}><option>Verified</option><option>Draft</option><option>Under review</option></select></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Root cause<textarea name="rootCause" value={form.rootCause} onChange={update} rows="3" className={field}/></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Resolution<textarea name="resolution" value={form.resolution} onChange={update} rows="3" className={field}/></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Attachments<input name="attachments" type="file" multiple onChange={event => setForm(value => ({ ...value, attachments: [...event.target.files].map(file => file.name).join(', ') }))} className={field}/>{form.attachments && <span className="mt-1 block text-[10px] text-slate-400">{form.attachments}</span>}</label></div><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">Save knowledge</button></div></form></div> }
const INTEGRATIONS = [{ id: '01', name: 'GitHub Actions', detail: 'CI/CD pipeline events', tag: 'Healthy', state: '12 workflows', age: 'Synced now', type: 'GitHub', source: 'Repository events' }, { id: '02', name: 'BigQuery', detail: 'Warehouse job telemetry', tag: 'Healthy', state: '48 jobs', age: 'Synced 2m ago', type: 'BigQuery', source: 'Data warehouse' }, { id: '03', name: 'Apache Kafka', detail: 'Streaming health signals', tag: 'Attention', state: '2 topics', age: 'Checked 8m ago', type: 'Kafka', source: 'Event streams' }]
function IntegrationsModule({ config }) { const [items, setItems] = useState(INTEGRATIONS), [query, setQuery] = useState(''), [filtersOpen, setFiltersOpen] = useState(false), [filters, setFilters] = useState({ type: 'All', status: 'All', source: 'All', sync: 'All' }), [draft, setDraft] = useState(filters), [connectOpen, setConnectOpen] = useState(false), [selected, setSelected] = useState(null); const rows = items.filter(item => `${item.name} ${item.detail} ${item.type}`.toLowerCase().includes(query.toLowerCase()) && (filters.type === 'All' || item.type === filters.type) && (filters.status === 'All' || item.tag === filters.status) && (filters.source === 'All' || item.source === filters.source) && (filters.sync === 'All' || (filters.sync === 'Recent' ? /now|2m/.test(item.age) : !/now|2m/.test(item.age)))); const control = 'mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none'; return <div className="min-h-full shrink-0 bg-[#f7f9fc] p-5 md:p-6"><div className="mx-auto flex max-w-[1500px] flex-col gap-5"><PageHeader config={config} onAction={() => setConnectOpen(true)}/><section className="grid grid-cols-1 gap-4 md:grid-cols-3"><Info icon={Network} title="Event throughput" value="12.8k" text="events received today"/><Info icon={CheckCircle2} title="Sync success" value="99.8%" text="over the last 24 hours"/><Info icon={Clock3} title="Last full sync" value="2m" text="across all services"/></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><PlugZap size={16} className="text-blue-600"/> Connected services</div><div className="flex gap-2"><div className="relative hidden sm:block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Search integrations" placeholder="Search..." className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-400"/></div><div className="relative"><button onClick={() => { setDraft(filters); setFiltersOpen(value => !value) }} aria-label="Filter integrations" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600"><SlidersHorizontal size={14}/></button>{filtersOpen && <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-semibold text-slate-500">Integration Type<select value={draft.type} onChange={event => setDraft(value => ({ ...value, type: event.target.value }))} className={control}><option>All</option><option>GitHub</option><option>BigQuery</option><option>Kafka</option><option>Airflow</option><option>Snowflake</option><option>Databricks</option><option>SFTP</option><option>REST API</option></select></label><label className="text-[10px] font-semibold text-slate-500">Connection Status<select value={draft.status} onChange={event => setDraft(value => ({ ...value, status: event.target.value }))} className={control}><option>All</option><option>Healthy</option><option>Attention</option><option>Failed</option><option>Disconnected</option></select></label><label className="text-[10px] font-semibold text-slate-500">Data Source<select value={draft.source} onChange={event => setDraft(value => ({ ...value, source: event.target.value }))} className={control}><option>All</option><option>Repository events</option><option>Data warehouse</option><option>Event streams</option></select></label><label className="text-[10px] font-semibold text-slate-500">Last Sync<select value={draft.sync} onChange={event => setDraft(value => ({ ...value, sync: event.target.value }))} className={control}><option>All</option><option>Recent</option><option>Older</option></select></label></div><div className="mt-3 flex justify-between border-t border-slate-100 pt-3"><button onClick={() => { setDraft({ type: 'All', status: 'All', source: 'All', sync: 'All' }); setFilters({ type: 'All', status: 'All', source: 'All', sync: 'All' }) }} className="text-[10px] font-semibold text-slate-500">Reset</button><div className="flex gap-2"><button onClick={() => { setFilters({ type: 'All', status: 'All', source: 'All', sync: 'All' }); setFiltersOpen(false) }} className="text-[10px] font-semibold text-slate-500">Clear All</button><button onClick={() => { setFilters(draft); setFiltersOpen(false) }} className="rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">Apply</button></div></div></div>}</div></div></div><div className="divide-y divide-slate-100">{rows.map(item => <button key={item.id} onClick={() => setSelected(item)} className="integration-row grid w-full grid-cols-[auto_minmax(220px,1.5fr)_minmax(160px,1fr)_92px_112px_32px] items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500"><Database size={15}/></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-800">{item.id} <i className="mx-1 not-italic text-slate-300">/</i> {item.name}</span><span className="mt-1 block truncate text-xs text-slate-400">{item.detail}</span></span><span className="truncate text-xs text-slate-500">{item.state}</span><span onClick={event => event.stopPropagation()} title={`${item.tag}: ${item.tag === 'Healthy' ? 'Connection is syncing normally' : 'Requires review'}`} className={`justify-self-start rounded-md border px-2 py-1 text-[11px] font-semibold ${item.tag === 'Healthy' ? badge.green : badge.amber}`}>{item.tag}</span><span className="whitespace-nowrap text-xs text-slate-500">{item.age}</span><ChevronRight size={16} className="text-slate-400"/></button>)}{!rows.length && <div className="py-10 text-center text-xs text-slate-400">No integrations match the selected filters.</div>}</div></section></div>{connectOpen && <ConnectIntegrationModal onClose={() => setConnectOpen(false)} onSave={item => { setItems(values => [{ id: String(values.length + 1).padStart(2, '0'), tag: 'Healthy', state: 'Ready to sync', age: 'Synced now', source: 'Custom connection', ...item }, ...values]); setConnectOpen(false) }}/>} {selected && <IntegrationDetail item={selected} onClose={() => setSelected(null)} onRemove={() => { setItems(values => values.filter(value => value.id !== selected.id)); setSelected(null) }}/>}</div> }
function ConnectIntegrationModal({ onClose, onSave }) { const [form, setForm] = useState({ name: 'GitHub', detail: '', connection: '', auth: '' }), [tested, setTested] = useState(false); const field = 'mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400'; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={event => event.target === event.currentTarget && onClose()}><form onSubmit={event => { event.preventDefault(); onSave({ name: form.name, type: form.name, detail: form.detail || `${form.name} connection`, connection: form.connection, auth: form.auth }) }} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"><h2 className="text-lg font-semibold text-slate-900">Connect service</h2><div className="mt-4 grid gap-3"><label className="text-xs font-medium text-slate-600">Service<select value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} className={field}>{['GitHub','BigQuery','Kafka','Airflow','Snowflake','Databricks','SFTP','REST API'].map(name => <option key={name}>{name}</option>)}</select></label><label className="text-xs font-medium text-slate-600">Connection details<input required value={form.connection} onChange={event => setForm(value => ({ ...value, connection: event.target.value }))} placeholder="URL, project, host, or endpoint" className={field}/></label><label className="text-xs font-medium text-slate-600">Authentication<input value={form.auth} onChange={event => setForm(value => ({ ...value, auth: event.target.value }))} placeholder="Token, service account, or key reference" className={field}/></label><label className="text-xs font-medium text-slate-600">Description<input value={form.detail} onChange={event => setForm(value => ({ ...value, detail: event.target.value }))} className={field}/></label>{tested && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Connection test passed.</p>}</div><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500">Cancel</button><button type="button" onClick={() => setTested(true)} className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-600">Test Connection</button><button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Save integration</button></div></form></div> }
function IntegrationDetail({ item, onClose, onRemove }) { const [paused, setPaused] = useState(false), [message, setMessage] = useState(''); const action = text => setMessage(text); return <div className="fixed inset-0 z-50 overflow-auto bg-[#f7f9fc] p-5 md:p-6"><div className="mx-auto max-w-[1200px]"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-semibold text-slate-900">{item.name}</h2><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div><button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Close</button></div>{message && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">{message}</div>}<div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><div className="space-y-4"><Panel title="Connection information" icon={PlugZap}><div className="grid grid-cols-2 gap-4 text-xs"><Info icon={Database} title="Connection" value={item.connection || item.source} text="Configured endpoint"/><Info icon={ShieldCheck} title="Authentication" value={item.auth || 'Managed'} text="Credential status active"/></div></Panel><Panel title="Sync history & health" icon={Activity}><div className="text-xs text-slate-600">Last sync: {item.age} · Success rate: 99.8% · Latency: 240ms</div><div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Recent events: configuration validated, workflow mappings refreshed, telemetry received.</div></Panel><Panel title="Recent logs & workflow mappings" icon={FileText}><div className="space-y-2 text-xs text-slate-600"><p>✓ Connection authenticated successfully</p><p>✓ Synced workflow events and health signals</p><p>Mapped workflows: payments-etl-daily, customer-sync-api</p></div></Panel></div><aside className="space-y-4"><Panel title="Actions" icon={Zap}><div className="flex flex-col gap-2"><button onClick={() => action('Connection test passed.')} className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-600">Test Connection</button><button onClick={() => action('Sync started.')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Sync Now</button><button onClick={() => action('Configuration editor opened.')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Edit Configuration</button><button onClick={() => { setPaused(value => !value); action(paused ? 'Sync resumed.' : 'Sync paused.') }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">{paused ? 'Resume Sync' : 'Pause Sync'}</button><button onClick={() => action('Reconnect attempt started.')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Reconnect</button><button onClick={onRemove} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Remove Integration</button></div></Panel></aside></div></div></div> }
function IntegrationHealth() { return <section className="grid grid-cols-1 md:grid-cols-3 gap-4"><Info icon={Network} title="Event throughput" value="12.8k" text="events received today"/><Info icon={CheckCircle2} title="Sync success" value="99.8%" text="over the last 24 hours"/><Info icon={Clock3} title="Last full sync" value="2m" text="across all services"/></section> }
function RunbookCoverage() { return <section className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-800">Automation coverage</span><span className="text-xs font-mono text-blue-600">72%</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-4"><div className="h-full w-[72%] bg-blue-500 rounded-full"/></div><p className="text-xs text-slate-500 mt-3">18 of 25 common incident patterns have a linked runbook.</p></div><div className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Zap size={16} className="text-amber-500"/> Suggested next runbook</div><p className="text-xs text-slate-500 mt-2">Document the customer-sync API recovery path based on 3 related incidents.</p><button className="mt-3 text-xs font-semibold text-blue-600">Draft from incidents <ChevronRight size={13} className="inline"/></button></div></section> }
function Info({ icon: Icon, title, value, text }) { return <div className="bg-white border border-slate-200 rounded-xl p-4"><Icon size={16} className="text-blue-600"/><div className="text-xl font-mono font-semibold text-slate-800 mt-3">{value}</div><div className="text-xs font-medium text-slate-700 mt-1">{title}</div><div className="text-xs text-slate-400 mt-1">{text}</div></div> }
function SettingsPage({ config }) { const [enabled, setEnabled] = useState(true); return <div className="p-5 md:p-6 flex flex-col gap-5 overflow-auto bg-[#f7f9fc]"><PageHeader config={config}/><section className="grid grid-cols-1 sm:grid-cols-3 gap-4">{config.stats.map(([v,l,c]) => <Metric key={l} value={v} label={l} color={c}/>)}</section><div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-4"><section className="bg-white border border-slate-200 rounded-xl overflow-hidden"><SettingRow icon={Users} title="Workspace members" text="4 administrators · 12 members" action="Manage members"/><SettingRow icon={ShieldCheck} title="Incident notifications" text="Route P1 and P2 alerts to the on-call schedule" toggle enabled={enabled} onToggle={() => setEnabled(!enabled)}/><SettingRow icon={KeyRound} title="API access" text="2 service tokens · rotated 8 days ago" action="Review tokens"/></section><section className="bg-white border border-slate-200 rounded-xl p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><GitBranch size={16} className="text-blue-600"/> Workspace details</div><div className="mt-5 space-y-4"><Field label="Workspace name" value="NexaOps Production"/><Field label="Default timezone" value="Asia / Kolkata (IST)"/></div><button className="mt-5 w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold">Save workspace details</button></section></div></div> }
function SettingRow({ icon: Icon, title, text, action, toggle, enabled, onToggle }) { return <div className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0"><div className="w-9 h-9 grid place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon size={17}/></div><div className="flex-1"><div className="text-sm font-semibold text-slate-800">{title}</div><div className="text-xs text-slate-500 mt-0.5">{text}</div></div>{toggle ? <button onClick={onToggle} aria-label="Toggle incident notifications" className={`w-10 h-6 rounded-full p-0.5 transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}><span className={`block h-5 w-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-4' : ''}`}/></button> : <button className="text-xs font-semibold text-blue-600">{action} <ChevronRight size={13} className="inline"/></button>}</div> }
function Field({ label, value }) { return <label className="block text-xs font-medium text-slate-500">{label}<div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">{value}</div></label> }
