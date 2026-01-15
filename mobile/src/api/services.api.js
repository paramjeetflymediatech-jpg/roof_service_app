import http from './httpClient';

export async function fetchServices() {
  const res = await http.get('/services');
  return res.data;
}
