// Helper function wich automatically redirects to /logout on 401
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  let response = await fetch(input, init);
  if (response.status === 401) {
    window.location.href = "/login";
  }
  let body = await response.json();
  if (response.ok) {
    return body;
  } else {
    throw new Error(body.message);
  }
}
