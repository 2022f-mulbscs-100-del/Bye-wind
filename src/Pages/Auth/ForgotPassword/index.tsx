import { Link } from "react-router-dom";
import { FiArrowRight, FiMail } from "react-icons/fi";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white">
            <div>
              <div className="text-2xl font-semibold">Reset access</div>
              <p className="mt-3 text-sm text-slate-200">
                We’ll email you a secure link to reset your password.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm">
              If you no longer have access, contact support.
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Forgot password
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Reset your password
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Enter the email associated with your account.
            </p>

            <label className="mt-6 block text-xs font-semibold text-slate-500">
              Email
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FiMail className="text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
            </label>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              Send reset link
              <FiArrowRight />
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-slate-900">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
