import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, ChevronDown, ChevronRight, CirclePlay, Code2, Database, Download, Edit3, FileText, Github, GitPullRequest, Mail, MapPin, Maximize2, Radio, RefreshCw, Search, SlidersHorizontal, Sparkles, Terminal, Users, Wrench, X, Zap } from 'lucide-react'
import { getJobChildren, getJobs, getResolution, getJobSummary, sendApprovalEmail } from '../api/jobs.js'
import Chatbot from '../components/Chatbot.jsx'
import SlaBreachDetail from '../components/SlaBreachDetail.jsx'

function ResolutionDrawer({ job,onClose }) {
  const [sent,setSent] = useState(false), [view,setView] = useState(null), [aiCode,setAiCode] = useState(generatedCode)
  const download = () => { const blob = new Blob([aiCode], { type: 'text/sql' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'product_join.ai.sql'; link.click(); URL.revokeObjectURL(link.href) }
  return <><aside className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-[#fbfcff] text-slate-700"><header className="border-b border-slate-200 bg-white px-6 py-3"><div className="mb-2 text-[11px] font-medium text-slate-400">Jobs <span className="mx-2">›</span> Failed Jobs <span className="mx-2">›</span> {job.name}</div><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-slate-800">{job.name}</h2><span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">FAILED · P1</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{job.workflow}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{job.start}</span></div><div className="mt-3 flex flex-wrap gap-x-7 gap-y-1 text-[11px] text-slate-500"><span>Run ID: 784512</span><span>Environment: Production</span><span>Started: Today, 08:13 AM</span></div></div><div className="flex items-center gap-5"><span className="text-[11px] text-slate-400">Incident ID: INC-2024-05-24-1023</span><button onClick={onClose} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><ArrowLeft size={14}/>Back to Jobs</button></div></div></header><div className="grid flex-1 min-h-0 grid-cols-1 overflow-auto p-5 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-4"><main className="space-y-3"><div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] text-blue-600">You have view-only access to this incident. Only pipeline owner or authorized members can modify code or raise CR.</div><section className="rounded-lg border border-slate-200 bg-white"><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><b className="text-[11px] uppercase text-slate-600">Relevant Error Logs</b><span className="text-[10px] font-semibold text-red-400">3 Relevant Errors</span></header><pre className="m-3 overflow-auto rounded-md bg-[#071421] p-3 font-mono text-[11px] leading-5 text-slate-200">08:14:31  [query-engine]  <span className="text-red-400">INT64 cannot be compared with STRING</span>{'\n'}08:14:31  [data-migrator]  Join condition failed: orders.customer_id (INT64) = customers.customer_id (STRING){'\n'}08:14:31  [orchestrator]  Task failed after 14 seconds{'\n'}Context: orders.customer_id is INT64 but customers.customer_id is STRING. Please cast to the same type.</pre></section><section className="rounded-lg border border-slate-200 bg-white"><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><b className="text-[11px] uppercase text-slate-600">AI Resolution Workflow</b><span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">96% Confidence</span></header><div className="space-y-3 p-4 text-[11px]"><Info label="Detected Issue" text="Type mismatch in JOIN condition: orders.customer_id (INT64) is joined with customers.customer_id (STRING)."/><Info label="AI Recommendation" text="Cast orders.customer_id to STRING before the join to ensure data type compatibility."/><CodeComparison aiCode={aiCode} onCompare={() => setView('compare')} onEdit={() => setView('edit')}/></div></section><section className="rounded-lg border border-slate-200 bg-white p-4"><b className="text-[11px] uppercase text-slate-600">Approval & Next Steps</b><p className="mt-2 text-[11px] text-slate-500">Review the AI-generated fix and approve to start the Change Request (CR) process.</p><div className="mt-3 grid gap-2 md:grid-cols-3"><button className="rounded-md border border-blue-300 bg-blue-50 p-3 text-left text-[11px] font-semibold text-blue-700">In-Platform Code Comparison<span className="mt-1 block text-[10px] font-normal text-slate-500">Compare and approve within NexaOps.</span></button><button className="rounded-md border border-slate-200 p-3 text-left text-[11px] font-semibold text-slate-700">GitHub Repository Comparison<span className="mt-1 block text-[10px] font-normal text-slate-500">Create PR and compare in GitHub.</span></button><button className="rounded-md border border-slate-200 p-3 text-left text-[11px] font-semibold text-slate-700">Email with Attachments<span className="mt-1 block text-[10px] font-normal text-slate-500">Send code diff via email for approval.</span></button></div><div className="mt-3 flex justify-end"><Action label={sent ? 'Sent for Approval' : 'Approve & Start CR'} icon={CheckCircle2} primary onClick={() => setSent(true)}/></div></section></main><aside className="h-fit rounded-lg border border-slate-200 bg-white text-[11px]"><Summary title="Incident Summary" rows={[['Status','FAILED'],['Severity','P1 - Critical'],['Pipeline',job.workflow],['Environment','Production'],['Start Time','08:13 AM'],['Duration','38m 24s']]}/><Summary title="Business Impact" rows={[['Affected Records','~ 14,200'],['Downstream Jobs','3'],['Estimated Impact','High']]}/><section className="border-b border-slate-100 p-3"><b className="text-[10px] uppercase text-slate-600">Next Steps (After Approval)</b><ul className="mt-3 space-y-2 text-slate-500"><li>Change Request (CR) will be created</li><li>Code will be committed / merged</li><li>Pipeline will be deployed</li><li>Monitoring will resume</li></ul></section><section className="p-3"><b className="text-[10px] uppercase text-slate-600">Access Control</b><div className="mt-3 space-y-2 text-slate-500"><div className="flex justify-between"><span>Owner</span><b>data-eng-team</b></div><div className="flex justify-between"><span>You</span><b className="text-blue-600">View Only</b></div><p className="pt-2 text-[10px]">Only the owner and authorized members can edit code and raise CR.</p></div></section></aside></div></aside>{view === 'compare' && <FullScreenComparison aiCode={aiCode} onBack={() => setView(null)} onEdit={() => setView('edit')} onDownload={download}/>} {view === 'edit' && <FullScreenEditor aiCode={aiCode} onChange={setAiCode} onBack={() => setView('compare')} onClose={() => setView(null)} onDownload={download}/>}</>
}

function FailedJobDetails({ job,onClose,cache,onApprove,originPage='jobs',onNavigate }) {
  const isSparkDemo = job.name === 'spark-driver-failure' || job.id === 'SPARK-LIVE-001'
  const sparkDefaultProdCode = `from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("CustomerDataIngestion") \\
    .config("spark.hadoop.fs.oci.client.custom.client.factory", "com.oracle.bmc.hdfs.BmcFilesystem") \\
    .config("spark.jars.packages", "com.oracle.oci.sdk:oci-java-sdk-addons-apache-hdfs:3.40.2") \\
    .getOrCreate()

df = spark.read.parquet("oci://raw-data@tenancy/customer_events/")
df.show(5)
`
  const sparkDefaultAiCode = `from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("CustomerDataIngestion") \\
    .config("spark.hadoop.fs.oci.client.custom.client.factory", "com.oracle.bmc.hdfs.BmcFilesystem") \\
    .config("spark.driver.extraClassPath", "/opt/spark/jars/oci-java-sdk-full-3.40.2.jar:/opt/spark/jars/jersey-client-2.34.jar") \\
    .config("spark.executor.extraClassPath", "/opt/spark/jars/oci-java-sdk-full-3.40.2.jar:/opt/spark/jars/jersey-client-2.34.jar") \\
    .config("spark.jars.packages", "com.oracle.oci.sdk:oci-java-sdk-addons-apache-hdfs:3.40.2,com.oracle.oci.sdk:oci-java-sdk-common-httpclient-jersey:3.40.2") \\
    .getOrCreate()

df = spark.read.parquet("oci://raw-data@tenancy/customer_events/")
df.show(5)
`
  const sparkDefaultRootCause = "Missing OCI Jersey client library (com.oracle.bmc.http.client.jersey.JerseyClientProperty) during Hadoop FileSystem initialization. This triggered 9 cascading failure signals across Spark driver, Guava execution handlers, and Py4J gateway."
  const sparkDefaultResolution = "Add required 'extraClassPath' JAR dependencies (jersey-client-2.34.jar & oci-java-sdk-full-3.40.2.jar) and 'oci-java-sdk-common-httpclient-jersey' package to the SparkSession builder."

  const [view,setView] = useState(null), [aiCode,setAiCode] = useState(isSparkDemo ? sparkDefaultAiCode : generatedCode), [approvalMethod,setApprovalMethod] = useState('github'), [sent,setSentState] = useState(false), [pullRequestOpened,setPullRequestOpened] = useState(false), [emailModal,setEmailModal] = useState(false), [platformReview,setPlatformReview] = useState(false), [githubModal,setGithubModal] = useState(false), [resolution,setResolution] = useState(null), [resolutionLoading,setResolutionLoading] = useState(true), [fullLogsModal,setFullLogsModal] = useState(false)
  const setSent = (value) => { if (value) onApprove?.(job.name); if (value && approvalMethod === 'github') { setGithubModal(true); return } if (value && approvalMethod === 'email') { setEmailModal(true); return } if (value && approvalMethod === 'platform') { setPlatformReview(true); return } setSentState(value) }
  useEffect(() => {
    if (!emailModal) return undefined
    const mount = document.createElement('div')
    document.body.appendChild(mount)
    const root = createRoot(mount)
    root.render(<EmailApprovalModal job={job} onClose={() => setEmailModal(false)}/>)
    return () => { root.unmount(); mount.remove() }
  }, [emailModal,job])
  useEffect(() => {
    if (!platformReview) return undefined
    const mount = document.createElement('div')
    document.body.appendChild(mount)
    const root = createRoot(mount)
    root.render(<InteractiveInPlatformComparison job={job} initialAiCode={aiCode} productionCode={resolution?.code_snippet || (isSparkDemo ? sparkDefaultProdCode : '')} onClose={() => setPlatformReview(false)}/>)
    return () => { root.unmount(); mount.remove() }
  }, [platformReview,job,aiCode,resolution,isSparkDemo,sparkDefaultProdCode])
  useEffect(() => {
    if (!githubModal) return undefined
    const mount = document.createElement('div')
    document.body.appendChild(mount)
    const root = createRoot(mount)
    root.render(<GitHubPullRequestModal crData={job?.crData} onClose={() => setGithubModal(false)}/>)
    return () => { root.unmount(); mount.remove() }
  }, [githubModal,job])

  const fetchResolution = async (force = false) => {
    if (!job?.id) return
    setResolutionLoading(true)
    try {
      const res = await getResolution(job.id, force)
      if (res.data) {
        setResolution(res.data)
        if (res.data.code_fix) setAiCode(res.data.code_fix)
      }
    } catch {
      // keep fallback static demo values if backend resolution API call fails
    } finally {
      setResolutionLoading(false)
    }
  }

  useEffect(() => {
    fetchResolution(false)
  }, [job?.id])

  const startedAt = useMemo(() => {
    if (job.start) return job.start
    return '08:14:00'
  }, [job.start])

  const originLabel = originPage === 'incidents' ? 'Incidents' : 'Jobs'
  const handleGoBack = () => {
    onClose?.()
    onNavigate?.(originPage === 'incidents' ? 'incidents' : 'jobs')
  }

  const effectiveProdCode = resolution?.code_snippet || (isSparkDemo ? sparkDefaultProdCode : '')

  return <><aside className="fixed inset-0 z-40 overflow-auto bg-[#f6f8fc] text-slate-700"><div className="mx-auto min-h-full max-w-[1440px] px-5 py-5 lg:px-8"><header className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><button onClick={handleGoBack} className="font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">{originLabel}</button><span className="mx-1">›</span><button onClick={handleGoBack} className="hover:text-blue-600 transition-colors cursor-pointer text-slate-500">{originPage === 'incidents' ? 'Active Incidents' : 'Failed Jobs'}</button><span className="mx-1">›</span><span className="font-semibold text-slate-700">{job.name}</span></div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{job.name}</h2><span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">FAILED · P1</span>{job.status === 'failed' && job.sla_breach && (<span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">SLA BREACHED</span>)}<span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">{job.workflow}</span></div>{job.parentName && <p className="mt-1 text-[11px] text-slate-400">Part of pipeline: <span className="font-semibold text-slate-600">{job.parentName}</span></p>}<div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500"><span>Run ID: 784512</span><span>Environment: Production</span><span>Started: {startedAt}</span></div></div><div className="flex items-center gap-4"><span className="text-[10px] text-slate-400 font-mono">Incident ID: {(job.id === 'SPARK-LIVE-001' || job.name === 'spark-driver-failure') ? 'INC-2026-SPARK-01' : (job.incident_id || `INC-${job.id?.slice(0, 8)}`)}</span><button onClick={handleGoBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"><ArrowLeft size={14}/>Back to {originLabel}</button></div></header><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]"><main className="space-y-4"><section className="overflow-hidden rounded-xl border border-slate-800 bg-[#071421] shadow-sm"><header className="flex items-center justify-between px-4 pt-3"><b className="text-[10px] uppercase tracking-wide text-slate-300">Error Logs</b><button onClick={() => setFullLogsModal(true)} className="rounded-md border border-slate-600 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer">View Full Logs</button></header><pre className="overflow-auto px-4 pb-4 pt-2 font-mono text-[10px] leading-5 text-slate-200">{(resolution?.log || []).map((l,i) => <React.Fragment key={i}>{l.ts}  [{l.svc}] <span className={l.level === 'ERROR' || l.level === 'FATAL' ? 'text-red-400' : ''}>{l.level}</span> {l.msg}{'\n'}</React.Fragment>)}</pre></section><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header className="flex items-center justify-between"><b className="text-[11px] font-bold uppercase tracking-wide text-slate-700">AI Resolution Workflow</b><div className="flex items-center gap-2"><span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">{resolution?.rca?.confidence != null ? `${resolution.rca.confidence}% Confidence` : (isSparkDemo ? '96% Confidence' : '—')}</span><button onClick={() => fetchResolution(true)} disabled={resolutionLoading} title="Re-run AI analysis" className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={11} className={resolutionLoading ? 'animate-spin' : ''}/>Reload</button></div></header><div className="mt-3 grid gap-4 border-t border-slate-100 pt-3 sm:grid-cols-2"><Info label="Root cause" text={resolution?.rca?.root_cause || (isSparkDemo ? sparkDefaultRootCause : (resolutionLoading ? 'Analyzing log trace…' : 'No AI analysis available.'))}/><Info label="AI recommendation" text={resolution?.rca?.resolution || (isSparkDemo ? sparkDefaultResolution : '')}/></div></section><CodeComparison aiCode={aiCode} productionCode={effectiveProdCode} onCompare={() => setView('compare')} onEdit={() => setView('edit')}/><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header className="flex items-center gap-2"><Github size={17} className="text-slate-700"/><div><b className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Git Repository Integration</b><p className="mt-0.5 text-[10px] text-slate-400">Pull request ready for review</p></div></header><div className="mt-4 grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-3"><GitDetail label="Repository" value="nexaops-data-pipelines" link/><GitDetail label="Base branch" value="main"/><GitDetail label="Compare branch" value="feature/CR-1023-ai-fix"/><GitDetail label="Pull request" value="#42" link/><GitDetail label="Commit (latest)" value="9de4f21" link/><GitDetail label="Files changed" value="1 file"/></div><GitProgress/><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] text-slate-500">Created 29-Jul-2026 03:45 PM</span><button onClick={() => setPullRequestOpened(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"><GitPullRequest size={14}/>{pullRequestOpened ? 'Pull Request Opened' : 'Open Pull Request'}</button></div></section><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header><b className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Approval Method</b><p className="mt-1 text-[11px] text-slate-500">Select how you want to review and approve the AI-generated fix.</p></header><div className="mt-4 grid gap-3 md:grid-cols-3">{methods.map(([key,Icon,label,description]) => <label key={key} className={`cursor-pointer rounded-lg border p-3 transition ${approvalMethod === key ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}><input className="sr-only" type="radio" name="approval-method" checked={approvalMethod === key} onChange={() => setApprovalMethod(key)}/><span className="flex items-start gap-2"><span className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border ${approvalMethod === key ? 'border-blue-600' : 'border-slate-300'}`}>{approvalMethod === key && <span className="h-2 w-2 rounded-full bg-blue-600"/>}</span><Icon size={16} className={approvalMethod === key ? 'text-blue-600' : 'text-slate-500'}/><span><b className="block text-[11px] text-slate-700">{label}</b><span className="mt-1 block text-[10px] leading-4 text-slate-500">{description}</span></span></span></label>)}</div><div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3"><Action label={sent ? 'Approval Started' : 'Approve & Start CR'} icon={CheckCircle2} onClick={() => setSent(true)}/><button onClick={() => setSent(true)} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">Continue</button></div>{sent && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700">{approvalMethod === 'github' ? 'GitHub pull request workflow selected.' : approvalMethod === 'platform' ? 'In-platform review workflow selected.' : 'Email approval workflow selected.'}</p>}</section></main><aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white text-[11px] shadow-sm"><div className="p-4"><Summary title="Job Summary" rows={[["Start Time",startedAt],["Duration",job.runtime || '38m 24s']]}/><Summary title="Business Impact" rows={[["Impacted", (resolution?.rca?.impacted || ["spark-driver-failure", "Spark Cluster Orchestration", "Oracle Cloud HDFS Storage"]).join(', ')],["Business Impact", resolution?.rca?.business_impact || "Data Engineering pipeline stalled. Downstream ETL jobs blocked until OCI dependency is resolved."]]}/><Summary title="AI Usage" rows={[
  ["Model", resolution?.model || 'openrouter/minimax-m2.7'],
  ["Tokens (in / out)", resolution?.tokens_used ? (typeof resolution.tokens_used === 'object' ? `${resolution.tokens_used.input_tokens || 0} / ${resolution.tokens_used.output_tokens || 0}` : resolution.tokens_used) : '540 / 185'],
  ["Est. cost", resolution?.estimated_cost_usd != null ? `$${Number(resolution.estimated_cost_usd).toFixed(6)}` : '$0.000165'],
]}/><section className="border-b border-slate-100 py-4"><b className="text-[10px] uppercase text-slate-600">Next Steps (After Approval)</b><ul className="mt-3 space-y-2 text-slate-500"><li>Change Request (CR) will be created</li><li>Code will be committed / merged</li><li>Pipeline will be deployed</li><li>Monitoring will resume</li></ul></section><section className="pt-4"><b className="text-[10px] uppercase text-slate-600">Access Control</b><div className="mt-3 space-y-2 text-slate-500"><div className="flex justify-between"><span>Owner</span><b className="text-slate-700">data-eng-team</b></div><div className="flex justify-between"><span>You</span><b className="text-blue-600">View Only</b></div><p className="pt-2 text-[10px] leading-4">Only the owner and authorized members can edit code and raise CR.</p></div></section></div></aside></div></div></aside>{view === 'compare' && <FullScreenComparison aiCode={aiCode} productionCode={effectiveProdCode} onBack={() => setView(null)} onEdit={() => setView('edit')} onDownload={download}/>} {view === 'edit' && <FullScreenEditor aiCode={aiCode} onChange={setAiCode} onBack={() => setView('compare')} onClose={() => setView(null)} onDownload={download}/>}{fullLogsModal && <FullLogsModal job={job} logs={resolution?.log} onClose={() => setFullLogsModal(false)}/>}</>
}

