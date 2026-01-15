import http from './httpClient';

export async function fetchServices() {
  const res = await http.get('/services');
  return res.data;
}

export async function createService(payload) {
  const res = await http.post('/services', payload);
  return res.data;
}
