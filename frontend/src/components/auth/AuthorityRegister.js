import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeLang } from '../../context/ThemeLangContext';
import { t } from '../../utils/i18n';

const AuthorityRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rank: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, lang } = useThemeLang();

  const departments = [
    { id: 'pnp', name: 'Philippine National Police (PNP)' },
    { id: 'bfp', name: 'Bureau of Fire Protection (BFP)' },
    { id: 'mdrrmo', name: 'Municipal Disaster Risk Reduction and Management Office (MDRRMO)' },
    { id: 'hospital', name: 'Hospital/Ambulance Service' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('confirmPassword', lang) + ' ' + t('password', lang) + ' mismatch');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be 8-16 characters with uppercase, lowercase, and special character');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register({ ...registerData, role: 'authority' });
      navigate('/authority/dashboard');
    } catch (err) {
      setError(err.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="mb-6 text-center text-3xl font-extrabold text-orange-600">
          {t('authorityRegistration', lang)}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <input
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={t('name', lang)}
            value={formData.name}
            onChange={handleChange}
          />
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
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={t('confirmPassword', lang)}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <input
            name="rank"
            type="text"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rank/Position"
            value={formData.rank}
            onChange={handleChange}
          />
          <select
            name="department"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
          >
            {loading ? t('createAccount', lang) + '...' : t('createAccount', lang)}
          </button>
        </form>
        <div className="text-sm text-center mt-4">
          <Link to="/authority/login" className="font-medium text-blue-600 hover:text-blue-500">
            {t('alreadyHaveAccount', lang)}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorityRegister; 