function FullLogsModal({ job, logs, onClose }) {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const defaultLogs = [
    { ts: "09:55:18", level: "INFO", svc: "SPARK", msg: "Submitting Spark application prod-analytics.spark-driver-failure" },
    { ts: "09:55:19", level: "INFO", svc: "SPARK", msg: "Allocating 4 driver cores, 16GB executor memory across 8 cluster nodes" },
    { ts: "09:55:20", level: "INFO", svc: "SPARK", msg: "Starting Spark driver container on node spark-worker-node-04.internal" },
    { ts: "09:55:21", level: "INFO", svc: "SPARK", msg: "Loading PySpark OCI filesystem handler: com.oracle.bmc.hdfs.BmcFilesystem" },
    { ts: "09:55:22", level: "WARN", svc: "SPARK", msg: "Initializing Jersey HTTP Client factory for OCI object storage endpoint oci://raw-data@tenancy..." },
    { ts: "09:55:23", level: "ERROR", svc: "SPARK", msg: "java.lang.NoClassDefFoundError: com/oracle/bmc/http/client/jersey/JerseyClientProperty" },
    { ts: "09:55:24", level: "ERROR", svc: "SPARK", msg: "ClassNotFoundException: com.oracle.bmc.http.client.jersey.JerseyClientProperty" },
    { ts: "09:55:25", level: "ERROR", svc: "SPARK", msg: "   at java.net.URLClassLoader.findClass(URLClassLoader.java:382)" },
    { ts: "09:55:26", level: "ERROR", svc: "SPARK", msg: "   at java.lang.ClassLoader.loadClass(ClassLoader.java:418)" },
    { ts: "09:55:27", level: "FATAL", svc: "SPARK", msg: "Driver initialization failed. SparkContext shut down unexpectedly." },
    { ts: "09:55:28", level: "FATAL", svc: "SPARK", msg: "Driver stopped with exitCode 1 from shutdown hook" },
  ]
  const displayLogs = (logs && logs.length > 0) ? logs : defaultLogs
  const filtered = displayLogs.filter(l => 
    !search || `${l.ts} ${l.level} ${l.svc} ${l.msg}`.toLowerCase().includes(search.toLowerCase())
  )

  const copyAll = async () => {
    const text = displayLogs.map(l => `${l.ts} [${l.svc}] ${l.level} ${l.msg}`).join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const downloadLogs = () => {
    const text = displayLogs.map(l => `${l.ts} [${l.svc}] ${l.level} ${l.msg}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${job.name || 'execution'}_full_logs.txt`; a.click()
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#071421] text-slate-200 shadow-2xl">
        <header className="flex flex-wrap items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-900 text-blue-400 shadow-inner">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Full Execution Log Trace — {job.name}</h2>
              <p className="text-[11px] text-slate-400">Run ID: 784512 · Showing full stdout & stderr log stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
            <button onClick={copyAll} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">
              <FileText size={13} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadLogs} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">
              <Download size={13} /> Download
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 font-mono text-xs leading-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No log entries match "{search}"</div>
          ) : (
            filtered.map((l, i) => (
              <div key={i} className="flex gap-4 py-0.5 hover:bg-slate-900/60 rounded px-2">
                <span className="w-6 select-none text-right text-slate-600">{i + 1}</span>
                <span className="text-slate-500">{l.ts}</span>
                <span className="w-16 text-slate-400">[{l.svc}]</span>
                <span className={`w-14 font-bold ${l.level === 'FATAL' || l.level === 'ERROR' ? 'text-red-400' : l.level === 'WARN' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {l.level}
                </span>
                <span className="flex-1 text-slate-200 whitespace-pre-wrap">{l.msg}</span>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  )
}

function GitDetail({ label,value,link }) { return <div><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className={`mt-1 text-[11px] font-semibold ${link ? 'text-blue-600' : 'text-slate-700'}`}>{value}</div></div> }
function GitProgress() { const steps = ['AI Generated','Pushed to Repo','PR Created','Awaiting Review','Approved','Deployment']; return <div className="grid grid-cols-6 gap-1 pt-4">{steps.map((step,index) => <div key={step} className="relative text-center"><div className={`mx-auto grid h-5 w-5 place-items-center rounded-full border-2 text-[9px] ${index < 2 ? 'border-emerald-500 bg-emerald-500 text-white' : index === 2 ? 'border-blue-600 bg-white text-blue-600 ring-2 ring-blue-100' : 'border-slate-300 bg-white text-slate-300'}`}>{index < 2 ? '✓' : ''}</div>{index < steps.length - 1 && <span className={`absolute left-[58%] right-[-42%] top-2 h-0.5 ${index < 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}/>}<div className={`mt-2 text-[8px] font-medium leading-3 ${index === 2 ? 'text-blue-600' : 'text-slate-400'}`}>{step}</div></div>)}</div> }

function InteractiveInPlatformComparison({ job,initialAiCode,productionCode,onClose }) {
  const [aiCode,setAiCode] = useState(initialAiCode), [savedCode,setSavedCode] = useState(initialAiCode), [editing,setEditing] = useState(false), [history,setHistory] = useState([initialAiCode]), [historyIndex,setHistoryIndex] = useState(0), [find,setFind] = useState(''), [replace,setReplace] = useState(''), [comment,setComment] = useState(''), [comments,setComments] = useState([]), [preview,setPreview] = useState(false), [fullScreen,setFullScreen] = useState(false)
  const changeCode = value => { const next = [...history.slice(0, historyIndex + 1), value]; setHistory(next); setHistoryIndex(next.length - 1); setAiCode(value) }
  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setAiCode(history[historyIndex - 1]) } }
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setAiCode(history[historyIndex + 1]) } }
  const autoFormat = () => changeCode(aiCode.replace(/\s*\n\s*/g, '\n'))
  const replaceAll = () => { if (find) changeCode(aiCode.split(find).join(replace)) }
  const save = () => { setSavedCode(aiCode); setEditing(false) }
  const download = () => { const blob = new Blob([`--- Current Production Code\n${productionCode}\n\n+++ AI Generated Code\n${savedCode}`], { type:'text/plain' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${job.name}.diff`; link.click(); URL.revokeObjectURL(link.href) }
  return <div className="fixed inset-0 z-[80] overflow-auto bg-[#f6f8fc] text-slate-700"><div className="mx-auto max-w-[1440px] p-5 lg:p-7"><header className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="text-[11px] text-slate-400">Jobs › Failed Jobs › {job.name} › <b className="text-slate-600">In-Platform Code Comparison</b></div><h2 className="mt-2 text-xl font-bold text-slate-900">In-Platform Code Comparison <span className="ml-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-600">FAILED · P1</span></h2><p className="mt-1 text-[10px] text-slate-500">Run ID: 784512 · Environment: Production · Failed At: {formatTimestamp(job.startTimestamp)}</p></div><button onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm"><ArrowLeft size={14}/>Back to Job Details</button></header><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><b className="text-[10px] uppercase tracking-wide text-slate-600">AI Change Summary</b><p className="mt-2 text-[11px] text-slate-600">Detected issue: <b>Missing OCI Jersey Client & extraClassPath</b>. The AI fix injects required driver/executor JAR classpaths.</p></section><section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3"><div className="flex items-center gap-2"><button onClick={() => setFullScreen(true)} className="rounded border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-600">Full Screen</button><button onClick={() => setEditing(value => !value)} className="rounded border border-blue-300 px-2 py-1.5 text-[10px] font-semibold text-blue-600">{editing ? 'Close Editor' : 'Edit AI Code'}</button></div>{editing && <div className="flex flex-wrap gap-1"><button onClick={undo} disabled={!historyIndex} className="rounded border px-2 py-1 text-[10px] disabled:opacity-40">Undo</button><button onClick={redo} disabled={historyIndex === history.length - 1} className="rounded border px-2 py-1 text-[10px] disabled:opacity-40">Redo</button><input value={find} onChange={e => setFind(e.target.value)} placeholder="Find" className="w-20 rounded border px-2 text-[10px]"/><input value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replace" className="w-20 rounded border px-2 text-[10px]"/><button onClick={replaceAll} className="rounded border px-2 py-1 text-[10px]">Replace</button><button onClick={autoFormat} className="rounded border px-2 py-1 text-[10px]">Auto-format</button><button onClick={save} className="rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">Save Changes</button></div>}</header><div className="grid gap-px bg-slate-200 lg:grid-cols-2"><CodeReviewPane title="Current Production Code" code={productionCode} readOnly/><CodeReviewPane title="AI Generated Code" code={aiCode} editable={editing} onChange={changeCode}/></div><footer className="flex flex-wrap justify-center gap-2 border-t border-slate-100 p-3"><button onClick={() => comment.trim() && (setComments([...comments,comment.trim()]),setComment(''))} className="rounded border border-slate-200 px-3 py-1.5 text-[10px] font-semibold">Add Comment</button><input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a review comment" className="w-48 rounded border border-slate-200 px-2 text-[10px]"/><button onClick={() => setPreview(value => !value)} className="rounded border border-slate-200 px-3 py-1.5 text-[10px] font-semibold">Preview Execution</button><button onClick={download} className="rounded border border-slate-200 px-3 py-1.5 text-[10px] font-semibold">Download Diff</button></footer>{comments.length > 0 && <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-600">Comments: {comments.map((item,index) => <span key={index} className="mr-2 rounded bg-blue-50 px-2 py-1 text-blue-700">{item}</span>)}</div>}{preview && <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-[10px] text-slate-600">Preview executed against a sandbox — no production changes made.</div>}</section></div>{fullScreen && <FullScreenCodeReview production={productionCode} ai={aiCode} onClose={() => setFullScreen(false)}/>}</div>
}
function CodeReviewPane({ title,code,readOnly,editable,onChange }) {
  const lines = (code || '').split('\n');
  return <section className="min-w-0 bg-white p-4">
    <b className="text-[10px] uppercase text-slate-600">{title}</b>
    {editable ? (
      <textarea value={code} onChange={e => onChange(e.target.value)} spellCheck="false" className="mt-2 h-72 w-full resize-y rounded-lg border border-blue-200 bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100 outline-none"/>
    ) : (
      <pre className="mt-2 h-72 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-[11px] leading-5 text-slate-700">
        {lines.map((line,index) => {
          const isAdded = !readOnly && (line.includes('extraClassPath') || line.includes('CAST(') || line.includes('jersey') || line.includes('httpclient-jersey'));
          const isProd = readOnly && (line.includes('spark.jars.packages') || line.includes('BmcFilesystem'));
          return <div key={index} className={isAdded ? 'bg-emerald-100 text-emerald-900 font-bold border-l-4 border-emerald-500' : isProd ? 'bg-red-50 text-red-700 font-semibold' : ''}>
            <span className="mr-4 inline-block w-5 text-right text-slate-400">{index+1}</span>{line}
          </div>
        })}
      </pre>
    )}
  </section>
}
function FullScreenCodeReview({ production,ai,onClose }) {
  const left = useRef(null), right = useRef(null), syncing = useRef(false);
  const [approved,setApproved] = useState(false);
  const sync = (from,to) => { if (syncing.current) return; syncing.current = true; to.current.scrollTop = from.current.scrollTop; requestAnimationFrame(() => { syncing.current = false }) };
  const download = () => { const blob = new Blob([`--- Current Production Code\n${production}\n\n+++ AI Generated Code\n${ai}`], { type:'text/plain' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'column_determination.diff'; link.click(); URL.revokeObjectURL(link.href) };
  const Pane = ({title,code,tone,refProp,onScroll,added}) => <section ref={refProp} onScroll={onScroll} className="min-h-0 overflow-auto bg-white">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
      <b className="text-xs text-slate-800">{title}</b>
      <span className={`ml-2 text-[10px] font-semibold ${added ? 'text-emerald-600' : 'text-red-500'}`}>{added ? '+ Added fix' : '− Current version'}</span>
    </header>
    <pre className="p-6 font-mono text-sm leading-8 text-slate-700">
      {(code || '').split('\n').map((line,index) => {
        const isAdded = added && (line.includes('extraClassPath') || line.includes('CAST(') || line.includes('jersey') || line.includes('httpclient-jersey'));
        const isProd = !added && (line.includes('spark.jars.packages') || line.includes('BmcFilesystem'));
        return <div key={index} className={`px-2 py-0.5 rounded ${isAdded ? 'bg-emerald-100 text-emerald-900 font-bold border-l-4 border-emerald-500' : isProd ? 'bg-red-50 text-red-700 font-semibold' : ''}`}>
          <span className="mr-6 inline-block w-6 select-none text-right text-slate-400">{index+1}</span>
          <span>{line}</span>
        </div>
      })}
    </pre>
  </section>;
  return <div className="fixed inset-0 z-[90] flex flex-col bg-white">
    <header className="flex items-center justify-between border-b border-slate-200 px-7 py-4">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16}/>Back to job details</button>
        <span className="h-5 border-l border-slate-200"/>
        <b className="text-sm text-slate-900">Code Comparison · column_determination.py</b>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Edit3 className="mr-1 inline" size={13}/>Edit AI Code</button>
        <button onClick={download} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="mr-1 inline" size={13}/>Download</button>
        <button onClick={() => setApproved(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">{approved ? 'Changes Approved' : 'Approve Changes'}</button>
        <button onClick={onClose} aria-label="Close full screen review" className="ml-1 rounded p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>
      </div>
    </header>
    <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-slate-200">
      <Pane title="Production Code" code={production} tone="bg-red-50 text-red-700" refProp={left} onScroll={() => sync(left,right)}/>
      <Pane title="AI-Generated Code" code={ai} added tone="bg-emerald-50 text-emerald-700" refProp={right} onScroll={() => sync(right,left)}/>
    </div>
  </div>
}

function GitHubPullRequestModal({ onClose }) {
  const pullRequestUrl = 'https://github.com/nexaops-data-pipelines/pull/42'
  const [copied,setCopied] = useState(false)
  const copyLink = async () => { try { await navigator.clipboard.writeText(pullRequestUrl); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) } }
  const openGitHub = () => window.open(pullRequestUrl, '_blank', 'noopener,noreferrer')
  return <div className="fixed inset-0 z-[85] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[1px]"><section role="dialog" aria-modal="true" aria-labelledby="github-pr-title" className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><header className="flex items-start justify-between px-6 pb-4 pt-5"><div className="flex gap-3"><Github size={21} className="mt-0.5 text-slate-800"/><div><h2 id="github-pr-title" className="text-base font-bold text-slate-800">Open GitHub Pull Request</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">The AI-generated fix is ready for review.</p></div></div><button onClick={onClose} aria-label="Close GitHub pull request dialog" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18}/></button></header><div className="mx-6 border-t border-slate-200"/><main className="space-y-3 px-6 py-4"><b className="text-[11px] text-slate-700">Review in GitHub</b><div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3"><a href={pullRequestUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"><Github size={16}/>View Pull Request #42</a><button onClick={openGitHub} aria-label="Open pull request in GitHub" className="text-slate-400 hover:text-blue-600">↗</button></div><div className="flex justify-end"><button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"><FileText size={13}/>{copied ? 'Copied!' : 'Copy Link'}</button></div><p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-[11px] leading-4 text-blue-800">You'll be redirected to GitHub to review, comment, approve, or request changes.</p></main><footer className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4"><button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button onClick={openGitHub} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">Open in GitHub <span>↗</span></button></footer></section></div>
}

const relevantSqlValidations = (issue) => issue?.includes('INT64') && issue?.includes('STRING') ? [
  ['Data Type Compatibility','Passed','The JOIN now uses compatible data types.'],
  ['SQL Syntax Validation','Passed','No syntax errors detected.'],
  ['Query Compilation','Passed','Query compiled successfully.'],
  ['AI Fix Verification','Passed','The original data type mismatch has been resolved.'],
  ['Deployment Risk','Low','Safe to deploy.'],
] : [['SQL Syntax Validation','Passed','No syntax errors detected.'],['Query Compilation','Passed','Query compiled successfully.']]

function InPlatformComparison({ job,aiCode,onClose }) {
  const issue = 'INT64 ↔ STRING Data Type Mismatch'
  const validations = relevantSqlValidations(issue)
  const [approved,setApproved] = useState(false)
  return <div className="fixed inset-0 z-[80] overflow-auto bg-[#f6f8fc] text-slate-700"><div className="mx-auto max-w-[1440px] p-5 lg:p-7"><header className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="text-[11px] text-slate-400">Jobs <span className="mx-1">›</span> Failed Jobs <span className="mx-1">›</span> {job.name} <span className="mx-1">›</span> <b className="text-slate-600">In-Platform Code Comparison</b></div><div className="mt-2 flex items-center gap-2"><h2 className="text-xl font-bold tracking-tight text-slate-900">In-Platform Code Comparison</h2><span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">FAILED · P1</span></div><p className="mt-1 text-[10px] text-slate-500">Run ID: 784512 <span className="mx-2">•</span> Environment: Production <span className="mx-2">•</span> Failed At: {formatTimestamp(job.startTimestamp)}</p></div><div className="flex items-center gap-3"><span className="rounded bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600">96% Confidence</span><button onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><ArrowLeft size={14}/>Back to Job Details</button></div></header><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]"><main className="space-y-4"><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><b className="text-[10px] uppercase tracking-wide text-slate-600">AI Change Summary</b><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><ReviewFact label="Detected Issue" value="Data type mismatch in JOIN condition."/><ReviewFact label="Root Cause" value="INT64 was compared to STRING."/><ReviewFact label="AI Recommendation" value="Cast INT64 to STRING before JOIN."/><ReviewFact label="Files Modified" value="1 · customer_sync.sql"/><ReviewFact label="Estimated Impact" value="Low · Safe to apply in production."/></div></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div className="flex rounded-md bg-slate-100 p-0.5 text-[10px] font-semibold"><span className="rounded bg-slate-800 px-3 py-1.5 text-white">Side-by-Side</span><span className="px-3 py-1.5 text-slate-500">Unified Diff</span></div><div className="flex items-center gap-2"><input placeholder="Search in code (Ctrl + F)" className="h-8 w-48 rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-400"/><button className="rounded border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-600">Full Screen</button></div></header><div className="grid gap-px bg-slate-200 lg:grid-cols-2"><SqlPane title="Current Production Code" code={productionCode} changed="removed"/><SqlPane title="AI Generated Code" code={aiCode} changed="added"/></div><footer className="flex flex-wrap justify-center gap-2 border-t border-slate-100 px-4 py-3"><Action label="Add Comment" icon={FileText}/><Action label="Edit AI Code" icon={Edit3}/><Action label="Preview Execution" icon={CirclePlay}/><Action label="Download Diff" icon={Download}/></footer></section><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header className="flex flex-wrap items-center gap-2"><b className="text-[10px] uppercase tracking-wide text-slate-700">SQL Validation & Quality Checks</b><span className="rounded bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600">Detected Issue: {issue}</span></header><div className="mt-3 grid gap-3 md:grid-cols-5">{validations.map(([name,status,description]) => <div key={name} className="rounded-lg border border-slate-200 p-3"><div className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500"/><div><b className="block text-[10px] text-slate-700">{name}</b><span className="mt-1 block text-[10px] font-semibold text-emerald-600">{status}</span></div></div><p className="mt-2 text-[9px] leading-4 text-slate-500">{description}</p></div>)}</div><p className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] text-blue-700">All relevant validations passed. The AI-generated code is ready for review.</p></section><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><b className="text-[10px] uppercase tracking-wide text-slate-700">Review Decision</b><div className="mt-3 grid gap-3 md:grid-cols-3"><button className="rounded-lg border border-red-200 px-4 py-3 text-left text-xs font-semibold text-red-600 hover:bg-red-50">Reject Changes<span className="mt-1 block text-[9px] font-normal text-slate-500">Discard and keep current code.</span></button><button className="rounded-lg border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">Save Draft<span className="mt-1 block text-[9px] font-normal text-slate-500">Save review as draft and resume later.</span></button><button onClick={() => setApproved(true)} className="rounded-lg bg-emerald-600 px-4 py-3 text-left text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">{approved ? 'Changes Approved' : 'Approve Changes'}<span className="mt-1 block text-[9px] font-normal text-emerald-100">Approve and create Change Request (CR).</span></button></div></section></main><aside className="h-fit space-y-3"><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><b className="text-[10px] uppercase text-slate-600">AI Explanation</b><div className="mt-3 space-y-3 text-[10px]"><div className="rounded bg-blue-50 p-2 text-blue-700">Line 10 Modified</div><div><b className="text-slate-500">Previous (Current Code)</b><pre className="mt-1 whitespace-pre-wrap rounded bg-red-50 p-2 text-[9px] text-red-700">ON o.customer_id = c.customer_id</pre></div><div><b className="text-slate-500">Updated (AI Code)</b><pre className="mt-1 whitespace-pre-wrap rounded bg-emerald-50 p-2 text-[9px] text-emerald-700">ON CAST(o.customer_id AS STRING) = c.customer_id</pre></div><div><b className="text-slate-500">Reason</b><p className="mt-1 leading-4 text-slate-600">The JOIN failed because o.customer_id is INT64 while c.customer_id is STRING. Casting ensures compatible data types.</p></div></div></section><section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><b className="text-[10px] uppercase text-slate-600">Related Error</b><p className="mt-2 text-[10px] text-slate-500">Error Code: INT64_STRING_MISMATCH</p><button className="mt-2 text-[10px] font-semibold text-blue-600">View Error Context →</button></section></aside></div></div></div>
}
function ReviewFact({ label,value }) { return <div className="border-l border-slate-100 pl-3 first:border-l-0 first:pl-0"><b className="block text-[9px] uppercase text-slate-400">{label}</b><p className="mt-1 text-[10px] leading-4 text-slate-600">{value}</p></div> }
function SqlPane({ title,code,changed }) { return <section className="bg-white p-4"><div className="mb-2 flex justify-between text-[9px] font-bold uppercase text-slate-600"><span>{title}</span><span className={changed === 'added' ? 'text-emerald-600' : 'text-red-500'}>{changed === 'added' ? 'AI Fix Applied' : 'Removed'}</span></div><pre className={`overflow-auto rounded-lg border p-3 text-[10px] leading-5 ${changed === 'added' ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>{code}</pre></section> }

function EmailApprovalModal({ job,onClose }) {
  const [reviewer,setReviewer] = useState(job.jira_ticket?.assignee_email || ''), [cc,setCc] = useState(''), [subject,setSubject] = useState(`Approval Required: ${job.name} (CR-1023)`), [message,setMessage] = useState(`Hello Team,\n\nThe AI engine has generated a fix for the failed pipeline '${job.name}'.\n\nPlease review the attached files and approve the proposed changes.\n\nRegards,\nNexaOps AI`), [sent,setSent] = useState(false)
  const [sending,setSending] = useState(false), [sendError,setSendError] = useState(null)
  const attachments = [['Error Logs','error_logs.txt','24 KB'],['Current Production Code','customer_sync.sql','12 KB'],['AI Generated Code','customer_sync_fixed.sql','12 KB'],['Code Diff Report','diff_report.html','18 KB'],['AI Recommendation Summary','recommendation.pdf','45 KB']]
  const doSend = () => {
    setSending(true)
    setSendError(null)
    sendApprovalEmail(job.id, {
      to: reviewer ? reviewer.split(',').map(s => s.trim()).filter(Boolean) : [],
      cc: cc ? cc.split(',').map(s => s.trim()).filter(Boolean) : [],
      subject,
      message,
    }).then(() => setSent(true))
      .catch(err => setSendError(err?.response?.data?.detail || 'Failed to send email'))
      .finally(() => setSending(false))
  }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[1px]"><section role="dialog" aria-modal="true" aria-labelledby="email-approval-title" className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div className="flex items-center gap-2"><Mail size={18} className="text-blue-600"/><h2 id="email-approval-title" className="text-base font-bold text-slate-800">Send for Approval via Email</h2></div><button onClick={onClose} aria-label="Close email approval dialog" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18}/></button></header><div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[minmax(0,1.5fr)_300px]"><main className="space-y-4 p-5"><div className="grid gap-3 sm:grid-cols-2"><Field label="To (Reviewers)" required value={reviewer} onChange={setReviewer}/><Field label="CC (Optional)" value={cc} onChange={setCc}/></div><Field label="Subject" required value={subject} onChange={setSubject}/><label className="block text-[11px] font-semibold text-slate-600">Message (Optional)<textarea value={message} onChange={e => setMessage(e.target.value)} className="mt-1.5 h-32 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs leading-5 text-slate-700 outline-none focus:border-blue-400"/></label><section><b className="text-[11px] text-slate-600">Attachments <span className="font-normal text-slate-400">(Automatically Included)</span></b><div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200">{attachments.map(([name,file,size]) => <label key={file} className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-0"><input type="checkbox" defaultChecked className="accent-blue-600"/><FileText size={14} className="text-slate-400"/><span className="flex-1 text-[11px] font-medium text-slate-700">{name} <span className="font-normal text-slate-400">({file})</span></span><span className="text-[10px] text-slate-400">{size}</span></label>)}</div></section><fieldset><legend className="text-[11px] font-semibold text-slate-600">Send As</legend><label className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3"><input type="radio" name="send-as" defaultChecked className="mt-0.5 accent-blue-600"/><span><b className="block text-[11px] text-slate-700">Approval Request</b><span className="text-[10px] text-slate-500">Recipient needs to review and approve.</span></span></label><label className="mt-2 flex items-start gap-2 rounded-lg border border-slate-200 p-3"><input type="radio" name="send-as" className="mt-0.5 accent-blue-600"/><span><b className="block text-[11px] text-slate-700">FYI Only</b><span className="text-[10px] text-slate-500">For information only. No approval required.</span></span></label></fieldset></main><aside className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${sent ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><CheckCircle2 size={26}/></div><h3 className="mt-3 text-center text-sm font-bold text-slate-800">{sent ? 'Approval Request Sent!' : 'Approval Request Summary'}</h3><p className="mt-1 text-center text-[11px] leading-4 text-slate-500">{sent ? 'The approval request has been sent successfully.' : 'The selected reviewers will receive this approval request.'}</p><div className="mt-4 space-y-4 border-t border-slate-100 pt-4"><div><b className="text-[10px] uppercase text-slate-500">Recipients</b><p className="mt-2 text-[11px] text-slate-700">✓ {reviewer || 'No reviewer selected'}</p>{cc && <p className="mt-1 text-[11px] text-slate-700">✓ {cc}</p>}</div><div className="flex items-center justify-between border-t border-slate-100 pt-4"><b className="text-[10px] uppercase text-slate-500">Attachments</b><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">5 Files</span></div><div className="border-t border-slate-100 pt-4"><b className="text-[10px] uppercase text-slate-500">Status</b><span className="mt-2 inline-block rounded bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600">Waiting for Review</span><p className="mt-2 text-[10px] leading-4 text-slate-500">The Change Request can be started once approval is received.</p></div></div></div></aside></div><footer className="flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4"><button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button onClick={doSend} disabled={sending || !reviewer} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"><Mail size={14}/>{sending ? 'Sending…' : 'Send Email'}</button></footer>{sendError && <p className="border-t border-slate-100 bg-red-50 px-6 py-3 text-[11px] font-medium text-red-600">{sendError}</p>}</section></div>
}
function Field({ label,required,value,onChange }) { return <label className="block text-[11px] font-semibold text-slate-600">{label}{required && <span className="ml-0.5 text-red-500">*</span>}<input value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-normal text-slate-700 outline-none focus:border-blue-400"/></label> }

const FILTERS = [['all','All','bg-slate-400'],['running','Running','bg-blue-500'],['failed','Failed','bg-red-500'],['success','Succeeded','bg-emerald-500'],['warning','SLA Risk','bg-amber-500']]
const STYLES = { running:['Running','bg-blue-50 text-blue-700 border-blue-200','bg-blue-500'], success:['Succeeded','bg-emerald-50 text-emerald-700 border-emerald-200','bg-emerald-500'], failed:['Failed','bg-red-50 text-red-700 border-red-200','bg-red-500'], warning:['SLA Risk','bg-amber-50 text-amber-700 border-amber-200','bg-amber-500'], queued:['Queued','bg-slate-100 text-slate-500 border-slate-200','bg-slate-400'] }
const TEAMS = ['All Teams','Data Engineering','Marketing','Finance','Human Resources (HR)','Sales','Customer Support','Product','Operations','Supply Chain','IT Infrastructure','Security','Analytics','Machine Learning','Platform Engineering']
const ENVIRONMENTS = ['All Environments','Production','Staging','Development','Testing','QA','UAT']

const datePart = (value) => {
  const match = value && String(value).match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
}
const timestampFor = (date, time) => !time ? null : datePart(time) ? String(time) : date ? `${date}T${time}` : String(time)
const formatTimestamp = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const parts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).formatToParts(date)
  const part = (type) => parts.find(item => item.type === type)?.value
  return `${part('day')}-${part('month')}-${part('year')} ${part('hour')}:${part('minute')} ${part('dayPeriod')}`
}
const normalizeJob = (item) => {
  const start = item.start ?? item.startTime ?? item.startedAt ?? item.startTimestamp
  const end = item.end ?? item.endTime ?? item.endedAt ?? item.endTimestamp
  const startDate = datePart(start) || datePart(item.startTimestamp) || datePart(item.jobDate || item.date || item.startDate || item.createdAt)
  return {
    ...item,
    start,
    end,
    startTimestamp: timestampFor(startDate, start),
    endTimestamp: timestampFor(startDate, end),
    team: item.team || item.ownerTeam || item.workflow || 'Data Engineering',
    environment: item.environment || item.env || 'Production',
    jobDate: startDate
  }
}

