export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000")
).replace(/\/$/, "");

const SIGN_IN_MESSAGE = "Your session has expired. Please sign in again.";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const extractError = (data, fallback) => {
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].message;
  }
  return data?.message || fallback;
};

// Access tokens last 15 minutes, so refresh them with the refresh cookie.
// One shared promise stops parallel calls from reusing the same refresh token.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.accessToken) return false;
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const apiRequest = async (path, options = {}, canRetry = true) => {
  const { auth = true, body, headers: requestHeaders, ...fetchOptions } = options;
  let token = auth ? localStorage.getItem("accessToken") : null;
  if (auth && !token && canRetry && (await refreshAccessToken())) {
    token = localStorage.getItem("accessToken");
  }
  if (auth && !token) throw new ApiError(SIGN_IN_MESSAGE, 401);

  const headers = new Headers(requestHeaders);
  headers.set("Accept", "application/json");
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      method: fetchOptions.method || (body === undefined ? "GET" : "POST"),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0
    );
  }

  if (res.status === 401 && auth && canRetry && (await refreshAccessToken())) {
    return apiRequest(path, options, false);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new ApiError(SIGN_IN_MESSAGE, 401);
    if (res.status === 403) {
      throw new ApiError(
        "You do not have permission to do this. Sign in with a mentor account.",
        403
      );
    }
    throw new ApiError(extractError(data, "Request failed"), res.status);
  }
  return data;
};
