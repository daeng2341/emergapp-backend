import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [emergencyTypes, setEmergencyTypes] = useState([
    { id: 'fire', name: 'Fire Emergency', icon: '🔥' },
    { id: 'medical', name: 'Medical Emergency', icon: '🚑' },
    { id: 'crime', name: 'Crime Report', icon: '👮' },
    { id: 'disaster', name: 'Natural Disaster', icon: '🌪️' },
    { id: 'other', name: 'Other Emergency', icon: '⚠️' },
  ]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/news');
      setNews(response.data);
    } catch (err) {
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyReport = async (type) => {
    try {
      const response = await axios.post('/api/emergencies', {
        type,
        location: user.location,
        reporter: user._id,
      });
      // Show success message or handle response
    } catch (err) {
      setError('Failed to submit emergency report');
    }
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Report Emergency</h2>
        <div className="grid grid-cols-2 gap-4">
          {emergencyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleEmergencyReport(type.id)}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-3xl mb-2">{type.icon}</span>
              <span className="text-sm text-center">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Latest News & Advisories</h2>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item._id} className="border-b pb-4 last:border-b-0">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl text-gray-500">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p className="mt-1">{user.location}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
          <p className="mt-1">{user.contactNumber}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {activeTab === 'home' ? renderHome() : renderProfile()}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-md mx-auto px-4">
            <div className="flex justify-around py-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center ${
                  activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-xl">🏠</span>
                <span className="text-xs mt-1">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center ${
                  activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="text-xs mt-1">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard; 