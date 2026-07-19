import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  forgotPassword,
  resetPassword,
} from "../services/authService";

const savedEmail = localStorage.getItem("needful_remembered_email") || "";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: loginLoading } = useAuth();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(Boolean(savedEmail));
  const [formData, setFormData] = useState({
    email: savedEmail,
    password: "",
  });
  const [resetForm, setResetForm] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const passwordChecks = useMemo(() => {
    const password = resetForm.newPassword;

    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&.#_-]/.test(password),
    };
  }, [resetForm.newPassword]);

  const passwordIsStrong = Object.values(passwordChecks).every(Boolean);
  const busy = loginLoading || recoveryLoading;

  const clearMessage = () => {
    if (message.text) setMessage({ type: "", text: "" });
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage({ type: "", text: "" });
    setShowPassword(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const email = formData.email.trim().toLowerCase();
    if (!email || !formData.password) {
      setMessage({
        type: "error",
        text: "Enter your email address and password.",
      });
      return;
    }

    const result = await login({ email, password: formData.password });

    if (!result.success) {
      setMessage({ type: "error", text: result.message });
      return;
    }

    if (rememberEmail) {
      localStorage.setItem("needful_remembered_email", email);
    } else {
      localStorage.removeItem("needful_remembered_email");
    }

    navigate("/", { replace: true });
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const email = formData.email.trim().toLowerCase();
    if (!email) {
      setMessage({
        type: "error",
        text: "Enter the email address connected to your account.",
      });
      return;
    }

    try {
      setRecoveryLoading(true);
      const result = await forgotPassword(email);
      setMode("reset");
      setMessage({
        type: "success",
        text: result.message || "A reset code was sent to your email.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "We could not send a reset code. Please try again.",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!resetForm.code.trim()) {
      setMessage({ type: "error", text: "Enter the reset code from your email." });
      return;
    }
    if (!passwordIsStrong) {
      setMessage({
        type: "error",
        text: "Your new password does not meet all requirements.",
      });
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }

    try {
      setRecoveryLoading(true);
      const result = await resetPassword({
        email: formData.email.trim().toLowerCase(),
        token: resetForm.code.trim(),
        newPassword: resetForm.newPassword,
      });

      setResetForm({ code: "", newPassword: "", confirmPassword: "" });
      setMode("login");
      setMessage({
        type: "success",
        text: result.message || "Password reset. You can now sign in.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "We could not reset your password. Check the code and try again.",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen bg-charcoal-50 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-h-screen flex-col">
        <header className="flex h-20 items-center justify-between border-b border-charcoal-200 bg-white px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center bg-primary-700 text-lg font-black text-white">
              N
            </span>
            <span className="text-xl font-extrabold text-charcoal-950">
              Needful
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-charcoal-600 hover:text-primary-800"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md rounded-3xl border border-charcoal-200 bg-white p-6 sm:p-8">
            {mode !== "login" && (
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "reset" ? "forgot" : "login")
                }
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-charcoal-600 transition hover:text-primary-800"
              >
                <ArrowLeft size={17} />
                {mode === "reset" ? "Change email address" : "Back to sign in"}
              </button>
            )}

            <div className="border-l-4 border-primary-600 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                {mode === "login"
                  ? "Member access"
                  : mode === "forgot"
                    ? "Account recovery"
                    : "Create new password"}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl">
                {mode === "login"
                  ? "Sign in to Needful"
                  : mode === "forgot"
                    ? "Forgot your password?"
                    : "Reset your password"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-charcoal-500">
                {mode === "login"
                  ? "Enter your details to continue to your account."
                  : mode === "forgot"
                    ? "We’ll email you a six-digit code that expires in 10 minutes."
                    : `Enter the code sent to ${formData.email}.`}
              </p>
            </div>

            {message.text && (
              <div
                role="alert"
                className={`mt-6 border-l-4 px-4 py-3 text-sm font-semibold leading-6 ${
                  message.type === "success"
                    ? "border-primary-600 bg-primary-50 text-primary-900"
                    : "border-charcoal-700 bg-charcoal-100 text-charcoal-900"
                }`}
              >
                {message.text}
              </div>
            )}

            {mode === "login" && (
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Email address
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <Mail size={18} className="shrink-0 text-charcoal-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(event) => {
                        clearMessage();
                        setFormData((current) => ({
                          ...current,
                          email: event.target.value,
                        }));
                      }}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Password
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-charcoal-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(event) => {
                        clearMessage();
                        setFormData((current) => ({
                          ...current,
                          password: event.target.value,
                        }));
                      }}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="grid h-9 w-9 shrink-0 place-items-center text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-800"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-charcoal-600">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(event) =>
                        setRememberEmail(event.target.checked)
                      }
                      className="h-4 w-4 accent-primary-700"
                    />
                    Remember my email
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs font-bold text-primary-700 transition hover:text-primary-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 bg-primary-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-charcoal-300"
                >
                  {loginLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                  {loginLoading ? "Signing in..." : "Sign in securely"}
                  {!loginLoading && <ArrowRight size={17} />}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Account email address
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <Mail size={18} className="text-charcoal-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => {
                        clearMessage();
                        setFormData((current) => ({
                          ...current,
                          email: event.target.value,
                        }));
                      }}
                      required
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 bg-primary-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-primary-800 disabled:opacity-60"
                >
                  {recoveryLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Mail size={18} />
                  )}
                  {recoveryLoading ? "Sending code..." : "Email me a reset code"}
                </button>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Six-digit reset code
                  </span>
                  <input
                    inputMode="numeric"
                    value={resetForm.code}
                    onChange={(event) => {
                      clearMessage();
                      setResetForm((current) => ({
                        ...current,
                        code: event.target.value.replace(/\D/g, "").slice(0, 6),
                      }));
                    }}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    placeholder="000000"
                    className="mt-2 w-full border border-charcoal-300 bg-white px-4 py-3.5 text-center text-xl font-bold tracking-[0.45em] text-charcoal-900 outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    New password
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <KeyRound size={18} className="text-charcoal-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={resetForm.newPassword}
                      onChange={(event) => {
                        clearMessage();
                        setResetForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }));
                      }}
                      required
                      autoComplete="new-password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="grid h-9 w-9 place-items-center text-charcoal-400 hover:bg-charcoal-100"
                      aria-label={
                        showPassword ? "Hide passwords" : "Show passwords"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Confirm new password
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={resetForm.confirmPassword}
                    onChange={(event) => {
                      clearMessage();
                      setResetForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }));
                    }}
                    required
                    autoComplete="new-password"
                    className="mt-2 w-full border border-charcoal-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                  />
                </label>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-charcoal-200 bg-charcoal-50 p-4">
                  {[
                    ["length", "8+ characters"],
                    ["uppercase", "Uppercase letter"],
                    ["lowercase", "Lowercase letter"],
                    ["number", "Number"],
                    ["special", "Special character"],
                  ].map(([key, label]) => (
                    <p
                      key={key}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                        passwordChecks[key]
                          ? "text-primary-800"
                          : "text-charcoal-400"
                      }`}
                    >
                      <Check size={13} />
                      {label}
                    </p>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={busy || !passwordIsStrong}
                  className="inline-flex w-full items-center justify-center gap-2 bg-charcoal-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:bg-charcoal-300"
                >
                  {recoveryLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  {recoveryLoading ? "Resetting password..." : "Set new password"}
                </button>
              </form>
            )}

            {mode === "login" && (
              <>
                <div className="my-8 flex items-center gap-4">
                  <span className="h-px flex-1 bg-charcoal-200" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal-400">
                    New to Needful?
                  </span>
                  <span className="h-px flex-1 bg-charcoal-200" />
                </div>
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-2 border border-charcoal-400 bg-white px-6 py-3.5 text-sm font-bold text-charcoal-900 transition hover:border-primary-600 hover:bg-primary-50 hover:text-primary-900"
                >
                  Create a free account
                  <ArrowRight size={17} />
                </Link>
              </>
            )}

            <p className="mt-8 text-center text-[11px] leading-5 text-charcoal-400">
              Protected by secure authentication. Needful will never ask for
              your password by email.
            </p>
          </div>
        </div>
      </section>

      <aside className="hidden min-h-screen bg-charcoal-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex w-fit items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-primary-600 text-xl font-black">
            N
          </span>
          <span className="text-xl font-extrabold">Needful</span>
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">
            Welcome back
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">
            Continue helping your community.
          </h2>
          <p className="mt-4 text-sm leading-7 text-charcoal-300">
            Manage your items, requests, and profile from one secure account.
          </p>
          <div className="mt-8 h-1 w-16 rounded-full bg-primary-500" />
        </div>
        <p className="text-xs text-charcoal-500">
          Sharing useful things, simply.
        </p>
      </aside>
    </main>
  );
};

export default Login;