function JobRowsSkeleton({ rows = 6 }) {
  return <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-100">
        <td className="px-2 py-4 w-8"><div className="h-3 w-3 rounded bg-slate-200"/></td>
        <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-slate-200"/></td>
        <td className="px-4 py-4"><div className="h-3 w-40 rounded bg-slate-200"/></td>
        <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-slate-200"/></td>
        <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-slate-200"/></td>
        <td className="px-4 py-4"><div className="h-5 w-20 rounded-full bg-slate-200"/></td>
      </tr>
    ))}
  </>
}

export default function JobStatus({ originPage = 'jobs', onNavigate, onApprove, resolutionCache }) {
  const { jobId: routeJobId } = useParams()
  const navigate = useNavigate()
  const [jobs,setJobs] = useState(() => []), [filter,setFilter] = useState('all'), [team,setTeam] = useState('All Teams'), [environment,setEnvironment] = useState('All Environments'), [period,setPeriod] = useState(''), [dateOpen,setDateOpen] = useState(false), [startDate,setStartDate] = useState(''), [endDate,setEndDate] = useState(''), [appliedRange,setAppliedRange] = useState(null), [query,setQuery] = useState(''), [job,setJob] = useState(null), [jobsLoaded,setJobsLoaded] = useState(false), [chatOpen,setChatOpen] = useState(false), [expandedIds, setExpandedIds] = useState({}), [childrenById, setChildrenById] = useState({})
  const [slaDetailRow, setSlaDetailRow] = useState(null)

  useEffect(() => {
    if (!routeJobId) {
      setJob(null)
      return
    }
    const decoded = decodeURIComponent(routeJobId)
    const match = jobs.find(j => j.name === decoded || j.id === decoded)
    if (match) {
      setJob(match)
      return
    }
    getJobs({ flat: true }).then(({ data }) => {
      const flatMatch = (data?.jobs || []).find(j => j.name === decoded || j.id === decoded)
      if (flatMatch) setJob(normalizeJob(flatMatch))
    }).catch(() => {})
  }, [routeJobId, jobs])

  const [summary, setSummary] = useState(null)
  useEffect(() => {
    getJobSummary().then(({ data }) => setSummary(data)).catch(() => {})
  }, [])
  useEffect(() => {
    getJobs().then(({data}) => {
      if (data?.jobs?.length) setJobs(data.jobs.map(normalizeJob))
    }).catch(() => {}).finally(() => setJobsLoaded(true))
  }, [])
  const rows = useMemo(() => {
    const filtered = jobs.filter(item => {
      const matchesFilter =
        filter === 'all' ? true :
        filter === 'warning' ? ((item.status !== 'failed' && item.sla_breach === true) || item.child_sla_breach === true) :
        item.status === filter || (item.child_statuses || []).includes(filter)
      return matchesFilter && (team === 'All Teams' || item.team === team) && (!appliedRange || (datePart(item.startTimestamp) >= appliedRange.start && datePart(item.startTimestamp) <= appliedRange.end)) && `${item.workflow} ${item.name} ${item.type}`.toLowerCase().includes(query.toLowerCase())
    })
    filtered.sort((a, b) => {
      const isA = a.name === 'spark-driver-failure' || a.id === 'SPARK-LIVE-001'
      const isB = b.name === 'spark-driver-failure' || b.id === 'SPARK-LIVE-001'
      return (isB ? 1 : 0) - (isA ? 1 : 0)
    })
    return filtered
  }, [jobs,filter,team,appliedRange,query])
  const counts = useMemo(() => ({ running: summary?.running ?? 0, failed: summary?.failed ?? 0, success: summary?.success ?? 0, warning: summary?.sla_breaches ?? 0 }), [summary])
  const rangeLabel = appliedRange ? `${new Date(`${appliedRange.start}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(`${appliedRange.end}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Custom Range'
  const toggleExpand = (jobId) => {
    setExpandedIds(prev => ({ ...prev, [jobId]: !prev[jobId] }))
    if (!childrenById[jobId]) {
      getJobChildren(jobId).then(({ data }) => {
        setChildrenById(prev => ({ ...prev, [jobId]: data?.children || [] }))
      }).catch(() => {})
    }
  }
  return <div className="jobs-page flex min-h-full shrink-0 flex-col bg-[#fbfcff] px-7 py-6 md:px-9">
    <header className="mb-7"><h1 className="text-[28px] font-bold tracking-[-.03em] text-slate-900">Jobs</h1><p className="mt-1 text-[14px] text-slate-500">Monitor and manage all your jobs in real-time.</p></header>
    <JobsFilterBar team={team} setTeam={setTeam} dateOpen={dateOpen} setDateOpen={setDateOpen} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} rangeLabel={rangeLabel} onApply={() => { if (startDate && endDate && startDate <= endDate) { setAppliedRange({ start: startDate, end: endDate }); setDateOpen(false) } }} onClear={() => { setFilter('all'); setTeam('All Teams'); setAppliedRange(null); setPeriod(''); setQuery('') }} query={query} setQuery={setQuery}/>
    {false && <>
    <div className="mb-5 flex flex-wrap items-center gap-2.5"><div className="relative min-w-[250px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs..." className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none shadow-sm placeholder:text-slate-400 focus:border-blue-400"/></div><div className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600">All Environments⌄</div><select value={workflow} onChange={e => setWorkflow(e.target.value)} aria-label="Filter by workflow" className="h-10 min-w-[145px] rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-600 outline-none"><option value="all">All Teams</option>{workflows.map(name => <option key={name} value={name}>{name}</option>)}</select><select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Filter by time range" className="h-10 min-w-[190px] rounded-md border border-blue-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none"><option value="today">Today</option><option value="7-days">Last 7 days</option><option value="10-days">Last 10 days</option><option value="30-days">Last 30 days</option></select><button onClick={() => { setFilter('all'); setWorkflow('all'); setPeriod('today'); setQuery('') }} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm">Clear Filters</button></div>
    </>}
    <div className="mb-5 flex flex-wrap gap-5 border-b border-slate-200">{FILTERS.map(([key,label]) => { const count = key === 'all' ? jobs.length : counts[key] || 0; const refLabel = key === 'all' ? 'All Jobs' : key === 'success' ? 'Completed' : key === 'warning' ? 'SLA Risk' : label; return <button key={key} onClick={() => setFilter(key)} className={`-mb-px flex items-center gap-2 border-b-2 px-2.5 pb-3 text-[13px] font-semibold transition-colors ${filter === key ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>{refLabel}<span className={`rounded-md px-2 py-0.5 text-[10px] ${filter === key ? 'bg-[#eaf2ff] text-[#2563eb]' : 'bg-slate-100 text-slate-500'}`}>{!jobsLoaded ? <span className="inline-block h-3 w-4 animate-pulse rounded bg-slate-200"/> : count}</span></button> })}</div>
    <section className="min-w-[900px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><table className="w-full border-collapse text-xs"><thead className="bg-slate-50"><tr>{['','Job ID','Job Name','Start Time ↕','End Time','Status'].map(head => <th key={head} className="border-b border-slate-200 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">{head}</th>)}</tr></thead><tbody>{!jobsLoaded ? <JobRowsSkeleton/> : rows.map(item => { const isSparkReal = item.name === 'spark-driver-failure' || item.id === 'SPARK-LIVE-001'; const [text,badge,dot] = STYLES[item.status] || STYLES.queued; const failed = item.status === 'failed'; const visual = isSparkReal ? 'border-l-4 border-l-blue-600 bg-blue-50/60 ring-1 ring-blue-200/80 font-bold' : (failed ? 'border-l-red-400 bg-red-50/20' : item.status === 'warning' ? 'border-l-amber-400' : item.status === 'running' ? 'border-l-blue-400' : 'border-l-transparent'); return <React.Fragment key={item.id}><tr onClick={() => { if (item.has_children) { toggleExpand(item.id); return } if (failed) { navigate(`/${originPage === 'incidents' ? 'incidents' : 'jobs'}/${encodeURIComponent(item.name || item.id)}`); return } if (item.sla_breach) { setSlaDetailRow(item); return } }} className={`border-b border-slate-100 border-l-2 transition-colors ${visual} ${failed ? 'cursor-pointer hover:bg-red-50/50' : (!item.has_children && item.sla_breach) ? 'cursor-pointer hover:bg-amber-50/50' : 'hover:bg-slate-50/70'}`}><td className="px-2 py-3 w-8">{item.has_children && <button onClick={event => { event.stopPropagation(); toggleExpand(item.id) }} className="text-slate-400 hover:text-slate-600">{expandedIds[item.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>}</td><td className={`px-4 py-3.5 font-mono ${isSparkReal ? 'font-bold text-blue-700' : 'text-slate-400'}`}>{item.id?.slice(0,14)}</td><td className="px-4 py-3.5"><div className={`flex items-center gap-2 ${isSparkReal ? 'font-bold text-slate-900 text-[13px]' : 'font-semibold text-slate-800'}`}>{item.name}{isSparkReal ? <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse"><Zap size={12}/>🔥 REAL SPARK TRACE & AI RCA</span> : (failed && <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600"><Zap size={12}/>AI Fix Ready</span>)}</div></td><td className="px-4 py-3.5 font-mono text-slate-500">{formatTimestamp(item.startTimestamp)}</td><td className="px-4 py-3.5 font-mono text-slate-500">{item.status === 'running' ? '—' : formatTimestamp(item.endTimestamp)}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${badge}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`}/>{text}</span>{item.status === 'failed' && (item.sla_breach || item.child_failed_and_breached) && (<span className="ml-1.5 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">SLA Breached</span>)}</td></tr>{item.has_children && expandedIds[item.id] && (childrenById[item.id] || []).filter(child => { if (filter === 'all') return true; if (filter === 'warning') return child.status !== 'failed' && child.sla_breach === true; return child.status === filter }).map(child => { const [childText,childBadge,childDot] = STYLES[child.status] || STYLES.queued; return <tr key={child.id} className={`bg-slate-50/60 text-[11px] ${(child.status === 'failed' || child.sla_breach) ? 'cursor-pointer hover:bg-slate-100' : ''}`} onClick={() => { if (child.status === 'failed') { navigate(`/${originPage === 'incidents' ? 'incidents' : 'jobs'}/${encodeURIComponent(child.name || child.id)}`); return } if (child.sla_breach) { setSlaDetailRow(child); return } }}><td className="px-2 py-2"></td><td className="px-4 py-2 font-mono text-slate-400">{child.id?.slice(0,8)}</td><td className="px-4 py-2">{child.name}</td><td className="px-4 py-2">{child.start || '—'}</td><td className="px-4 py-2">{child.end || '—'}</td><td className="px-4 py-2"><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${childBadge}`}><span className={`h-1.5 w-1.5 rounded-full ${childDot}`}/>{childText}</span>{child.status === 'failed' && child.sla_breach && (<span className="ml-1.5 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">SLA Breached</span>)}</td></tr> })}</React.Fragment> })}</tbody></table>{jobsLoaded && !rows.length && <div className="py-12 text-center text-xs text-slate-400">No jobs found</div>}</section>

    {routeJobId && !job && <div className="fixed inset-0 z-40 flex items-center justify-center bg-white"><div className="text-sm text-slate-500">Opening incident resolution…</div></div>}
    {job && <><div className="fixed inset-0 z-30 bg-slate-950/25" onClick={() => { setJob(null); navigate(originPage === 'incidents' ? '/incidents' : '/jobs'); }}/><FailedJobDetails job={job} onClose={() => { setJob(null); navigate(originPage === 'incidents' ? '/incidents' : '/jobs'); }} originPage={originPage} onNavigate={onNavigate} cache={resolutionCache} onApprove={onApprove}/></>}
    {slaDetailRow && (
      <SlaBreachDetail
        jobName={slaDetailRow.name}
        workflow={slaDetailRow.workflow}
        slaTargetMins={slaDetailRow.sla_target_mins}
        runtime={slaDetailRow.runtime}
        overdueMins={slaDetailRow.sla_overdue_mins}
        onClose={() => setSlaDetailRow(null)}
      />
    )}
    <Chatbot open={chatOpen} setOpen={setChatOpen}/>
  </div>
}

