import client from './client'

export const getJobs    = (params) => client.get('/jobs', { params })
export const getJob     = (id)     => client.get(`/jobs/${id}`)
export const getJobChildren = (id) => client.get(`/jobs/${id}/children`)
export const getResolution = (id, force = false) => client.get(`/jobs/${id}/resolution`, { params: force ? { force: true } : {} })
export const approveFix = (id)     => client.post(`/jobs/${id}/approve`)
export const getJobSummary = ()    => client.get('/jobs/summary')
