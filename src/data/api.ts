const baseEndpoint = 'http://localhost:4000';

export async function callApi(
    endpoint: string,
    method: string = "GET",
    body?: any,
    headers?: Record<string, string>
): Promise<any> {
    if (endpoint.startsWith("/")) {
        endpoint = endpoint.substring(1);
    }
    const response = await fetch(`${baseEndpoint}/${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
    }

    return response.json();
}