function JobsFilterBar({ team,setTeam,dateOpen,setDateOpen,startDate,setStartDate,endDate,setEndDate,rangeLabel,onApply,onClear,query,setQuery }) {
  return <div className="mb-5 flex flex-wrap items-center gap-2.5"><div className="relative min-w-[250px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs..." className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none shadow-sm placeholder:text-slate-400 focus:border-blue-400"/></div><select value={team} onChange={e => setTeam(e.target.value)} aria-label="Filter by team" className="h-10 min-w-[175px] rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-600 outline-none">{TEAMS.map(value => <option key={value}>{value}</option>)}</select><div className="relative"><button type="button" onClick={() => setDateOpen(open => !open)} aria-expanded={dateOpen} className="h-10 min-w-[205px] rounded-md border border-blue-300 bg-white px-3 text-left text-xs font-semibold text-slate-600 outline-none">{rangeLabel}</button>{dateOpen && <div className="absolute right-0 z-20 mt-2 w-[360px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl"><div className="grid grid-cols-2 gap-3"><label className="text-[11px] font-semibold text-slate-500">Start Date<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-400"/></label><label className="text-[11px] font-semibold text-slate-500">End Date<input type="date" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-400"/></label></div><div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setDateOpen(false)} className="rounded-md px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button type="button" onClick={onApply} disabled={!startDate || !endDate || startDate > endDate} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Apply</button></div></div>}</div><button onClick={onClear} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm">Clear Filters</button></div>
}

