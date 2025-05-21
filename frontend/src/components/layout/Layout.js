import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { useThemeLang } from '../../context/ThemeLangContext';
import { t } from '../../utils/i18n';

const Layout = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, toggleTheme, lang, toggleLang } = useThemeLang();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Responders', href: '/responders' },
    { name: 'News & Advisories', href: '/news' },
    { name: 'Emergency Alerts', href: '/alerts' },
    { name: 'Reports', href: '/reports' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <header className={`w-full shadow-md py-4 px-6 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-red-600">EMERGENCY</span>
          <span className="text-lg font-semibold text-orange-500">SYSTEM</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 rounded focus:outline-none border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-yellow-300' : 'bg-gray-200 border-gray-300 text-gray-700'} transition`}
            title={t('theme', lang)}
          >
            {theme === 'dark' ? t('light', lang) : t('dark', lang)}
          </button>
          <button
            onClick={toggleLang}
            className={`px-3 py-1 rounded focus:outline-none border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-blue-300' : 'bg-gray-200 border-gray-300 text-blue-700'} transition`}
            title={t('language', lang)}
          >
            {lang === 'en' ? t('filipino', lang) : t('english', lang)}
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm rounded-lg p-4 mr-6">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout; 