import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { nigerianStates } from "../data/nigerianStates";

const PasswordRequirement = ({ valid, children }) => (
  <p
    className={`flex items-center gap-1.5 text-[11px] font-semibold ${
      valid ? "text-primary-800" : "text-charcoal-400"
    }`}
  >
    <Check size={13} />
    {children}
  </p>
);

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPasswords, setShowPasswords] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    password: "",
    confirmPassword: "",
  });

  const passwordChecks = useMemo(() => {
    const password = formData.password;

    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&.#_-]/.test(password),
    };
  }, [formData.password]);

  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    Boolean(formData.confirmPassword) &&
    formData.password === formData.confirmPassword;

  const updateField = (event) => {
    if (error) setError("");

    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (formData.name.trim().length > MAX_NAME_LENGTH) {
      setError(`Keep your full name within ${MAX_NAME_LENGTH} characters.`);
      return;
    }
    if (!formData.email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (formData.email.trim().length > MAX_EMAIL_LENGTH) {
      setError("Email address is too long.");
      return;
    }
    if (!formData.state) {
      setError("Select the Nigerian state where you live.");
      return;
    }
    if (!passwordValid) {
      setError("Create a password that meets every security requirement.");
      return;
    }
    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      setError("Accept the Terms of Use and Privacy Policy to continue.");
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const result = await register({
      name: formData.name.trim(),
      email,
      phone: formData.phone.trim(),
      state: formData.state,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="auth-page min-h-screen bg-charcoal-50 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-h-screen flex-col">
        <header className="flex h-20 items-center justify-between border-b border-charcoal-200 bg-white px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <span className="grid h-10 w-10 place-items-center bg-primary-700 text-lg font-black text-white">
              N
            </span>
            <span className="text-xl font-extrabold tracking-tight text-charcoal-950">
              Needful
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-charcoal-600 transition hover:text-primary-800"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-xl rounded-3xl border border-charcoal-200 bg-white p-6 sm:p-8">
            <div className="border-l-4 border-primary-600 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                Join the community
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl">
                Create your free account
              </h1>
              <p className="mt-3 text-sm leading-6 text-charcoal-500">
                Start sharing useful items and connecting with people nearby.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-charcoal-800">
                    Full name
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <UserRound
                      size={18}
                      className="shrink-0 text-charcoal-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={updateField}
                      maxLength={MAX_NAME_LENGTH}
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                  </div>
                  <span className="mt-1.5 block text-right text-[11px] text-charcoal-400">
                    {formData.name.length}/{MAX_NAME_LENGTH}
                  </span>
                </label>

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
                      onChange={updateField}
                      maxLength={MAX_EMAIL_LENGTH}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-charcoal-800">
                    State of residence
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <MapPin
                      size={18}
                      className="shrink-0 text-charcoal-400"
                    />
                    <select
                      name="state"
                      value={formData.state}
                      onChange={updateField}
                      required
                      className="min-w-0 flex-1 appearance-none bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none"
                    >
                      <option value="">Select your state</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1.5 text-[11px] text-charcoal-400">
                    Only your state—not your exact address—will appear publicly.
                  </p>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Phone number{" "}
                    <span className="font-medium text-charcoal-400">
                      (optional)
                    </span>
                  </span>
                  <div className="mt-2 flex items-center border border-charcoal-300 bg-white px-4 transition focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100">
                    <Phone size={18} className="shrink-0 text-charcoal-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={updateField}
                      maxLength={MAX_PHONE_LENGTH}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+234..."
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
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
                      type={showPasswords ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={updateField}
                      required
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((current) => !current)}
                      className="grid h-9 w-9 shrink-0 place-items-center text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-800"
                      aria-label={
                        showPasswords ? "Hide passwords" : "Show passwords"
                      }
                    >
                      {showPasswords ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-charcoal-800">
                    Confirm password
                  </span>
                  <div
                    className={`mt-2 flex items-center border bg-white px-4 transition focus-within:ring-4 ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-charcoal-700 focus-within:ring-charcoal-100"
                        : "border-charcoal-300 focus-within:border-primary-600 focus-within:ring-primary-100"
                    }`}
                  >
                    <ShieldCheck
                      size={18}
                      className="shrink-0 text-charcoal-400"
                    />
                    <input
                      type={showPasswords ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={updateField}
                      required
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-charcoal-900 outline-none placeholder:text-charcoal-400"
                    />
                    {passwordsMatch && (
                      <Check size={17} className="shrink-0 text-primary-700" />
                    )}
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-charcoal-200 bg-charcoal-50 p-4 sm:grid-cols-3">
                <PasswordRequirement valid={passwordChecks.length}>
                  8+ characters
                </PasswordRequirement>
                <PasswordRequirement valid={passwordChecks.uppercase}>
                  Uppercase letter
                </PasswordRequirement>
                <PasswordRequirement valid={passwordChecks.lowercase}>
                  Lowercase letter
                </PasswordRequirement>
                <PasswordRequirement valid={passwordChecks.number}>
                  Number
                </PasswordRequirement>
                <PasswordRequirement valid={passwordChecks.special}>
                  Special character
                </PasswordRequirement>
                <PasswordRequirement valid={passwordsMatch}>
                  Passwords match
                </PasswordRequirement>
              </div>

              <label className="flex cursor-pointer items-start gap-3 border-l-2 border-charcoal-300 pl-4 text-xs leading-5 text-charcoal-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    if (error) setError("");
                    setAcceptedTerms(event.target.checked);
                  }}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary-700"
                />
                <span>
                  I agree to Needful’s{" "}
                  <span className="font-bold text-primary-800">
                    Terms of Use
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-primary-800">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 bg-primary-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-charcoal-300"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <UserRound size={18} />
                )}
                {loading ? "Creating account..." : "Create my account"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-charcoal-200" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal-400">
                Already a member?
              </span>
              <span className="h-px flex-1 bg-charcoal-200" />
            </div>

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 border border-charcoal-400 bg-white px-6 py-3.5 text-sm font-bold text-charcoal-900 transition hover:border-primary-600 hover:bg-primary-50 hover:text-primary-900"
            >
              Sign in instead
              <ArrowRight size={17} />
            </Link>

            <p className="mt-8 text-center text-[11px] leading-5 text-charcoal-400">
              We protect your information and never sell your personal data.
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
            Join Needful
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">
            Give useful items a second home.
          </h2>
          <p className="mt-4 text-sm leading-7 text-charcoal-300">
            Create an account to share freely and connect with people nearby.
          </p>
          <div className="mt-8 h-1 w-16 rounded-full bg-primary-500" />
        </div>
        <p className="text-xs text-charcoal-500">
          Free to join. Built for Nigeria.
        </p>
      </aside>
    </main>
  );
};

export default Register;