function FilterBar({ environment,setEnvironment,team,setTeam,dateOpen,setDateOpen,startDate,setStartDate,endDate,setEndDate,rangeLabel,onApply,onClear,query,setQuery }) {
  return <div className="mb-5 flex flex-wrap items-center gap-2.5"><div className="relative min-w-[250px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs..." className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none shadow-sm placeholder:text-slate-400 focus:border-blue-400"/></div><select value={environment} onChange={e => setEnvironment(e.target.value)} aria-label="Filter by environment" className="h-10 min-w-[180px] rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none">{ENVIRONMENTS.map(value => <option key={value}>{value}</option>)}</select><select value={team} onChange={e => setTeam(e.target.value)} aria-label="Filter by team" className="h-10 min-w-[175px] rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-600 outline-none">{TEAMS.map(value => <option key={value}>{value}</option>)}</select><div className="relative"><button type="button" onClick={() => setDateOpen(open => !open)} aria-expanded={dateOpen} className="h-10 min-w-[205px] rounded-md border border-blue-300 bg-white px-3 text-left text-xs font-semibold text-slate-600 outline-none">{rangeLabel}</button>{dateOpen && <div className="absolute right-0 z-20 mt-2 w-[360px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl"><div className="grid grid-cols-2 gap-3"><label className="text-[11px] font-semibold text-slate-500">Start Date<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-400"/></label><label className="text-[11px] font-semibold text-slate-500">End Date<input type="date" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-400"/></label></div><div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setDateOpen(false)} className="rounded-md px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button type="button" onClick={onApply} disabled={!startDate || !endDate || startDate > endDate} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Apply</button></div></div>}</div><button onClick={onClear} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm">Clear Filters</button></div>
}

