import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign, Clock3, Coins, Cpu, Database, FileCheck2, Layers3, Leaf, Network, RefreshCw, ShieldCheck, SlidersHorizontal, Zap } from 'lucide-react'
import { getDashboardSummary, getSlaBreaches, getLongRunning, getHighCpu, getDailyReport, getActiveAlerts } from '../api/dashboard.js'

function HighCpu({ rows }) {
  const [threshold, setThreshold] = useState('> 80% CPU')
  const [environment, setEnvironment] = useState('All')
  const [cloud, setCloud] = useState('All')
  const metadata = [[96,'Production','AWS','Right-size VM','$18,000 /mo'], [94,'Production','AWS','Increase Auto-scaling','$12,500 /mo'], [91,'Staging','GCP','Use Spot Instances','$9,200 /mo'], [89,'Production','Azure','Right-size Cluster','$8,100 /mo'], [87,'Development','AWS','GCP Optimize Query','$6,700 /mo']]
  const cutoff = threshold === '> 90% CPU' ? 90 : threshold === '> 80% CPU' ? 80 : 0
  const displayed = rows.slice(0, 5).map((row, index) => ({ row, index, cpu: metadata[index][0], environment: metadata[index][1], cloud: metadata[index][2], action: metadata[index][3], saving: metadata[index][4] })).filter(item => item.cpu > cutoff && (environment === 'All' || item.environment === environment) && (cloud === 'All' || item.cloud === cloud))
  return <Panel title="Top 5 High CPU Jobs" icon={Cpu} action={<div className="flex items-center gap-3"><select value={threshold} onChange={e => setThreshold(e.target.value)} aria-label="CPU threshold" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 outline-none"><option>&gt; 80% CPU</option><option>&gt; 90% CPU</option><option>All CPU</option></select><button className="text-[10px] font-semibold text-blue-600">View all</button></div>}>
    <div className="grid grid-cols-[1.25fr_.68fr_1.35fr_.8fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>CPU</span><span>AI Action</span><span>Savings (Est.)</span></div>
    {displayed.map(({ row, index, cpu, action, saving }) => <div key={row.job} className="grid grid-cols-[1.25fr_.68fr_1.35fr_.8fr] items-center py-2.5 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><span className="flex items-center gap-2"><b className="text-slate-600">{cpu}%</b><i className="h-1 w-12 rounded bg-slate-100"><i className="block h-full rounded bg-red-500" style={{ width: cpu + '%' }}/></i></span><span className="font-semibold text-slate-600"><i className={"mr-2 inline-block h-2 w-2 rounded-sm " + (index % 2 ? 'bg-blue-500' : index === 2 ? 'bg-violet-500' : 'bg-emerald-500')}/>{action}</span><b className="text-emerald-600">{saving}</b></div>)}
    {!displayed.length && <div className="py-6 text-center text-[10px] text-slate-400">No high CPU jobs match the selected filters.</div>}
    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><select value={environment} onChange={e => setEnvironment(e.target.value)} aria-label="Filter high CPU jobs by environment" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Environment: All</option><option>Production</option><option>Staging</option><option>Development</option></select><select value={cloud} onChange={e => setCloud(e.target.value)} aria-label="Filter high CPU jobs by cloud" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Cloud: All</option><option>AWS</option><option>GCP</option><option>Azure</option></select></div>
    <p className="mt-3 text-[10px] font-medium text-violet-600">✦ AI estimated monthly savings based on usage patterns</p>
  </Panel>
}

function FailingWorkflows({ rows }) {
  const [range, setRange] = useState('Last 30 Days')
  const [environment, setEnvironment] = useState('All')
  const [team, setTeam] = useState('All')
  const [severity, setSeverity] = useState('All')
  const metadata = [['Production','Data Engineering','High','15m ago'], ['Production','Analytics','Medium','42m ago'], ['Staging','Machine Learning','High','1h ago'], ['Development','Data Engineering','Medium','2h ago'], ['Production','Platform Engineering','Low','3h ago']]
  const multiplier = range === 'Last 7 Days' ? .52 : range === 'Last 24 Hours' ? .2 : 1
  const displayed = rows.slice(0, 5).map((row, index) => ({ row, index, environment: metadata[index][0], team: metadata[index][1], severity: metadata[index][2], lastFailed: metadata[index][3] })).filter(item => (environment === 'All' || item.environment === environment) && (team === 'All' || item.team === team) && (severity === 'All' || item.severity === severity))
  return <Panel title="Top Failing Workflows" icon={AlertTriangle} action={<div className="flex items-center gap-3"><select value={range} onChange={e => setRange(e.target.value)} aria-label="Failure time range" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 outline-none"><option>Last 30 Days</option><option>Last 7 Days</option><option>Last 24 Hours</option></select><button className="text-[10px] font-semibold text-blue-600">View all</button></div>}>
    <p className="mb-3 text-[10px] text-slate-500">Most Frequent Failures</p>
    <div className="grid grid-cols-[1.45fr_.72fr_.7fr_.55fr_.65fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>Failure Count</span><span>Failure Rate</span><span>Trend</span><span>Last Failed</span></div>
    {displayed.map(({ row, index, lastFailed }) => { const count = Math.round((28 - index * 4) * multiplier); const rate = Math.round((18 - index * 2.75) * multiplier); const rising = index % 2 === 0; return <div key={row.job} className="grid grid-cols-[1.45fr_.72fr_.7fr_.55fr_.65fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><b className="text-slate-500">{count}</b><b className="text-slate-500">{rate}%</b><span className={rising ? 'font-semibold text-red-500' : 'font-semibold text-emerald-500'}>{rising ? '↑' : '↓'} {12 - index * 2}%</span><span className="text-slate-500">{lastFailed}</span></div> })}
    {!displayed.length && <div className="py-6 text-center text-[10px] text-slate-400">No failed workflows match the selected filters.</div>}
    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><select value={environment} onChange={e => setEnvironment(e.target.value)} aria-label="Filter failing workflows by environment" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Environment: All</option><option>Production</option><option>Staging</option><option>Development</option></select><select value={team} onChange={e => setTeam(e.target.value)} aria-label="Filter failing workflows by team" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Team: All</option><option>Data Engineering</option><option>Analytics</option><option>Machine Learning</option><option>Platform Engineering</option></select><select value={severity} onChange={e => setSeverity(e.target.value)} aria-label="Filter failing workflows by severity" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Severity: All</option><option>High</option><option>Medium</option><option>Low</option></select></div>
    <p className="mt-3 text-[10px] text-slate-400">Based on failure count in selected time range</p>
  </Panel>
}

function LongRunning({ rows }) {
  const [threshold, setThreshold] = useState('> 24 Hours')
  const [environment, setEnvironment] = useState('All')
  const [team, setTeam] = useState('All')
  const [status, setStatus] = useState('Running')
  const times = ['08:15 AM', '09:21 AM', '10:05 AM', '10:44 AM', '11:31 AM']
  const expected = ['2h', '3h', '1h 30m', '4h', '1h']
  const delays = ['+29h 24m', '+24h 11m', '+24h 18m', '+20h 05m', '+22h 17m']
  return <Panel title="Top Long Running Jobs" icon={Clock3} action={<div className="flex items-center gap-3"><select value={threshold} onChange={e => setThreshold(e.target.value)} aria-label="Long-running threshold" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 outline-none"><option>&gt; 24 Hours</option><option>&gt; 12 Hours</option><option>All Durations</option></select><button className="text-[10px] font-semibold text-blue-600">View all</button></div>}>
    <p className="mb-3 text-[10px] text-slate-500">Exceeded Expected Duration (SLA)</p>
    <div className="grid grid-cols-[1.35fr_.68fr_.72fr_.7fr_.9fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>Expected Duration</span><span>Running Time</span><span>Delay</span><span>Start Time</span></div>
    {rows.slice(0, 5).map((row, index) => <div key={row.job} className="grid grid-cols-[1.35fr_.68fr_.72fr_.7fr_.9fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><span className="font-semibold text-slate-500">{expected[index]}</span><span className="font-semibold text-slate-600">{row.runtime}</span><span><i className="rounded bg-red-50 px-1.5 py-1 text-[9px] font-bold not-italic text-red-500">{delays[index]}</i></span><span className="text-slate-500">Today, {times[index]}</span></div>)}
    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><select value={environment} onChange={e => setEnvironment(e.target.value)} aria-label="Filter long-running jobs by environment" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option>Environment: All</option><option>Production</option><option>Staging</option><option>Development</option></select><select value={team} onChange={e => setTeam(e.target.value)} aria-label="Filter long-running jobs by team" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option>Team: All</option><option>Data Engineering</option><option>Analytics</option><option>Platform Engineering</option></select><select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter long-running jobs by status" className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-600 outline-none"><option>Status: Running</option><option>Status: Failed</option><option>Status: All</option></select></div>
    <p className="mt-3 text-[10px] text-slate-400">Jobs running longer than selected threshold or SLA</p>
  </Panel>
}

function CloudCostIntelligence({ cost }) {
  const costBase = Math.max(cost, 1)
  const breakdown = [['Compute', cost * .525, 'bg-blue-500'], ['Storage', cost * .244, 'bg-emerald-500'], ['Network', cost * .143, 'bg-violet-500'], ['Others', cost * .088, 'bg-amber-400']]
  const opportunities = [['Right-size VMs', '$982/mo'], ['Cleanup Storage', '$673/mo'], ['Idle Resources', '$499/mo']]
  return <Panel title="Cloud Cost Intelligence" icon={CircleDollarSign} action={<button className="text-[10px] font-semibold text-slate-600">This Month <ChevronDown size={12} className="inline"/></button>}>
    <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-[1fr_1fr_.7fr] lg:divide-x lg:divide-y-0">
      <div className="pb-3 lg:pr-5 lg:pb-0"><div className="text-[10px] font-semibold text-slate-500">Total Cost</div><div className="mt-1 font-mono text-2xl font-semibold text-slate-900">$${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><div className="mt-1 text-[10px] font-medium text-red-500">↓ 8.6% vs last month</div></div>
      <div className="py-3 lg:px-5 lg:py-0"><div className="text-[10px] font-semibold text-slate-500">Potential Savings</div><div className="mt-1 font-mono text-2xl font-semibold text-slate-900">$2,154<span className="text-xs"> /mo</span></div><div className="mt-1 text-[10px] font-medium text-emerald-500">18% of spend</div></div>
      <div className="flex items-center gap-3 pt-3 lg:pl-5 lg:pt-0"><div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: 'conic-gradient(#34c98b 64.8deg, #e9eef6 0)' }}><div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-slate-700">18%</div></div><div><div className="text-[10px] font-semibold text-slate-700">Savings Score</div><div className="mt-1 text-[9px] text-slate-400">Optimization potential</div></div></div>
    </div>
    <div className="mt-4 grid grid-cols-1 gap-5 border-t border-slate-100 pt-3 md:grid-cols-2">
      <div><div className="mb-2 text-[9px] font-bold text-slate-600">Cost Breakdown</div>{breakdown.map(([name, amount, color]) => <div key={name} className="mb-2 flex items-center gap-2 text-[10px]"><span className="w-16 text-slate-500">{name}</span><i className="h-1 flex-1 rounded bg-slate-100"><i className={"block h-full rounded " + color} style={{ width: Math.max(18, amount / costBase * 100) + '%' }}/></i><b className="w-10 text-right text-slate-600">$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></div>)}<button className="mt-2 text-[10px] font-semibold text-blue-600">View Cost Analytics →</button></div>
      <div className="border-t border-slate-100 pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0"><div className="mb-2 text-[9px] font-bold text-slate-600">Top Optimization Opportunities</div>{opportunities.map(([name, saving], index) => <div key={name} className="mb-2 flex items-center justify-between text-[10px]"><span className="text-slate-500"><i className={"mr-2 inline-block h-2 w-2 rounded-sm " + (index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-emerald-500' : 'bg-violet-500')}/>{name}</span><b className="text-emerald-600">{saving}</b></div>)}<div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[10px] font-bold"><span className="text-slate-600">Total</span><span className="text-emerald-600">$2154/mo</span></div><button className="mt-2 text-[10px] font-semibold text-blue-600">View Recommendations →</button></div>
    </div>
  </Panel>
}

function DashboardFilterPanel({ title, icon, rows, kind }) {
  const [viewAll,setViewAll] = useState(false), [primary,setPrimary] = useState(kind === 'failing' ? 'Last 30 Days' : kind === 'long' ? '> 24 Hours' : '> 80% CPU'), [team,setTeam] = useState('All'), [secondary,setSecondary] = useState(kind === 'failing' ? 'All' : kind === 'long' ? 'Running' : 'All'), [sort,setSort] = useState('default')
  const metadata = [['Data Engineering','High','AWS',262],['Analytics','Medium','AWS',206],['Machine Learning','High','GCP',144],['Platform Engineering','Medium','Azure',105],['Data Engineering','Low','AWS',58]]
  const filtered = rows.map((row,index) => ({ row,index, team:metadata[index % metadata.length][0], severity:metadata[index % metadata.length][1], cloud:metadata[index % metadata.length][2], minutes:row.runtime_mins || metadata[index % metadata.length][3], cpu:[96,94,91,89,87][index] || 80 })).filter(item => (team === 'All' || item.team === team) && (kind !== 'failing' || secondary === 'All' || item.severity === secondary) && (kind !== 'long' || secondary === 'All' || secondary === 'Running') && (kind !== 'cpu' || secondary === 'All' || item.cloud === secondary) && (kind !== 'long' || primary === 'All Durations' || item.minutes > (primary === '> 24 Hours' ? 60 : 0)) && (kind !== 'cpu' || primary === 'All CPU' || item.cpu > (primary === '> 90% CPU' ? 90 : 80))).sort((a,b) => sort === 'asc' ? a.row.job.localeCompare(b.row.job) : sort === 'desc' ? b.row.job.localeCompare(a.row.job) : 0)
  const visible = viewAll ? filtered : filtered.slice(0,5)
  const config = kind === 'failing' ? { columns:['Workflow','Failure Count','Failure Rate','Severity'], options:['Last 30 Days','Last 7 Days','Last 24 Hours'], second:['All','High','Medium','Low'], secondLabel:'Severity', description:'Based on failure count in selected time range' } : kind === 'long' ? { columns:['Workflow','Expected Duration','Running Time','Status'], options:['> 24 Hours','> 12 Hours','All Durations'], second:['Running','Failed','All'], secondLabel:'Status', description:'Jobs running longer than selected threshold or SLA' } : { columns:['Workflow','CPU','AI Action','Savings (Est.)'], options:['> 80% CPU','> 90% CPU','All CPU'], second:['All','AWS','GCP','Azure'], secondLabel:'Cloud', description:'AI estimated monthly savings based on usage patterns' }
  return <Panel title={title} icon={icon} action={<div className="flex items-center gap-3"><select value={primary} onChange={e => setPrimary(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 outline-none">{config.options.map(option => <option key={option}>{option}</option>)}</select><button onClick={() => setViewAll(value => !value)} className="text-[10px] font-semibold text-blue-600">{viewAll ? 'Show less' : 'View all'}</button></div>}><div className={`grid ${kind === 'failing' ? 'grid-cols-[1.5fr_.8fr_.8fr_.65fr]' : kind === 'long' ? 'grid-cols-[1.5fr_.8fr_.8fr_.65fr]' : 'grid-cols-[1.4fr_.7fr_1.2fr_.8fr]'} border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500`}>{config.columns.map((column,index) => <button key={column} onClick={() => index === 0 && setSort(sort === 'asc' ? 'desc' : 'asc')} className={`text-left ${index === 0 ? 'hover:text-blue-600' : ''}`}>{column}{index === 0 && ' ↕'}</button>)}</div>{visible.map(({row,index,cpu,minutes}) => <div key={row.job} className={`grid ${kind === 'failing' ? 'grid-cols-[1.5fr_.8fr_.8fr_.65fr]' : kind === 'long' ? 'grid-cols-[1.5fr_.8fr_.8fr_.65fr]' : 'grid-cols-[1.4fr_.7fr_1.2fr_.8fr]'} items-center py-2.5 text-[10px]`}><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div>{kind === 'failing' ? <><b className="text-slate-600">{Math.max(4,28-index*4)}</b><b className="text-slate-600">{Math.max(5,18-index*3)}%</b><span className="text-slate-500">{metadata[index][1]}</span></> : kind === 'long' ? <><span className="text-slate-500">{['2h','3h','1h 30m','4h','1h'][index]}</span><b className="text-slate-600">{row.runtime}</b><span className="text-slate-500">Running</span></> : <><b className="text-slate-600">{cpu}%</b><span className="text-slate-600">{['Right-size VM','Increase Auto-scaling','Use Spot Instances','Right-size Cluster','Optimize Query'][index]}</span><b className="text-emerald-600">${[18000,12500,9200,8100,6700][index]?.toLocaleString()}/mo</b></>}</div>)}{!visible.length && <div className="py-6 text-center text-[10px] text-slate-400">No jobs match the selected filters.</div>}<div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><select value={team} onChange={e => setTeam(e.target.value)} aria-label={`Filter ${title} by team`} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none"><option value="All">Team: All</option><option>Data Engineering</option><option>Analytics</option><option>Machine Learning</option><option>Platform Engineering</option></select><select value={secondary} onChange={e => setSecondary(e.target.value)} aria-label={`Filter ${title} by ${config.secondLabel.toLowerCase()}`} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-600 outline-none">{config.second.map(option => <option key={option} value={option}>{config.secondLabel}: {option}</option>)}</select></div><p className="mt-3 text-[10px] text-slate-400">{config.description}</p></Panel>
}

const fallbackSla = [
  { job: 'customer-sync-api', workflow: 'CRM → DW', overdue_mins: 134, breach_count: 3 },
  { job: 'inventory-recon-nightly', workflow: 'Batch', overdue_mins: 105, breach_count: 2 },
  { job: 'risk-score-batch', workflow: 'BigQuery ML', overdue_mins: 58, breach_count: 1 },
  { job: 'airflow-dag-reports', workflow: 'Airflow', overdue_mins: 32, breach_count: 1 },
  { job: 'kafka-consumer-lag', workflow: 'Streaming', overdue_mins: 21, breach_count: 1 },
]

const fallbackCpu = [
  { job: 'customer-sync-api', workflow: 'CRM → DW', cpu_pct: 43 },
  { job: 'inventory-recon-nightly', workflow: 'Batch', cpu_pct: 32 },
  { job: 'risk-score-batch', workflow: 'BigQuery ML', cpu_pct: 28 },
  { job: 'payments-etl-daily', workflow: 'ETL', cpu_pct: 19 },
  { job: 'fraud-detection-stream', workflow: 'Kafka', cpu_pct: 15 },
]

const schedules = [
  ['inventory-recon-nightly', 'Batch', '01:00 AM', 'In 2h 15m'],
  ['risk-score-batch', 'BigQuery ML', '03:30 AM', 'In 4h 45m'],
  ['payments-etl-daily', 'ETL', '06:00 AM', 'In 7h 15m'],
  ['airflow-dag-reports', 'Airflow', '07:30 AM', 'In 8h 45m'],
  ['kafka-consumer-lag', 'Streaming', '09:00 AM', 'In 10h 15m'],
]

const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range']
const DASHBOARD_FILTERS = { team: 'All', workflowType: 'All', status: 'All', severity: 'All', resourceType: 'All' }
const FILTER_OPTIONS = {
  team: ['All', 'Data Engineering', 'Analytics', 'Machine Learning', 'Platform Engineering'],
  workflowType: ['All', 'ETL Pipelines', 'Kafka Streams', 'Airflow DAGs', 'BigQuery Jobs', 'Batch Reports'],
  status: ['All', 'Running', 'Failed', 'Completed', 'SLA Risk', 'Queued'],
  severity: ['All', 'Critical', 'High', 'Medium', 'Low'],
  resourceType: ['All', 'CPU', 'Memory', 'Storage', 'Network'],
}

function metadataFor(row, index) {
  const workflow = String(row.workflow || '')
  const workflowType = /kafka|stream/i.test(workflow) ? 'Kafka Streams' : /airflow/i.test(workflow) ? 'Airflow DAGs' : /bigquery/i.test(workflow) ? 'BigQuery Jobs' : /batch/i.test(workflow) ? 'Batch Reports' : 'ETL Pipelines'
  return {
    team: ['Data Engineering', 'Analytics', 'Machine Learning', 'Platform Engineering', 'Data Engineering'][index % 5],
    workflowType,
    status: ['Running', 'Failed', 'Completed', 'SLA Risk', 'Queued'][index % 5],
    severity: ['Critical', 'High', 'Medium', 'Low', 'Medium'][index % 5],
    resourceType: ['CPU', 'Memory', 'Storage', 'Network', 'CPU'][index % 5],
  }
}

function filterDashboardRows(rows, filters, range) {
  const rangeLimit = { Today: 3, Yesterday: 2, 'Last 7 Days': 4, 'Last 30 Days': 5, 'This Month': 5, 'Last Month': 4, 'Custom Range': 5 }[range] || 5
  return rows.filter((row, index) => {
    const metadata = metadataFor(row, index)
    return index < rangeLimit && Object.entries(filters).every(([key, value]) => value === 'All' || metadata[key] === value)
  })
}

function DashboardControls({ range, setRange, filters, onApply, onReset, onClear }) {
  const [rangeOpen, setRangeOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draft, setDraft] = useState(filters)
  const controlsRef = useRef(null)
  useEffect(() => setDraft(filters), [filters])
  useEffect(() => {
    const close = event => { if (!controlsRef.current?.contains(event.target)) { setRangeOpen(false); setFiltersOpen(false) } }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const selectClass = 'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none'
  return <div ref={controlsRef} className="relative flex items-center gap-2"><div className="relative"><button onClick={() => { setRangeOpen(value => !value); setFiltersOpen(false) }} aria-expanded={rangeOpen} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"><CalendarDays size={14}/>{range}<ChevronDown size={14}/></button>{rangeOpen && <div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">{DATE_RANGES.map(option => <button key={option} onClick={() => { setRange(option); setRangeOpen(false) }} className={`block w-full rounded-md px-3 py-2 text-left text-xs ${range === option ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>{option}</button>)}</div>}</div><div className="relative"><button onClick={() => { setFiltersOpen(value => !value); setRangeOpen(false) }} aria-expanded={filtersOpen} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"><SlidersHorizontal size={14}/>Filters<ChevronDown size={14}/></button>{filtersOpen && <div className="absolute right-0 z-30 mt-2 w-[300px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl"><div className="grid grid-cols-2 gap-3">{Object.entries(FILTER_OPTIONS).map(([key, options]) => <label key={key} className="text-[10px] font-semibold capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}<select value={draft[key]} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} className={`mt-1 ${selectClass}`}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><button onClick={() => setDraft(DASHBOARD_FILTERS)} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700">Reset</button><div className="flex gap-2"><button onClick={() => { setDraft(DASHBOARD_FILTERS); onClear(); setFiltersOpen(false) }} className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50">Clear All</button><button onClick={() => { onApply(draft); setFiltersOpen(false) }} className="rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white">Apply</button></div></div></div>}</div></div>
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [sla, setSla] = useState([])
  const [long, setLong] = useState([])
  const [cpu, setCpu] = useState([])
  const [report, setReport] = useState([])
  const [alerts, setAlerts] = useState([])
  const [range, setRange] = useState(() => sessionStorage.getItem('nexaops_dashboard_range') || 'Today')
  const [filters, setFilters] = useState(() => {
    try { return { ...DASHBOARD_FILTERS, ...JSON.parse(sessionStorage.getItem('nexaops_dashboard_filters') || '{}') } } catch { return DASHBOARD_FILTERS }
  })

  useEffect(() => {
    getDashboardSummary().then(r => setSummary(r.data)).catch(() => {})
    getSlaBreaches().then(r => setSla(r.data.top_sla_breaches)).catch(() => {})
    getHighCpu().then(r => setCpu(r.data.top_high_cpu)).catch(() => {})
    getDailyReport().then(r => setReport(r.data.workflows)).catch(() => {})
    getActiveAlerts().then(r => setAlerts(r.data.alerts)).catch(() => {})
    getLongRunning().then(r => setLong(r.data.top_long_running)).catch(() => {})
  }, [])

  useEffect(() => {
    sessionStorage.setItem('nexaops_dashboard_range', range)
    sessionStorage.setItem('nexaops_dashboard_filters', JSON.stringify(filters))
  }, [range, filters])

  const slaRows = sla.length ? sla : fallbackSla
  const cpuRows = cpu.length ? cpu : fallbackCpu
  const longRows = long.length ? long : [
    { job: 'risk-score-batch', workflow: 'BigQuery ML', runtime: '4h 22m', runtime_mins: 262 },
    { job: 'spark-user-features', workflow: 'Spark', runtime: '3h 26m', runtime_mins: 206 },
    { job: 'payments-etl-daily', workflow: 'ETL', runtime: '2h 24m', runtime_mins: 144 },
    { job: 'inventory-recon-nightly', workflow: 'Batch', runtime: '1h 45m', runtime_mins: 105 },
    { job: 'customer-sync-api', workflow: 'ETL', runtime: '58m', runtime_mins: 58 },
  ]
  const totalRuns = useMemo(() => report.reduce((sum, row) => sum + (Number(row.total) || 0), 0), [report])
  const successRate = summary?.success_rate || '99.4%'
  const activeWorkflows = summary?.active_workflows || new Set(report.map(row => row.name)).size || 3
  const recovery = `${summary?.avg_runtime_mins || 14}m`
  const incidents = alerts.length || summary?.failed_today || 2
  const cost = Math.max(12842.55, totalRuns * 14.72)
  const filteredCpuRows = useMemo(() => filterDashboardRows(cpuRows, filters, range), [cpuRows, filters, range])
  const filteredLongRows = useMemo(() => filterDashboardRows(longRows, filters, range), [longRows, filters, range])
  const filteredSlaRows = useMemo(() => filterDashboardRows(slaRows, filters, range), [slaRows, filters, range])
  const filteredCost = filteredCpuRows.length ? cost * (filteredCpuRows.length / Math.max(cpuRows.length, 1)) : 0

  const kpis = [
    { label: 'Success Rate', value: successRate, delta: '1.2% vs yesterday', icon: Activity, tone: 'green' },
    { label: 'Active Workflows', value: filters.team === 'All' && filters.workflowType === 'All' ? activeWorkflows : filteredCpuRows.length, delta: '8 vs yesterday', icon: Layers3, tone: 'blue' },
    { label: 'Mean Recovery Time', value: recovery, delta: '3m vs yesterday', icon: Clock3, tone: 'violet' },
    { label: 'Incidents', value: filters.status === 'All' ? incidents : filteredSlaRows.length, delta: '3 vs yesterday', icon: AlertTriangle, tone: 'red' },
    { label: 'SLA Compliance', value: '96.7%', delta: '0.8% vs yesterday', icon: ShieldCheck, tone: 'amber' },
  ]

  return <div className="min-h-full shrink-0 bg-[#fbfcff] p-4 md:p-5">
    <div className="mx-auto flex max-w-[1500px] flex-col gap-3.5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1><p className="mt-0.5 text-xs text-slate-500">Real-time overview of operations, performance and optimization.</p></div>
        <div className="flex items-center gap-2"><DashboardControls range={range} setRange={setRange} filters={filters} onApply={setFilters} onReset={() => setFilters(DASHBOARD_FILTERS)} onClear={() => setFilters(DASHBOARD_FILTERS)}/><button aria-label="Refresh dashboard" className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm"><RefreshCw size={15}/></button></div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.map(item => <KpiCard key={item.label} {...item}/>)}</section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[.72fr_1.68fr]">
        <ResourceCard cpuRows={filteredCpuRows}/>
        <CloudCostIntelligence cost={filteredCost}/>
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <DashboardFilterPanel title="Top Failing Workflows" icon={AlertTriangle} rows={filteredCpuRows} kind="failing"/>
        <SlaBreaches rows={filteredSlaRows}/>
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <DashboardFilterPanel title="Top Long Running Jobs" icon={Clock3} rows={filteredLongRows} kind="long"/>
        <DashboardFilterPanel title="Top 5 High CPU Jobs" icon={Cpu} rows={filteredCpuRows} kind="cpu"/>
      </section>

    </div>
  </div>
}

function KpiCard({ label, value, delta, icon: Icon, tone }) {
  const tones = { green: 'bg-emerald-50 text-emerald-500', blue: 'bg-blue-50 text-blue-600', violet: 'bg-violet-50 text-violet-600', red: 'bg-red-50 text-red-500', amber: 'bg-amber-50 text-amber-500' }
  const deltaTone = tone === 'green' || tone === 'blue' || tone === 'violet' ? 'text-emerald-500' : 'text-red-500'
  return <article className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-200/40"><div className="flex items-center gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={22}/></span><div><div className="text-[10px] font-bold text-slate-600">{label}</div><div className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900">{value}</div><div className={`mt-1 text-[10px] font-medium ${deltaTone}`}>{tone === 'green' || tone === 'blue' || tone === 'violet' ? '↑' : '↓'} {delta}</div></div></div></article>
}

function Panel({ title, icon: Icon, action, children, className = '' }) { return <section className={`rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-200/30 ${className}`}><header className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={15}/></span>{title}</div>{action}</header>{children}</section> }

function Gauge({ label, value, color, icon: Icon }) { return <div className="flex flex-col items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-slate-500"><Icon size={14}/></span><div className="relative grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${value * 3.6}deg, #e9eef6 0)` }}><div className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-bold text-slate-700">{value}%</div></div><span className="text-[10px] font-semibold text-slate-600">{label}</span></div> }

function ResourceCard({ cpuRows }) { const cpu = Math.min(94, Math.max(42, Math.round(Number(cpuRows[0]?.cpu_pct) || 42))); return <Panel title="Resource Utilization" icon={Cpu}><div className="grid grid-cols-4 gap-2"><Gauge label="CPU" value={cpu} color="#3b82f6" icon={Cpu}/><Gauge label="Memory" value={63} color="#34c98b" icon={Database}/><Gauge label="Storage" value={58} color="#9566f5" icon={Database}/><Gauge label="Network" value={34} color="#f7a53b" icon={Network}/></div><button className="mt-5 text-[11px] font-semibold text-blue-600">View all resources →</button></Panel> }

function CostOverview({ cost }) { const segments = [['Compute', cost * .525, '7.2%'], ['Storage', cost * .244, '5.1%'], ['Network', cost * .143, '12.4%'], ['Others', cost * .088, '6.3%']]; return <Panel title="Cost Overview" icon={CircleDollarSign} action={<button className="text-[10px] font-semibold text-slate-600">This Month <ChevronDown size={12} className="inline"/></button>}><div className="text-[10px] font-semibold text-slate-500">Total Cost</div><div className="mt-1 font-mono text-2xl font-semibold text-slate-900">${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div className="mt-1 text-[10px] font-medium text-emerald-500">↓ 8.6% vs last month</div><div className="mt-4 grid grid-cols-4 divide-x divide-slate-200 border-t border-slate-100 pt-3">{segments.map(([name, amount, delta]) => <div key={name} className="px-2 first:pl-0"><div className="text-[9px] font-semibold text-slate-500">{name}</div><div className="mt-1 text-[11px] font-bold text-slate-700">${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><div className="mt-1 text-[9px] text-emerald-500">↓ {delta}</div></div>)}</div><button className="mt-5 text-[11px] font-semibold text-blue-600">View cost details →</button></Panel> }

function CostOptimization() { return <Panel title="Cost Optimization" icon={Leaf}><div className="flex items-start justify-between"><div><div className="text-[10px] font-semibold text-slate-500">Potential Savings</div><div className="mt-1 font-mono text-2xl font-semibold text-emerald-600">$2,154.00<span className="text-xs"> /mo</span></div><div className="mt-1 text-[10px] text-slate-500">18% of current spend</div></div><div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: 'conic-gradient(#42c98a 64.8deg, #e9eef6 0)' }}><div className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-bold text-slate-700">18%</div></div></div><div className="mt-4 text-[10px] font-bold text-slate-600">Top Opportunities</div><ul className="mt-2 space-y-1.5 text-[10px] text-slate-500">{[['Right-size overprovisioned VMs', '$982/mo'], ['Unused storage cleanup', '$673/mo'], ['Idle resources cleanup', '$499/mo']].map(([name, amount]) => <li key={name} className="flex items-center justify-between"><span><i className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-400"/>{name}</span><b className="text-emerald-600">{amount}</b></li>)}</ul><button className="mt-4 text-[11px] font-semibold text-blue-600">View all recommendations →</button></Panel> }

function MiniTable({ headers, children }) { return <div className="overflow-x-auto"><div className="min-w-[340px]"><div className="grid grid-cols-[1.4fr_.55fr_.65fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500">{headers.map(header => <span key={header}>{header}</span>)}</div>{children}</div></div> }

function LegacyFailingWorkflows({ rows }) { return <Panel title="Top Failing Workflows" icon={Activity} action={<button className="text-[10px] font-semibold text-blue-600">View all</button>}><MiniTable headers={['Workflow', 'Failures', 'Error Rate']}>{rows.slice(0, 5).map((row, index) => <div key={row.job} className="grid grid-cols-[1.4fr_.55fr_.65fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><span className="font-semibold text-slate-600">{Math.max(3, 13 - index * 2)}</span><span className="flex items-center gap-2"><i className="h-1 w-10 rounded bg-slate-100"><i className="block h-full rounded bg-red-500" style={{ width: `${Math.max(15, 80 - index * 14)}%` }}/></i><b className="text-slate-500">{row.cpu_pct || Math.max(15, 43 - index * 6)}%</b></span></div>)}</MiniTable></Panel> }

function SlaBreaches({ rows }) { return <Panel title="SLA Breaches" icon={AlertTriangle} action={<button className="text-[10px] font-semibold text-blue-600">View all</button>}><MiniTable headers={['Workflow', 'Breached SLA', 'Severity']}>{rows.slice(0, 5).map((row, index) => { const severity = index === 0 ? 'High' : index < 3 ? 'Medium' : 'Low'; const colors = { High: 'bg-red-50 text-red-500', Medium: 'bg-orange-50 text-orange-500', Low: 'bg-emerald-50 text-emerald-600' }; return <div key={row.job} className="grid grid-cols-[1.4fr_.55fr_.65fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><span className="text-slate-500">{row.overdue_mins >= 60 ? `${Math.floor(row.overdue_mins / 60)}h ${row.overdue_mins % 60}m` : `${row.overdue_mins}m`}</span><span><i className={`rounded px-2 py-1 text-[9px] font-bold not-italic ${colors[severity]}`}>{severity}</i></span></div> })}</MiniTable></Panel> }

function UpcomingSchedules() { return <Panel title="Upcoming Schedules" icon={CalendarDays} action={<button className="text-[10px] font-semibold text-blue-600">View all</button>}><div className="grid grid-cols-[1.3fr_.65fr_.5fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>Schedule Time</span><span>Type</span></div>{schedules.map(([name, workflow, time, eta]) => <div key={name} className="grid grid-cols-[1.3fr_.65fr_.5fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{name}</b><span className="text-slate-400">{workflow}</span></div><div><b className="block text-slate-600">{time}</b><span className="text-slate-400">{eta}</span></div><span><i className="rounded bg-blue-50 px-2 py-1 text-[9px] font-bold not-italic text-blue-600">{workflow.includes('Batch') ? 'Batch' : workflow.includes('Streaming') ? 'Streaming' : 'ETL'}</i></span></div>)}</Panel> }

function LegacyLongRunning({ rows }) { return <Panel title="Top 5 Long Running" icon={Clock3} action={<button className="text-[10px] font-semibold text-blue-600">View all</button>}><div className="grid grid-cols-[1.4fr_.75fr_.7fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>Duration</span><span>Start Time</span></div>{rows.slice(0, 5).map((row, index) => <div key={row.job} className="grid grid-cols-[1.4fr_.75fr_.7fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}</span></div><span className="flex items-center gap-2"><i className="h-1 w-10 rounded bg-slate-100"><i className="block h-full rounded bg-blue-500" style={{ width: `${Math.max(20, 100 - index * 19)}%` }}/></i><b className="text-blue-600">{row.runtime}</b></span><span className="text-slate-500">Today, {['08:15 AM', '09:21 AM', '10:05 AM', '10:44 AM', '11:31 AM'][index]}</span></div>)}</Panel> }

function LegacyHighCpu({ rows }) { return <Panel title="Top 5 High CPU" icon={Cpu} action={<button className="text-[10px] font-semibold text-blue-600">View all</button>}><div className="grid grid-cols-[1.4fr_.55fr_.8fr] border-b border-slate-100 pb-2 text-[8px] font-bold uppercase tracking-wide text-slate-500"><span>Workflow</span><span>CPU</span><span>Usage</span></div>{rows.slice(0, 5).map((row, index) => { const value = row.cpu_pct || Math.max(38, 94 - index * 14); const bar = index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-400' : 'bg-blue-400'; return <div key={row.job} className="grid grid-cols-[1.4fr_.55fr_.8fr] items-center py-2 text-[10px]"><div><b className="block truncate text-slate-700">{row.job}</b><span className="text-slate-400">{row.workflow}{row.cores ? ` · ${row.cores} cores` : ''}</span></div><b className={index === 0 ? 'text-red-500' : index === 1 ? 'text-orange-500' : 'text-blue-600'}>{value}%</b><i className="h-1 w-full rounded bg-slate-100"><i className={`block h-full rounded ${bar}`} style={{ width: `${value}%` }}/></i></div> })}</Panel> }

function ChangeRequests() { const items = [['Open', '7', FileCheck2, 'blue'], ['In Review', '3', SlidersHorizontal, 'amber'], ['Approved', '5', CheckCircle2, 'green'], ['Implemented (7D)', '12', Zap, 'violet']]; const tones = { blue: 'bg-blue-50 text-blue-600', amber: 'bg-orange-50 text-orange-500', green: 'bg-emerald-50 text-emerald-500', violet: 'bg-violet-50 text-violet-600' }; return <Panel title="Change Requests" icon={FileCheck2}><div className="flex flex-col gap-4 md:flex-row md:items-center">{items.map(([label, value, Icon, tone]) => <div key={label} className="flex flex-1 items-center gap-3 border-slate-200 md:border-r md:last:border-0"><span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={18}/></span><div><div className="text-[10px] font-semibold text-slate-500">{label}</div><div className="font-mono text-xl font-semibold text-slate-800">{value}</div></div></div>)}<button className="whitespace-nowrap text-[11px] font-semibold text-blue-600">View all change requests →</button></div></Panel> }
