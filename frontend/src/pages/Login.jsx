import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Hardcoded credentials check
    if (email === "admin@company.com" && password === "password123") {
      localStorage.setItem("loginEmail", email);
      onLogin();
    } else {
      setError("Invalid email or password. Use admin@company.com / password123");
    }
  };

  return (
    <div className="bg-gradient-to-tr from-[#ede9fe] via-[#f5f3ff] to-[#fae8ff] min-h-screen flex flex-col justify-center items-center p-6 text-left font-sans">
      <div className="bg-white rounded-[32px] border border-white/20 shadow-xl w-[440px] max-w-full p-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="bg-[#8b5cf6] text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-violet-100">
            <span className="material-symbols-outlined text-[30px] font-light">
              query_stats
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-4">
            Workload Engine
          </h2>
          <p className="text-[9px] font-extrabold text-gray-400 tracking-widest uppercase mt-1.5">
            Weekly Workload Forecast
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-[11px] font-bold text-center leading-normal animate-pulse">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Email input */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
              Work Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/30"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Settings Row */}
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#7c3aed] focus:ring-[#7c3aed]/20"
              />
              <span>Remember for 30 days</span>
            </label>
            <a href="#" className="text-[#7c3aed] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#7c3aed] text-white py-3.5 px-6 rounded-2xl font-extrabold text-xs shadow-md shadow-violet-200 hover:bg-[#6d28d9] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            <span>Sign in to Forecast</span>
            <span className="material-symbols-outlined text-sm font-bold">
              arrow_forward
            </span>
          </button>
        </form>

        {/* Contact Admin footer */}
        <div className="text-center text-[11px] font-bold text-gray-400 mt-2 border-t border-gray-50 pt-4">
          Don't have an enterprise account?{" "}
          <a href="#" className="text-[#7c3aed] hover:underline">
            Contact Admin
          </a>
        </div>
      </div>

      {/* Corporate Policy links footer */}
      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400/80 tracking-wider uppercase mt-8 select-none">
        <a href="#" className="hover:text-gray-600 transition">
          Privacy Policy
        </a>
        <span className="text-gray-300">•</span>
        <a href="#" className="hover:text-gray-600 transition">
          Terms of Service
        </a>
        <span className="text-gray-300">•</span>
        <a href="#" className="hover:text-gray-600 transition">
          Help Center
        </a>
      </div>
    </div>
  );
}
