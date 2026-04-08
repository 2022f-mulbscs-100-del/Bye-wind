import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiMail, FiUser } from "react-icons/fi";
import { postJson } from "@/lib/api";
import { persistAuthSession, type StaffSummary } from "@/lib/auth";

interface SignupResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  token: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return "All fields are required.";
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validate();
    if (nextError) {
      setError(nextError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Split full name into firstName and lastName
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const response = await postJson<SignupResponse>(
        "/auth/signup",
        {
          firstName,
          lastName,
          email: email.trim(),
          password,
        }
      );

      if (!response.data) {
        throw new Error("Unexpected response from server");
      }

      // Store user and token using the helper and navigate
      const { user, token } = response.data;
      persistAuthSession(token, user as StaffSummary);

      // Navigate to restaurants page
      navigate("/restaurants");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
          <form className="p-8 sm:p-10" onSubmit={handleSignup}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sign up
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Create your account
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Start managing reservations and operations in minutes.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-slate-500">
                Full name
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiUser className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Work email
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@restaurant.com"
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Password
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <FiArrowRight />}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-slate-900">
                Sign in
              </Link>
            </p>
          </form>

          <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white">
            <div>
              <div className="text-2xl font-semibold">Grow with ByeWind</div>
              <p className="mt-3 text-sm text-slate-200">
                Launch reservations, loyalty, and payments for your brand.
              </p>
            </div>
            <div className="grid gap-3 text-sm">
              {[
                "Unlimited locations",
                "Realtime guest insights",
                "Automated waitlist",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
