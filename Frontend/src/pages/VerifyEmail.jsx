import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resendVerificationCode } from "../services/authService";

const CODE_LENGTH = 6;
const MAX_EMAIL_LENGTH = 254;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verify, loading } = useAuth();
  const inputRefs = useRef([]);
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialEmail ? 60 : 0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const clearMessage = () => {
    if (message.text) setMessage({ type: "", text: "" });
  };

  const updateDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    clearMessage();

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pastedCode) return;

    event.preventDefault();
    const nextDigits = Array(CODE_LENGTH).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    clearMessage();
    inputRefs.current[Math.min(pastedCode.length, CODE_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const code = digits.join("");
    setMessage({ type: "", text: "" });

    if (!normalizedEmail) {
      setMessage({ type: "error", text: "Enter your email address." });
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setMessage({
        type: "error",
        text: `Enter the complete ${CODE_LENGTH}-digit verification code.`,
      });
      return;
    }

    const result = await verify({ email: normalizedEmail, code });

    if (!result.success) {
      setMessage({ type: "error", text: result.message });
      return;
    }

    toast.success("Email verified. Welcome to Needful!");
    navigate("/", { replace: true });
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage({
        type: "error",
        text: "Enter your email address before requesting another code.",
      });
      return;
    }

    try {
      setResending(true);
      setMessage({ type: "", text: "" });
      const result = await resendVerificationCode(normalizedEmail);

      setDigits(Array(CODE_LENGTH).fill(""));
      setCooldown(60);
      setMessage({
        type: "success",
        text: result.message || "A new verification code was sent.",
      });
      inputRefs.current[0]?.focus();
    } catch (error) {
      const retryAfter = Number(error.response?.data?.retryAfter);
      if (retryAfter > 0) setCooldown(retryAfter);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "A new code could not be sent. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  const codeComplete = digits.every(Boolean);
  const busy = loading || resending;

  return (
    <main className="auth-page min-h-screen bg-charcoal-50 text-charcoal-900">
      <header className="flex h-18 items-center justify-between border-b border-charcoal-200 bg-white px-5 py-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-700 text-lg font-black text-white">
            N
          </span>
          <span className="text-xl font-extrabold tracking-tight text-charcoal-900">
            Needful
          </span>
        </Link>
        <Link
          to="/login"
          className="text-sm font-bold text-charcoal-600 transition hover:text-primary-700"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <Link
          to="/register"
          className="mb-7 inline-flex w-fit items-center gap-2 text-sm font-bold text-charcoal-500 transition hover:text-primary-700"
        >
          <ArrowLeft size={16} />
          Back to registration
        </Link>

        <div className="mb-6 grid grid-cols-3 gap-2" aria-label="Account setup progress">
          <div className="h-1.5 rounded-full bg-primary-700" />
          <div className="h-1.5 rounded-full bg-primary-700" />
          <div className="h-1.5 rounded-full bg-charcoal-200" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
          <div className="h-1.5 bg-primary-700" />
          <div className="px-5 py-7 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-100 text-primary-800">
                <MailCheck size={27} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                Step 2 of 3
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-charcoal-950 sm:text-4xl">
                Check your inbox
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal-500 sm:text-base">
                Enter the six-digit verification code we sent to your email.
                It expires in 10 minutes.
              </p>
            </div>

            {message.text && (
              <div
                role="alert"
                className={`mx-auto mt-6 flex max-w-lg items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${
                  message.type === "success"
                    ? "border-primary-200 bg-primary-50 text-primary-900"
                    : "border-charcoal-300 bg-charcoal-50 text-charcoal-900"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-lg space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-charcoal-800">
                  Email address
                </span>
                <div className="mt-2 flex items-center rounded-xl border border-charcoal-300 bg-charcoal-50 px-4 transition focus-within:border-primary-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-100">
                  <Mail size={18} className="shrink-0 text-charcoal-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearMessage();
                    }}
                    maxLength={MAX_EMAIL_LENGTH}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                  />
                </div>
              </label>

              <fieldset>
                <legend className="text-sm font-bold text-charcoal-800">
                  Verification code
                </legend>
                <div
                  className="mt-2 grid grid-cols-6 gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      value={digit}
                      onChange={(event) =>
                        updateDigit(index, event.target.value)
                      }
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      maxLength={1}
                      aria-label={`Verification digit ${index + 1}`}
                      className="aspect-square min-w-0 w-full rounded-xl border border-charcoal-300 bg-charcoal-50 text-center text-xl font-bold text-charcoal-950 outline-none transition focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100 sm:text-2xl"
                    />
                  ))}
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-charcoal-500">
                  <Clock3 size={13} />
                  You can paste the complete code into any box.
                </p>
              </fieldset>

              <button
                type="submit"
                disabled={busy || !codeComplete || !email.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-charcoal-300"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
                {loading ? "Verifying email..." : "Verify and continue"}
              </button>
            </form>

            <div className="mx-auto mt-7 flex max-w-lg flex-col items-center gap-2 border-t border-charcoal-200 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm text-charcoal-500">
                Didn’t receive the email?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={busy || cooldown > 0}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition hover:text-primary-900 disabled:cursor-not-allowed disabled:text-charcoal-400"
              >
                {resending ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {resending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Send a new code"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-charcoal-600 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-charcoal-200 bg-white px-4 py-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary-700" />
            <p>
              <span className="font-bold text-charcoal-800">Keep it private.</span>{" "}
              Needful will never ask you to share this code.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-charcoal-200 bg-white px-4 py-4">
            <Mail size={18} className="mt-0.5 shrink-0 text-primary-700" />
            <p>
              <span className="font-bold text-charcoal-800">Email delayed?</span>{" "}
              Check your spam folder or request a new code.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VerifyEmail;
