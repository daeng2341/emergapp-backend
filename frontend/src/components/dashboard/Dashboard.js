import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emergenciesRes, newsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/emergencies'),
          axios.get('http://localhost:5000/api/news')
        ]);
        setEmergencies(emergenciesRes.data);
        setNews(newsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {user?.name}!
        </h2>
        <p className="text-gray-600">
          {user?.role === 'authority'
            ? 'As an authority, you can manage emergencies and post news updates.'
            : 'As a citizen, you can report emergencies and stay informed about local news.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Emergencies */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Active Emergencies</h3>
            <Link
              to="/emergency"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Report Emergency
            </Link>
          </div>
          {emergencies.length > 0 ? (
            <div className="space-y-4">
              {emergencies.map((emergency) => (
                <div
                  key={emergency._id}
                  className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                >
                  <h4 className="font-semibold text-red-700">{emergency.type}</h4>
                  <p className="text-gray-600">{emergency.location}</p>
                  <p className="text-sm text-gray-500">
                    Reported by: {emergency.reportedBy?.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active emergencies</p>
          )}
        </div>

        {/* Latest News */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Latest News</h3>
            {user?.role === 'authority' && (
              <Link
                to="/news"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Post News
              </Link>
            )}
          </div>
          {news.length > 0 ? (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item._id} className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-gray-600">{item.content}</p>
                  <p className="text-sm text-gray-500">
                    Posted by: {item.author?.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No news updates</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/emergency"
            className="bg-red-500 text-white p-4 rounded-lg text-center hover:bg-red-600"
          >
            Report Emergency
          </Link>
          <Link
            to="/news"
            className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600"
          >
            View News
          </Link>
          <Link
            to="/profile"
            className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 