import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const EmergencyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const emergencyTypes = {
    crime: 'Crime',
    traffic: 'Traffic Accident',
    disaster: 'Disaster',
    health: 'Health Emergency',
    fire: 'Fire Incident'
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    fetchAlerts();

    // Listen for new alerts
    if (socket) {
      socket.on('emergencyAlert', (alert) => {
        setAlerts(prev => [alert, ...prev]);
      });

      socket.on('emergencyCancelled', (data) => {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === data.id 
              ? { ...alert, status: 'CANCELLED', updatedAt: data.cancelledAt }
              : alert
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('emergencyAlert');
        socket.off('emergencyCancelled');
      }
    };
  }, [socket]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/emergencies');
      setAlerts(res.data);
    } catch (err) {
      toast.error('Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/emergencies/${id}/status`, { status });
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === id
            ? { ...alert, status, updatedAt: new Date().toISOString() }
            : alert
        )
      );
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const viewLocation = (alert) => {
    setSelectedAlert(alert);
    // Here you would typically open a map modal or navigate to a map view
    // For now, we'll just show the coordinates
    toast.info(`Location: ${alert.location.latitude}, ${alert.location.longitude}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Alerts</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {alerts.map(alert => (
            <li key={alert.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-red-600 truncate">
                      {emergencyTypes[alert.type]}
                    </p>
                    <p className={`ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[alert.status]
                    }`}>
                      {alert.status}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Reported by: {alert.reporter.name}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Contact: {alert.reporter.contact}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Location: {alert.location.address}
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => viewLocation(alert)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    View Location
                  </button>
                  {alert.status === 'PENDING' && (
                    <button
                      onClick={() => updateStatus(alert.id, 'PROCESSING')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start Processing
                    </button>
                  )}
                  {alert.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateStatus(alert.id, 'COMPLETED')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {(alert.status === 'PENDING' || alert.status === 'PROCESSING') && (
                    <button
                      onClick={() => updateStatus(alert.id, 'CANCELLED')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Map Modal would go here */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Emergency Location
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedAlert.location.address}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Coordinates: {selectedAlert.location.latitude}, {selectedAlert.location.longitude}
            </p>
            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts; 