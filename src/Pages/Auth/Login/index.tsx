import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";

type Profile = {
  id: string;
  role: "admin" | "super-admin" | "user";
  name: string;
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      return "Email and password are required.";
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validate();
    if (nextError) {
      setError(nextError);
      return;
    }

    let matchedRole: Profile["role"] | null = null;
    let matchedName: string | null = null;

    try {
      const response = await fetch("/DummyApis/profiles.json");
      if (response.ok) {
        const json = (await response.json()) as { profiles: Profile[] };
        const match = json.profiles.find(
          (profile) =>
            profile.email.toLowerCase() === email.toLowerCase() &&
            profile.password === password
        );
        if (match) {
          matchedRole = match.role;
          matchedName = match.name;
        }
      }
    } catch {
      // fall through to local user storage
    }

    if (!matchedRole) {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as {
            email: string;
            password: string;
            name?: string;
            role?: "user";
          };
          if (
            parsed.email.toLowerCase() !== email.toLowerCase() ||
            parsed.password !== password
          ) {
            setError("Invalid credentials. Please check your email or password.");
            return;
          }
          matchedRole = parsed.role ?? "user";
          matchedName = parsed.name ?? null;
        } catch {
          setError("Stored account data is invalid. Please sign up again.");
          return;
        }
      } else {
        setError("No account found. Please sign up first.");
        return;
      }
    }

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("auth_email", email);
    localStorage.setItem("auth_role", matchedRole);
    if (matchedName) {
      localStorage.setItem("auth_name", matchedName);
    }
    setError("");
    if (matchedRole === "super-admin") {
      navigate("/super-admin");
    } else if (matchedRole === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/guest-profile");
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-10 text-white">
          <div>
            <div className="text-2xl font-semibold">ByeWind</div>
            <p className="mt-3 text-sm text-slate-200">
              Welcome back. Manage reservations, staff, and guest experience from a
              single dashboard.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-300">
              Operations snapshot
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-lg font-semibold">92%</div>
                <div className="text-xs text-slate-200">Table utilization</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-lg font-semibold">4.9★</div>
                <div className="text-xs text-slate-200">Guest rating</div>
              </div>
            </div>
          </div>
        </div>

        <form className="p-8 sm:p-10" onSubmit={handleLogin}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Login
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            Sign in to your account
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Use your email and password to continue.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-slate-500">
              Email
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FiMail className="text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>
            <label className="block text-xs font-semibold text-slate-500">
              Password
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FiLock className="text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
              Remember me
            </label>
            <button
              type="button"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Sign In
            <FiArrowRight />
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-slate-900">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