function LegacyJobRow({ job,onOpen }) { const [text,badge,dot] = STYLES[job.status] || STYLES.queued; const failed = job.status === 'failed'; return <tr onClick={() => failed && onOpen(job)} className={`border-b border-slate-100 transition-colors ${failed ? 'cursor-pointer border-l-2 border-l-red-400 hover:bg-red-50/40' : 'hover:bg-slate-50'}`}><td className="px-5 py-3.5"><div className="font-medium text-slate-700">{job.workflow}</div><div className="mt-1 text-slate-400">{job.type}</div></td><td className="px-5 py-3.5"><div className="flex items-center gap-2 font-semibold text-slate-800">{job.name}{failed && <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600"><Zap size={12}/>AI Fix Ready</span>}</div></td><td className="px-5 py-3.5 font-mono text-slate-500">{job.start || '—'}</td><td className="px-5 py-3.5 font-mono text-slate-500">{job.end || '—'}</td><td className={`px-5 py-3.5 font-mono ${job.runtime?.includes('h') ? 'text-amber-600' : 'text-slate-600'}`}>{job.runtime || '—'}</td><td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${badge}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`}/>{text}</span></td></tr> }

function JobRow({ job,onOpen }) {
  const [text,badge,dot] = STYLES[job.status] || STYLES.queued
  const failed = job.status === 'failed'
  const Icon = job.workflow.includes('Kafka') ? Radio : job.workflow.includes('BigQuery') || job.workflow.includes('Batch') ? Database : CirclePlay
  const visual = failed ? 'border-l-red-400 bg-red-50/20' : job.status === 'warning' ? 'border-l-amber-400' : job.status === 'running' ? 'border-l-blue-400' : 'border-l-transparent'
  const iconTone = failed ? 'bg-red-50 text-red-400' : job.status === 'warning' ? 'bg-amber-50 text-amber-500' : job.status === 'running' ? 'bg-blue-50 text-blue-500' : 'bg-violet-50 text-violet-500'
  return <tr onClick={() => failed && onOpen(job)} className={`border-b border-slate-100 border-l-2 transition-colors ${visual} ${failed ? 'cursor-pointer hover:bg-red-50/50' : 'hover:bg-slate-50/70'}`}>
    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${iconTone}`}><Icon size={18}/></span><div><div className="font-semibold text-slate-700">{job.workflow}</div><div className="mt-0.5 text-slate-400">{job.type}</div></div></div></td>
    <td className="px-5 py-3.5"><div className="flex items-center gap-2 font-semibold text-slate-800">{job.name}{failed && <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600"><Zap size={12}/>AI Fix Ready</span>}</div></td>
    <td className="px-5 py-3.5 font-mono text-slate-500">{formatTimestamp(job.startTimestamp)}</td><td className="px-5 py-3.5 font-mono text-slate-500">{job.status === 'running' ? '—' : formatTimestamp(job.endTimestamp)}</td><td className={`px-5 py-3.5 font-mono ${job.runtime?.includes('h') ? 'text-amber-600' : 'text-slate-600'}`}>{job.runtime || '—'}</td>
    <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${badge}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`}/>{text}</span></td>
  </tr>
}

function Metric({ label, value, detail, tone, icon: Icon }) { const colors = { blue:['text-blue-600','bg-blue-50'], red:['text-red-600','bg-red-50'], green:['text-emerald-600','bg-emerald-50'], violet:['text-violet-600','bg-violet-50'] }[tone]; return <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-sm shadow-slate-200/30"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${colors[1]} ${colors[0]}`}><Icon size={19} strokeWidth={2}/></span><div><div className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</div><div className={`mt-1 font-mono text-xl font-semibold ${colors[0]}`}>{value}</div></div></div><div className={`mt-3 pl-12 text-[10px] font-medium ${tone === 'red' ? 'text-red-500' : tone === 'green' ? 'text-slate-500' : tone === 'violet' ? 'text-slate-500' : 'text-emerald-600'}`}>{detail}</div></div> }

const productionCode = `SELECT *
FROM orders o
JOIN customers c
  ON o.customer_id =
     c.customer_id
  AND c.is_active = true
WHERE o.order_date >= '2024-05-01';`
const generatedCode = `SELECT *
FROM orders o
JOIN customers c
  ON CAST(o.customer_id AS STRING) =
     c.customer_id
  AND c.is_active = true
WHERE o.order_date >= '2024-05-01';`

function LegacyResolutionDrawer({ job,onClose }) {
  const [source,setSource] = useState(false), [applied,setApplied] = useState(false), [sent,setSent] = useState(false), [resolved,setResolved] = useState(false), [view,setView] = useState(null), [aiCode,setAiCode] = useState(generatedCode)
  const download = () => { const blob = new Blob([aiCode], { type: 'text/sql' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'product_join.ai.sql'; link.click(); URL.revokeObjectURL(link.href) }
  return <><aside className="fixed inset-3 z-40 mx-auto flex max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#f8faff] shadow-2xl"><header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-slate-900">{job.name}</h2><span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">FAILED · P1</span><span className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{job.workflow}</span><span className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{job.start}</span></div><div className="mt-2 flex gap-5 text-[10px] text-slate-500"><span>Run ID: 784512</span><span>Environment: Production</span><span>Started: Today, 08:13 AM</span></div></div><div className="flex items-center gap-4"><span className="text-[10px] text-slate-500">Incident ID: INC-2024-05-24-1023</span><button onClick={onClose} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={14}/> Back to Jobs</button></div></header><div className="grid flex-1 min-h-0 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1fr)_205px]"><main className="space-y-3 p-4"><section className="rounded-lg border border-slate-200 bg-white p-3"><div className="mb-2 flex items-center justify-between"><b className="text-[10px] uppercase text-slate-600">Error Logs</b><span className="text-[10px] text-red-500">3 Errors</span></div><pre className="overflow-auto rounded-md bg-slate-950 p-3 text-[10px] leading-5 text-slate-200">08:14:18  [dq-runner] Submitting job to prod-analytics{`\n`}08:14:31  [query-engine] <span className="text-red-400">INT64 cannot be compared with STRING</span>{`\n`}08:14:32  [orchestrator] Task failed after 14 seconds</pre></section><section className="rounded-lg border border-slate-200 bg-white"><header className="flex items-center justify-between border-b border-slate-100 px-3 py-2"><b className="flex items-center gap-2 text-[10px] uppercase text-slate-600"><Sparkles size={13}/> Recommended Resolution</b><span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">96% Confidence</span></header><div className="space-y-3 p-3 text-[10px]"><Info label="Detected issue" text="orders.customer_id (INT64) is joined with customers.customer_id (STRING) after a schema migration."/><Info label="AI recommendation" text="Normalize the customer identifier before the join, validate the result in sandbox, then retry the workflow."/><div className="grid grid-cols-3 border-t border-slate-100 pt-3"><Info label="Affected file" text="product_join.sql (line 49)"/><Info label="Affected pipeline" text={`${job.workflow} – Production`}/><Info label="Impact" text="● Data Mismatch"/></div></div></section><CodeComparison aiCode={aiCode} onCompare={() => setView('compare')} onEdit={() => setView('edit')}/>{source && <Notice text="Opened product_join.sql at line 49."/>}{applied && <Notice text="Resolution staged for validation. No production changes deployed."/>}{sent && <Notice text="Change Request created and sent to the owner."/>}{resolved && <Notice text="Incident marked as resolved."/>}<footer className="flex flex-wrap gap-2 pt-1"><Action label="Preview Diff" icon={Code2}/><Action label="Create GitHub PR" icon={FileText}/><Action label="Edit Code" icon={Edit3} onClick={() => setView('edit')}/><Action label={sent ? 'Sent for Approval' : 'Send for Approval'} icon={FileText} primary onClick={() => setSent(true)}/></footer></main><aside className="m-4 h-fit space-y-3 rounded-lg border border-slate-200 bg-white p-3 text-[10px]"><Summary title="Incident Summary" rows={[["Status","FAILED"],["Severity","P1 - Critical"],["Pipeline",job.workflow],["Environment","Production"],["Start Time","08:13 AM"],["Duration","38m 24s"]]}/><Summary title="Business Impact" rows={[["Affected Records","~ 14,200"],["Downstream Jobs","3"],["Estimated Impact","High"]]}/><div><b className="text-[10px] uppercase text-slate-600">Next Steps</b><ul className="mt-3 space-y-2 text-slate-500"><li>• Review AI-generated code and explanation</li><li>• Edit code if required</li><li>• Create PR and send for owner approval</li><li>• Apply resolution after approval</li></ul></div></aside></div></aside>{view === 'compare' && <FullScreenComparison aiCode={aiCode} onBack={() => setView(null)} onEdit={() => setView('edit')} onDownload={download}/>} {view === 'edit' && <FullScreenEditor aiCode={aiCode} onChange={setAiCode} onBack={() => setView('compare')} onClose={() => setView(null)} onDownload={download}/>}</>
}
function Action({ label,icon:Icon,primary,onClick }) { return <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[10px] font-semibold ${primary ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}><Icon size={13}/>{label}</button> }
function Summary({ title,rows }) { return <section className="border-b border-slate-100 pb-3 last:border-0"><b className="text-[10px] uppercase text-slate-600">{title}</b><div className="mt-2 space-y-2">{rows.map(([label,value]) => <div key={label} className="flex justify-between gap-2 text-slate-500"><span>{label}</span><b className={value.includes('FAILED') || value === 'High' || value.includes('P1') ? 'text-red-500' : 'text-slate-700'}>{value}</b></div>)}</div></section> }
function CodeComparison({ aiCode,productionCode,onCompare,onEdit }) { return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><header className="flex items-center justify-between border-b border-slate-100 px-3 py-2"><b className="flex items-center gap-2 text-[10px] uppercase text-slate-600"><Code2 size={13}/> Code Comparison</b><button onClick={onCompare} className="inline-flex items-center gap-1 rounded border border-blue-300 px-2 py-1 text-[10px] font-semibold text-blue-600"><Maximize2 size={12}/>Compare Full Screen</button></header><div className="grid grid-cols-2 gap-3 p-3"><MiniCode title="Current Production Code" code={productionCode} changed="removed"/><MiniCode title="AI-Generated Code" code={aiCode} changed="added"/><div className="col-span-2 flex justify-end"><button onClick={onEdit} className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white"><Edit3 size={12}/>Edit AI Code</button></div></div></section> }
function MiniCode({ title,code,changed }) {
  const lines = (code || '').split('\n');
  return <div>
    <div className="mb-2 text-[9px] font-bold uppercase text-slate-600">{title} <span className={changed === 'added' ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>({changed === 'added' ? '+ Fix Applied' : '− Production'})</span></div>
    <pre className="h-36 overflow-auto rounded border border-slate-200 bg-slate-900 p-2.5 font-mono text-[10px] leading-5 text-slate-200">
      {lines.map((l, i) => {
        const isAdded = changed === 'added' && (l.includes('extraClassPath') || l.includes('httpclient-jersey') || l.includes('CAST('));
        const isRem = changed === 'removed' && l.includes('spark.jars.packages');
        return <div key={i} className={isAdded ? 'bg-emerald-900/80 text-emerald-300 font-bold px-1 rounded' : isRem ? 'bg-red-950/80 text-red-300 px-1 rounded' : ''}>
          <span className="mr-2 text-slate-600 select-none">{i+1}</span>{l}
        </div>
      })}
    </pre>
  </div>
}
function FullScreenComparison({ aiCode,productionCode,onBack,onEdit,onDownload }) {
  const left = useRef(null), right = useRef(null), syncing = useRef(false);
  const sync = (from,to) => { if (syncing.current) return; syncing.current = true; to.current.scrollTop = from.current.scrollTop; setTimeout(() => { syncing.current = false }, 0) };
  return <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"><ArrowLeft size={16}/>Back to job details</button>
        <span className="h-5 border-l border-slate-200"/>
        <b className="text-sm text-slate-900 font-bold">Code Comparison · column_determination.py</b>
      </div>
      <div className="flex gap-2">
        <Action label="Edit AI Code" icon={Edit3} onClick={onEdit}/>
        <Action label="Download" icon={Download} onClick={onDownload}/>
        <button onClick={onBack} className="rounded p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"><X size={18}/></button>
      </div>
    </header>
    <div className="grid flex-1 min-h-0 grid-cols-2 gap-px bg-slate-300">
      <CodePane ref={left} title="Production Code (Current Version)" code={productionCode} otherCode={aiCode} type="production" onScroll={() => sync(left,right)}/>
      <CodePane ref={right} title="AI-Generated Code (+ OCI ClassPath Fix)" code={aiCode} otherCode={productionCode} type="ai" onScroll={() => sync(right,left)}/>
    </div>
  </div>
}
const CodePane = React.forwardRef(function CodePane({ title,code,otherCode,type,onScroll },ref) {
  const lines = (code || '').split('\n');
  const otherLines = (otherCode || '').split('\n');
  const addedLinesCount = lines.filter(l => l.includes('extraClassPath') || l.includes('httpclient-jersey') || l.includes('CAST(')).length || 2;
  return <section className="min-h-0 overflow-auto bg-white flex flex-col" ref={ref} onScroll={onScroll}>
    <header className={`sticky top-0 z-10 border-b px-5 py-3.5 flex items-center justify-between ${type === 'ai' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-red-50/70 border-red-200 text-red-900'}`}>
      <b className="text-xs font-bold uppercase tracking-wider">{title}</b>
      <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold ${type === 'ai' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-sm'}`}>
        {type === 'ai' ? `+ Added OCI Fix (${addedLinesCount} Lines)` : '− Missing OCI ClassPath'}
      </span>
    </header>
    <pre className="p-6 font-mono text-xs leading-7 text-slate-800 flex-1">
      {lines.map((line,i) => {
        const isAdded = type === 'ai' && (line.includes('extraClassPath') || line.includes('httpclient-jersey') || line.includes('CAST('));
        const isProdDiff = type === 'production' && line.trim() && !otherLines.some(ol => ol.trim() === line.trim());
        return <div key={i} className={`px-3 py-1 my-0.5 rounded transition-colors ${isAdded ? 'bg-emerald-100 text-emerald-950 font-bold border-l-4 border-emerald-500 shadow-sm' : isProdDiff ? 'bg-red-100 text-red-950 font-bold border-l-4 border-red-500' : ''}`}>
          <span className="mr-5 inline-block w-6 select-none text-right font-mono text-slate-400">{46+i}</span>
          <span className={isAdded ? 'text-emerald-900 font-semibold' : isProdDiff ? 'text-red-900 font-semibold' : ''}>{line}</span>
        </div>
      })}
    </pre>
  </section>
})
function FullScreenEditor({ aiCode,onChange,onBack,onClose,onDownload }) { return <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100"><header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div className="flex items-center gap-3"><button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/>Back to comparison</button><span className="h-5 border-l border-slate-200"/><b className="text-sm text-slate-800">Edit AI-Generated Code · column_determination.py</b></div><div className="flex gap-2"><Action label="Download" icon={Download} onClick={onDownload}/><button onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div></header><main className="flex-1 p-6"><textarea aria-label="AI-generated PySpark code editor" value={aiCode} onChange={e => onChange(e.target.value)} spellCheck="false" className="h-full w-full resize-none rounded-lg border border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100 outline-none focus:border-blue-500"/></main></div> }
function Panel({ title,icon:Icon,badge,tone,children }) { return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{Icon && <Icon size={15}/>} {title}</span><span className={`rounded px-2 py-1 text-xs font-medium ${tone === 'red' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{badge}</span></header><div className="p-4">{children}</div></section> }
function Info({ label,text }) { return <div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><p className="mt-1 leading-5 text-slate-600">{text}</p></div> }
function Notice({ text }) { return <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">{text}</div> }
