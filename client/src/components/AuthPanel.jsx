import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../../redux/userSlice";
import { API_BASE } from "../../lib/api";
export default function AuthPanel() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials:"include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      dispatch(addUser(data.user));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[380px] mx-auto my-12 px-9 pt-9 pb-8 bg-[#F7F4EC] border border-[#DEDACB] rounded">
      <h2 className="font-serif text-[26px] font-medium text-[#22261F] mb-1">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h2>
      <p className="text-sm text-[#6B6A5E] mb-7">
        {mode === "login"
          ? "Sign in to keep asking your documents questions."
          : "Set up an account to start uploading and asking."}
      </p>

      <div className="flex gap-6 border-b border-[#DEDACB] mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`relative pb-2.5 text-sm cursor-pointer ${
            mode === "login"
              ? "text-[#1F4B3F] font-medium after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-[#1F4B3F]"
              : "text-[#8B8A7C]"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
          }}
          className={`relative pb-2.5 text-sm cursor-pointer ${
            mode === "signup"
              ? "text-[#1F4B3F] font-medium after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-[#1F4B3F]"
              : "text-[#8B8A7C]"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[13px] text-[#4C4B41]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="text-sm px-3 py-2.5 bg-white border border-[#D2CDBC] rounded-[3px] text-[#22261F] outline-none focus:border-[#1F4B3F] focus:ring-4 focus:ring-[#1F4B3F1F]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] text-[#4C4B41]">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full box-border text-sm px-3 py-2.5 pr-10 bg-white border border-[#D2CDBC] rounded-[3px] text-[#22261F] outline-none focus:border-[#1F4B3F] focus:ring-4 focus:ring-[#1F4B3F1F]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex items-center text-[#8B8A7C]"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </label>

        {error && (
          <p className="text-[13px] text-[#8C2F2F] bg-[#F7EAE9] border border-[#E5C4C2] rounded-[3px] px-2.5 py-2 m-0">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 text-sm font-medium text-[#F7F4EC] bg-[#1F4B3F] border-none rounded-[3px] py-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-default enabled:hover:bg-[#17392F]"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <div className="flex items-center gap-2.5 my-6">
        <div className="flex-1 h-px bg-[#DEDACB]"></div>
        <span className="text-xs text-[#9C9A8C]">or</span>
        <div className="flex-1 h-px bg-[#DEDACB]"></div>
      </div>

      <a
        href="http://localhost:5000/api/auth/google"
        className="flex items-center justify-center gap-2.5 text-sm text-[#22261F] bg-white border border-[#D2CDBC] rounded-[3px] py-2.5 no-underline cursor-pointer hover:bg-[#FBFAF6] hover:border-[#B8B29C]"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14-5l-6.5-5.5C29.5 35.4 26.9 36 24 36c-5.3 0-9.7-3-11.3-7.9l-6.5 5C9.6 39.5 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.5 5.5C40.7 36.4 44 30.8 44 24c0-1.2-.1-2.3-.4-3.5z"/>
        </svg>
        Continue with Google
      </a>
    </div>
  );
}