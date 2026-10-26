import {
  createContext,
  useState,
  useContext,
  useEffect
} from "react";
import io from "socket.io-client";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 🔄 RESTORE LOGIN ON REFRESH
  // ===============================
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("✅ Auth restored");
      }
    } catch (err) {
      console.error("❌ Failed to restore auth");
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // 🔌 SOCKET CONNECT AFTER LOGIN
  // ===============================
  useEffect(() => {
    if (!token) return;

    const s = io("http://localhost:5000", {
      auth: { token }
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("🔌 Socket connected:", s.id);
    });

    // ✅ MATCHES BACKEND EVENT NAME
    s.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  // ===============================
  // 🔐 LOGIN / REGISTER
  // ===============================
  const login = async (action, credentials) => {
    try {
      const endpoint =
        action === "signup"
          ? "http://localhost:5000/api/auth/register"
          : "http://localhost:5000/api/auth/login";

      const payload =
        action === "signup"
          ? {
              name: credentials.fullName,
              email: credentials.email,
              password: credentials.password,
              bio: credentials.bio || ""
            }
          : {
              email: credentials.email,
              password: credentials.password
            };

      console.log("➡️", endpoint, payload);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Auth failed" };
      }

      // ✅ SAVE AUTH
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      console.error("❌ Auth error:", err);
      return { success: false, error: "Server not reachable" };
    }
  };

  // ===============================
  // 🚪 LOGOUT
  // ===============================
  const logout = () => {
    socket?.disconnect();
    setSocket(null);
    setUser(null);
    setToken(null);
    setOnlineUsers([]);

    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        socket,
        onlineUsers,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// 🪝 SAFE HOOK
// ===============================
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
