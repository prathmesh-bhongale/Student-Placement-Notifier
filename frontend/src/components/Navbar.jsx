import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = {
  student: [
    ['/student/dashboard', 'Dashboard'],
    ['/student/profile', 'Profile'],
  ],
  admin: [
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/drives', 'Drives'],
    ['/admin/students', 'Students'],
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const role = user?.role;
    logout();
    navigate(role === 'admin' ? '/admin/login' : '/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-indigo-700">
          <GraduationCap className="h-6 w-6" /> Placement Notifier
        </Link>
        {user ? (
          <nav className="flex items-center gap-1 sm:gap-3">
            {links[user.role].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <span className="hidden text-sm text-slate-500 md:inline">{user.name}</span>
            <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link to="/student/login" className="btn-secondary">Login</Link>
            <Link to="/student/register" className="btn-primary">Register</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
