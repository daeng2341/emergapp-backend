import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

const Responders = () => {
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    status: 'available'
  });
  const [showForm, setShowForm] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchResponders();
  }, []);

  const fetchResponders = async () => {
    try {
      const res = await axios.get('/api/responders');
      setResponders(res.data);
    } catch (err) {
      toast.error('Failed to load responders');
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/responders', {
        ...formData,
        department: currentUser.department
      });
      toast.success('Responder added successfully');
      setShowForm(false);
      setFormData({ name: '', position: '', contact: '', status: 'available' });
      fetchResponders();
    } catch (err) {
      toast.error('Failed to add responder');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/responders/${id}/status`, { status });
      setResponders(prev =>
        prev.map(responder =>
          responder.id === id
            ? { ...responder, status, updatedAt: new Date().toISOString() }
            : responder
        )
      );
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteResponder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this responder?')) return;
    
    try {
      await axios.delete(`/api/responders/${id}`);
      toast.success('Responder deleted successfully');
      fetchResponders();
    } catch (err) {
      toast.error('Failed to delete responder');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Responders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
        >
          {showForm ? 'Cancel' : 'Add Responder'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position/Rank
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="on_duty">On Duty</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Add Responder
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {responders.map(responder => (
            <li key={responder.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {responder.name}
                    </p>
                    <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {responder.position}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {responder.contact}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Department: {responder.department}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      responder.status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : responder.status === 'on_duty'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {responder.status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <select
                    value={responder.status}
                    onChange={(e) => updateStatus(responder.id, e.target.value)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="on_duty">On Duty</option>
                  </select>
                  <button
                    onClick={() => deleteResponder(responder.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Responders; 