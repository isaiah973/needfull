import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Heart, ShoppingCart, User } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // temporary (connect later)
  const cartCount = 2;
  const wishlistCount = 1;
  const isLoggedIn = false;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Product", path: "/product" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-red-400 text-2xl font-bold tracking-wide">
          FUL
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Side Icons */}
        <div className="hidden md:flex items-center gap-5">
          {/* Wishlist */}
          <Link to="/wishlist" className="relative">
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <Link to="/profile">
              <User className="w-6 h-6" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 border rounded-md hover:bg-black hover:text-white transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700"
            >
              {link.name}
            </NavLink>
          ))}

          <div className="flex gap-4 pt-3">
            <Link to="/wishlist" className="flex items-center gap-2">
              <Heart className="w-5 h-5" /> Wishlist
            </Link>

            <Link to="/cart" className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Cart
            </Link>
          </div>

          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center gap-2">
              <User className="w-5 h-5" /> Profile
            </Link>
          ) : (
            <Link to="/login" className="block border p-2 rounded text-center">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
