import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}


const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: unknown,
): Promise<T> {
  
  
  // Prepare headers
  let headers: Record<string, string> = data
    ? { "Content-Type":"application/json" }
    : {};

  // Get token from localStorage
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Make request
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // keep if you also use cookies
  });

  // Error handling
  await throwIfResNotOk(res);

  // Parse and return JSON
  return res.json();
}

// 📌 File upload (FormData)
export async function apiFileRequest<T = any>(
  method: string,
  endpoint: string,
  formData: FormData
): Promise<T> {
  let headers: Record<string, string> = {};

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers, // ⚠️ Don't add Content-Type, browser sets it with boundary
    body: formData,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Perform the GET request
    const res = await fetch(`${BASE_URL}${queryKey[0]}`, {
      headers,
      credentials: "include",
    });

    

    const data = await res.json();

    console.log("data ->", data, "data.resumes ->", data.resumes);

    // Handle 401 Unauthorized
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
