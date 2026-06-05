import { useEffect, useState } from "react";
import { getCurrentUser, getGithubLoginUrl, logoutCurrentUser } from "../api/client";

const guestUser = {
  name: "Guest Session",
  handle: "Sign in to save reviews",
  avatarUrl:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%25' height='100%25' rx='40' fill='%23172233'/><text x='50%25' y='54%25' font-size='28' fill='%23cbd5e1' text-anchor='middle' font-family='Arial'>G</text></svg>",
};

export function useAuth() {
  const [user, setUser] = useState(guestUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        setUser({
          name: currentUser.username,
          handle: currentUser.email || `github:${currentUser.githubId}`,
          avatarUrl: currentUser.avatarUrl || guestUser.avatarUrl,
        });
        setIsAuthenticated(true);
        setAuthError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUser(guestUser);
        setIsAuthenticated(false);
        setAuthError(error.code === "NOT_AUTHENTICATED" ? "" : error.message || "Failed to verify session");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await logoutCurrentUser();
    } finally {
      setUser(guestUser);
      setIsAuthenticated(false);
      setAuthError("");
    }
  };

  return {
    authError,
    isAuthenticated,
    isLoading,
    loginUrl: getGithubLoginUrl(),
    logout,
    user,
  };
}
