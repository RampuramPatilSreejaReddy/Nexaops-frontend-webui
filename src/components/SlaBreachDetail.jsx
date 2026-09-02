import React from 'react'

export default function SlaBreachDetail({ jobName, workflow, slaTargetMins, runtime, overdueMins, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{jobName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <span className="mt-1 inline-block rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">SLA Breached</span>
        <div className="mt-4 space-y-2 text-[12px] text-slate-600">
          <div className="flex justify-between"><span>Workflow</span><b className="text-slate-800">{workflow || '—'}</b></div>
          <div className="flex justify-between"><span>SLA target</span><b className="text-slate-800">{slaTargetMins ? `${slaTargetMins} min` : '—'}</b></div>
          <div className="flex justify-between"><span>Actual runtime</span><b className="text-slate-800">{runtime || '—'}</b></div>
          <div className="flex justify-between"><span>Overdue by</span><b className="text-amber-700">{overdueMins != null ? `${overdueMins} min` : '—'}</b></div>
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <b className="text-[10px] uppercase text-slate-500">Suggested checks</b>
          <ul className="mt-2 space-y-1.5 list-disc pl-4 text-[12px] text-slate-600">
            <li>Check upstream data volume — an unusually large batch can push runtime past target.</li>
            <li>Check for resource contention (CPU/memory) on this job's cluster or worker pool.</li>
            <li>Review recent changes to this pipeline's query or transformation logic.</li>
            <li>If this is a recurring pattern, consider revisiting the SLA target itself.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
