const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // If not JSON, it's likely an HTML error page from a proxy or server crash
  const text = await response.text();
  console.error('Non-JSON response received:', text.slice(0, 200));
  throw new Error(`Server returned ${response.status} ${response.statusText}. Expected JSON but got ${contentType || 'unknown'}.`);
}

export const api = {
  // User endpoints
  getUser: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  // Scan endpoints
  getScans: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  getScanById: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/scans/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  // Payment endpoints
  createPayment: async (planId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planId }),
    });
    return handleResponse(response);
  },
};
