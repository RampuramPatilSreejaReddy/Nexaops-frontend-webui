import client from './client'

export const getDashboardSummary  = () => client.get('/dashboard/summary')
export const getSlaBreaches       = () => client.get('/dashboard/sla-breaches')
export const getLongRunning       = () => client.get('/dashboard/long-running')
export const getHighCpu           = () => client.get('/dashboard/high-cpu')
export const getDailyTrend        = () => client.get('/dashboard/daily-trend')
export const getStatusBreakdown   = () => client.get('/dashboard/status-breakdown')
export const getDailyReport       = () => client.get('/dashboard/report')
export const getActiveAlerts      = () => client.get('/dashboard/active-alerts')
