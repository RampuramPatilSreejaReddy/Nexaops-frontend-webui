import client from './client'

export const getJobs    = (params) => client.get('/jobs', { params })
export const getJob     = (id)     => client.get(`/jobs/${id}`)
export const getResolution = (id)  => client.get(`/jobs/${id}/resolution`)
export const approveFix = (id)     => client.post(`/jobs/${id}/approve`)
export const getJobSummary = ()    => client.get('/jobs/summary')
