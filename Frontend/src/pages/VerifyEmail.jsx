import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { verify, loading } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !code) {
      setError("Email and verification code are required");
      return;
    }

    const result = await verify({
      email,
      code,
    });

    if (result.success) {
      toast.success("Email verified successfully! Welcome to Needful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Needful</h1>

          <p className="text-gray-500 mt-2">Verify your email address</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="
                            w-full
                            px-4
                            py-3
                            rounded-xl
                            border
                            border-gray-300
                            outline-none
                            focus:ring-2
                            focus:ring-teal-600
                            "
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>

            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="
                            w-full
                            px-4
                            py-3
                            text-center
                            tracking-[8px]
                            text-xl
                            rounded-xl
                            border
                            border-gray-300
                            outline-none
                            focus:ring-2
                            focus:ring-teal-600
                            "
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          {/* Success */}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
                        w-full
                        bg-teal-700
                        hover:bg-teal-800
                        text-white
                        py-3
                        rounded-xl
                        font-semibold
                        transition
                        disabled:opacity-50
                        "
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already verified?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-amber-500 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
