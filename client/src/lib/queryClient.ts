import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get Firebase auth token or test user
  let headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  try {
    const { auth } = await import("@/lib/firebase");
    const user = auth.currentUser;
    if (user) {
      headers["x-firebase-uid"] = user.uid;
    } else {
      // Check for test user
      const testUser = localStorage.getItem("test-user");
      if (testUser) {
        const testUserData = JSON.parse(testUser);
        headers["x-firebase-uid"] = testUserData.firebaseUid;
      }
    }
  } catch (error) {
    console.warn("Firebase auth not available, checking test user:", error);
    // Check for test user as fallback
    const testUser = localStorage.getItem("test-user");
    if (testUser) {
      const testUserData = JSON.parse(testUser);
      headers["x-firebase-uid"] = testUserData.firebaseUid;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let headers: Record<string, string> = {};
    
    try {
      const { auth } = await import("@/lib/firebase");
      const user = auth.currentUser;
      if (user) {
        headers["x-firebase-uid"] = user.uid;
      } else {
        // Check for test user
        const testUser = localStorage.getItem("test-user");
        if (testUser) {
          const testUserData = JSON.parse(testUser);
          headers["x-firebase-uid"] = testUserData.firebaseUid;
        }
      }
    } catch (error) {
      console.warn("Firebase auth not available, checking test user:", error);
      // Check for test user as fallback
      const testUser = localStorage.getItem("test-user");
      if (testUser) {
        const testUserData = JSON.parse(testUser);
        headers["x-firebase-uid"] = testUserData.firebaseUid;
      }
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
