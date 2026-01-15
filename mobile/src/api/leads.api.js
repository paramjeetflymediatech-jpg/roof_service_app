import http from './httpClient';

export async function fetchLeads() {
  const res = await http.get('/leads');
  return res.data;
}

export async function createLead(payload) {
  const res = await http.post('/leads', payload);
  return res.data;
}
