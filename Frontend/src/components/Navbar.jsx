import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

import { Bell, Moon, Menu, X, Search, User, Plus } from "lucide-react";

import { categories } from "../data/categories";
const Navbar = () => {
  const profileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-2xl bg-primary-700 flex items-center justify-center text-white font-bold text-lg">
            N
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Needful</h1>
        </div>

        {/* Search */}
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-3 w-[380px]">
          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search items..."
            className="bg-transparent ml-3 w-full outline-none text-sm"
          />
        </div>

        {/* Desktop Links */}

        <div className="hidden md:flex items-center gap-3">
          <button className="px-5 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition">
            Home
          </button>

          <div className="relative" ref={categoryRef}>
            <button onClick={() => setCategoryOpen((prev) => !prev)}>
              Categories
            </button>

            {categoryOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] max-w-[90vw] rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 z-50">
                <div className="grid grid-cols-3 gap-3 ">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        navigate(`/?category=${encodeURIComponent(category)}`);
                        setCategoryOpen(false);
                      }}
                      className="text-left rounded-lg px-3 py-2 hover:bg-primary-50 hover:text-primary-700 transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigate("/");
                    setCategoryOpen(false);
                  }}
                  className="w-full border-t px-4 py-3 text-center font-medium text-primary-700 hover:bg-primary-50"
                >
                  View All Categories
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              navigate(isAuthenticated ? "/create-item" : "/login")
            }
            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-5 py-3 rounded-full transition"
          >
            <Plus size={18} />
            Post Item
          </button>

          <button className="h-11 w-11 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <Bell size={20} />
          </button>

          <button className="h-11 w-11 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <Moon size={20} />
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <User size={20} />
            </button>
          )}
        </div>
        {/* Mobile */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden h-11 w-11 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="p-5 space-y-4">
            <button className="block w-full text-left">Home</button>

            <button className="block w-full text-left">Categories</button>

            <button className="block w-full text-left">Post Item</button>

            <button className="block w-full text-left">Notifications</button>

            <button
              onClick={() => navigate(isAuthenticated ? "/profile" : "/login")}
              className="block w-full text-left"
            >
              {isAuthenticated ? "Profile" : "Login"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
