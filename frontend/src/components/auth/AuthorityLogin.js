import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeLang } from '../../context/ThemeLangContext';
import { t } from '../../utils/i18n';

const AuthorityLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, lang } = useThemeLang();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ ...formData, role: 'authority' });
      navigate('/authority/dashboard');
    } catch (err) {
      setError(err.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="mb-6 text-center text-3xl font-extrabold text-orange-600">
          {t('login', lang)} (Authority)
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={t('email', lang)}
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={t('password', lang)}
            value={formData.password}
            onChange={handleChange}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/authority/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                {t('forgotPassword', lang)}
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
          >
            {loading ? t('login', lang) + '...' : t('login', lang)}
          </button>
        </form>
        <div className="text-sm text-center mt-4">
          <Link to="/authority/register" className="font-medium text-blue-600 hover:text-blue-500">
            {t('alreadyHaveAccount', lang)}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin; 