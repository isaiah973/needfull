import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      return setError("Email and password are required.");
    }

    const result = await login(formData);

    if (!result.success) {
      return setError(result.message);
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div
        className="
                w-full
                max-w-md
                bg-white
                rounded-3xl
                shadow-xl
                border
                border-gray-100
                p-8
            "
      >
        <div className="text-center mb-8">
          <h1
            className="
                        text-4xl
                        font-extrabold
                        text-teal-700
                    "
          >
            Needful
          </h1>

          <p className="text-gray-500 mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}

          <div>
            <label
              className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-2
                        "
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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

          {/* Password */}

          <div>
            <label
              className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-2
                        "
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                                    w-full
                                    px-4
                                    py-3
                                    pr-12
                                    rounded-xl
                                    border
                                    border-gray-300
                                    outline-none
                                    focus:ring-2
                                    focus:ring-teal-600
                                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-500
                                "
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="
                            bg-red-100
                            text-red-700
                            p-3
                            rounded-lg
                            text-sm
                        "
            >
              {error}
            </div>
          )}

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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div
          className="
                    text-center
                    mt-6
                    text-gray-600
                    text-sm
                "
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="
                            text-amber-500
                            font-semibold
                            hover:underline
                        "
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
