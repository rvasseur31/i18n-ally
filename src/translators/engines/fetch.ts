const DEFAULT_TIMEOUT = 30000

// fetch wrapper that aborts the request after `timeout` ms to avoid hanging translation jobs
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
