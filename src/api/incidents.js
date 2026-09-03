import client from './client'

export const getIncidents = (params) => client.get('/incidents', { params })
export const getIncident  = (id)     => client.get(`/incidents/${id}`)
