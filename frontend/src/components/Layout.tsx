import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, LayoutDashboard, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="loading-state">جاري التحقق...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="layout-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="logo mobile-logo">
          <BookOpen className="logo-icon" size={20} />
          <span>محراب و كتاب</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`} 
        onClick={closeMenu}
      ></div>

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="logo desktop-logo">
          <BookOpen className="logo-icon" />
          <span>محراب و كتاب</span>
        </div>
        
        <nav className="nav-menu">
          <Link to="/dashboard" onClick={closeMenu} className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard className="nav-icon" />
            لوحة التحكم
          </Link>
          <Link to="/books" onClick={closeMenu} className={`nav-item ${location.pathname === '/books' ? 'active' : ''}`}>
            <BookOpen className="nav-icon" />
            الكتب والمقررات
          </Link>
          {user.role === 'admin' && (
            <Link to="/users" onClick={closeMenu} className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
              <Users className="nav-icon" />
              إدارة المستخدمين
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="details">
              <span className="name">{user.name}</span>
              <span className="role">{user.role === 'admin' ? 'شيخ / مدير' : 'طالب'}</span>
            </div>
          </div>
          <div className="footer-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="theme-toggle-btn" onClick={toggleTheme} title="تبديل المظهر">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="logout-btn" onClick={logout} title="تسجيل الخروج">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
