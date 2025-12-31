import { supabase } from './supabase';
import { API_URL } from './api';

export async function scanLease(
    fileBase64: string, 
    fileName: string, 
    onProgress?: (step: number, message: string) => void
): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("User not authenticated");

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/scans/scan`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Accept', 'text/event-stream');

        let lastIndex = 0;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 3 || xhr.readyState === 4) {
                const newText = xhr.responseText.substring(lastIndex);
                lastIndex = xhr.responseText.length;

                const lines = newText.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (!jsonStr) continue;

                        try {
                            const payload = JSON.parse(jsonStr);
                            if (payload.type === 'status') {
                                if (onProgress) onProgress(payload.step, payload.message);
                            } else if (payload.type === 'result') {
                                // We store the result but wait for readyState 4 to resolve
                                (xhr as any)._resultData = payload.data;
                            } else if (payload.type === 'error') {
                                xhr.abort();
                                reject(new Error(payload.message || "Analysis failed"));
                            }
                        } catch (e) {
                            // Partial JSON chunk, skip and wait for more
                        }
                    }
                }
            }

            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if ((xhr as any)._resultData) {
                        resolve((xhr as any)._resultData);
                    } else {
                        reject(new Error("Stream closed without analysis result"));
                    }
                } else if (xhr.status !== 0) { // status 0 can happen on abort
                    reject(new Error(`API Error ${xhr.status}: ${xhr.responseText.substring(0, 100)}`));
                }
            }
        };

        xhr.onerror = () => reject(new Error("Network request failed"));
        xhr.send(JSON.stringify({ fileBase64, fileName }));
    });
}

export async function fetchScans() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${API_URL}/api/scans`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.scans || [];
}
