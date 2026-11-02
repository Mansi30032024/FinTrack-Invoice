import { useCallback, useEffect, useState } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";

function App() {
  const savedToken = localStorage.getItem("invoiceToken") || "";
  const savedUser = JSON.parse(localStorage.getItem("invoiceUser") || "null");

  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(savedUser);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("invoiceToken");
    localStorage.removeItem("invoiceUser");
    localStorage.removeItem("invoiceLastActivity");

    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    const idleLimit = 15 * 60 * 1000;
    const activityKey = "invoiceLastActivity";
    let lastWrite = 0;
    const initialActivity =
      Number(localStorage.getItem(activityKey)) || Date.now();

    if (Date.now() - initialActivity >= idleLimit) {
      const logoutTimer = window.setTimeout(handleLogout, 0);

      return () => window.clearTimeout(logoutTimer);
    }

    localStorage.setItem(activityKey, String(initialActivity));

    const recordActivity = () => {
      const now = Date.now();
      if (now - lastWrite < 1000) return;
      lastWrite = now;
      localStorage.setItem(activityKey, String(now));
    };

    const checkIdle = () => {
      const lastActivity =
        Number(localStorage.getItem(activityKey)) || initialActivity;
      if (Date.now() - lastActivity >= idleLimit) handleLogout();
    };

    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    const syncLogout = (event) => {
      if (event.key === "invoiceToken" && !event.newValue) handleLogout();
    };
    events.forEach((eventName) =>
      window.addEventListener(eventName, recordActivity, { passive: true }),
    );
    window.addEventListener("storage", syncLogout);
    const timer = window.setInterval(checkIdle, 15000);

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, recordActivity),
      );
      window.removeEventListener("storage", syncLogout);
      window.clearInterval(timer);
    };
  }, [token, handleLogout]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem("invoiceToken", newToken);
    localStorage.setItem("invoiceUser", JSON.stringify(userData));
    localStorage.setItem("invoiceLastActivity", String(Date.now()));

    setToken(newToken);
    setUser(userData);
  };

  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}

export default App;
