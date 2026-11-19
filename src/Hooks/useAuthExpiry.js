import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutSuccess } from "../Redux/userSlice";
import BASE_URL from "../Utils/config";

export default function useAuthExpiry() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);

  // Single source of truth for logging out
  const doLogout = useCallback(
    async (reason = "expired") => {
      try {
        await axios.get(`${BASE_URL}/api/auth/logout`, {
          withCredentials: true,
        });
      } catch {
        // ignore — we're logging out anyway
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("exp");
      dispatch(logoutSuccess());

      if (reason === "expired") {
        navigate("/auth?expired=1", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    // No user → nothing to watch
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Decode expiry
    let expiry;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      expiry = payload.exp * 1000;
    } catch {
      doLogout("invalid");
      return;
    }

    const timeLeft = expiry - Date.now();

    // Already expired
    if (timeLeft <= 0) {
      doLogout("expired");
      return;
    }

    // Primary timer — fires exactly at expiry
    const timer = setTimeout(() => doLogout("expired"), timeLeft);

    // Safety-net poll every 30s
    // (handles tab throttling, laptop sleep, clock drift, token swapped)
    const poll = setInterval(() => {
      const t = localStorage.getItem("token");
      if (!t) {
        doLogout("expired");
        return;
      }
      try {
        const p = JSON.parse(atob(t.split(".")[1]));
        if (Date.now() > p.exp * 1000) doLogout("expired");
      } catch {
        doLogout("expired");
      }
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
    };
  }, [user, doLogout]);
}