import client from './client'

export const login    = (email, password) => client.post('/auth/login', { email, password })
export const register = (email, password, name) => client.post('/auth/register', { email, password, name })
export const getMe    = () => client.get('/auth/me')
