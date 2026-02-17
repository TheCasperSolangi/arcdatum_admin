"use client"
import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, X, Calendar, Video, Clock } from 'lucide-react';
import Cookies from 'js-cookie';

const SessionsManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, session: null });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSessions(sessions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = sessions.filter(session => 
        session.session_code?.toLowerCase().includes(query) || 
        session.email?.toLowerCase().includes(query) ||
        session.slot_code?.toLowerCase().includes(query) ||
        session.status?.toLowerCase().includes(query)
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, sessions]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const authToken = Cookies.get('token');
      
      if (!authToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.arcdatum.com/api/sessions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      setSessions(data.data || data);
      setFilteredSessions(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (selectedDate = null) => {
    try {
      const authToken = Cookies.get('token');
      
      // If no date provided, use current session's date or today's date
      let dateParam = '';
      if (selectedDate) {
        dateParam = selectedDate;
      } else if (rescheduleModal.session?.date) {
        dateParam = rescheduleModal.session.date;
      } else {
        const today = new Date();
        dateParam = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      }
      
      const response = await fetch(`https://api.arcdatum.com/api/slots/available?date=${encodeURIComponent(dateParam)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      
      // Handle different response structures
      let slots = [];
      if (data.data && data.data.slots) {
        // Structure: { success: true, data: { slots: [...] } }
        slots = data.data.slots;
      } else if (data.slots) {
        // Structure: { success: true, slots: [...] }
        slots = data.slots;
      } else if (Array.isArray(data.data)) {
        // Structure: { success: true, data: [...] }
        slots = data.data;
      } else if (Array.isArray(data)) {
        // Structure: [...]
        slots = data;
      }
      
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    }
  };

  const openRescheduleModal = async (session) => {
    setRescheduleModal({ open: true, session });
    setSelectedSlot('');
    await fetchAvailableSlots();
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ open: false, session: null });
    setSelectedSlot('');
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      alert('Please select a new slot');
      return;
    }

    try {
      setRescheduling(true);
      const authToken = Cookies.get('token');
      const sessionCode = rescheduleModal.session?.session_code;

      const response = await fetch(`https://api.arcdatum.com/api/sessions/${sessionCode}/reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_slot_code: selectedSlot })
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule session');
      }

      const data = await response.json();
      setSessions(prev => prev.map(s => 
        s.session_code === sessionCode ? data.data : s
      ));
      setFilteredSessions(prev => prev.map(s => 
        s.session_code === sessionCode ? data.data : s
      ));
      closeRescheduleModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setRescheduling(false);
    }
  };

  const handleJoinMeeting = (joinLink) => {
    if (joinLink) {
      window.open(joinLink, '_blank');
    } else {
      alert('Meeting link not available');
    }
  };

  const getNextSession = () => {
    const now = new Date();
    const upcomingSessions = sessions.filter(session => {
      if (session.status !== 'scheduled') return false;
      
      try {
        const sessionDateTime = new Date(`${session.date}T${session.time.split('-')[0]}`);
        return sessionDateTime > now;
      } catch {
        return false;
      }
    });

    if (upcomingSessions.length === 0) return null;

    return upcomingSessions.reduce((nearest, current) => {
      const nearestTime = new Date(`${nearest.date}T${nearest.time.split('-')[0]}`);
      const currentTime = new Date(`${current.date}T${current.time.split('-')[0]}`);
      return currentTime < nearestTime ? current : nearest;
    });
  };

  const isStartingSoon = (session) => {
    const nextSession = getNextSession();
    return nextSession && nextSession.session_code === session.session_code;
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-900/30 text-blue-400',
      'on-going': 'bg-green-900/30 text-green-400',
      'cancelled': 'bg-red-900/30 text-red-400',
      'completed': 'bg-zinc-700/30 text-zinc-400',
      'rescheduled': 'bg-purple-900/30 text-purple-400'
    };
    return colors[status] || 'bg-zinc-700/30 text-zinc-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800/80">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">Sessions Management</h1>
            <p className="text-zinc-500 text-xs">
              Manage and join your scheduled sessions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-5 py-5">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 px-3 py-2.5 bg-red-950/50 border border-red-900/50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="border border-zinc-800/60 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Session Code</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Email</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Date & Time</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Runtime</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Status</th>
                    <th className="text-right py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-600 text-xs">
                        {searchQuery ? 'No sessions found matching your search.' : 'No sessions found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session, index) => (
                      <tr 
                        key={session._id} 
                        className={`${index !== filteredSessions.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-zinc-900/30 transition-colors duration-150`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-xs bg-zinc-800/50 px-2 py-1 rounded">
                            {session.session_code || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white text-xs">{session.email || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white text-xs">{formatDate(session.date)}</span>
                            <span className="text-zinc-400 text-[11px]">{session.time || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-zinc-400 text-xs">{session.runtime} min</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                              {session.status ? session.status.charAt(0).toUpperCase() + session.status.slice(1) : 'N/A'}
                            </span>
                            {isStartingSoon(session) && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Starting Soon
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleJoinMeeting(session.joining_link)}
                              disabled={session.status === 'cancelled' || session.status === 'completed'}
                              className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium text-zinc-300 hover:text-green-400 hover:bg-green-950/30 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-zinc-300 disabled:hover:bg-transparent"
                              title="Join meeting"
                            >
                              <Video className="h-3.5 w-3.5 mr-1" />
                              Join
                            </button>
                            <button
                              onClick={() => openRescheduleModal(session)}
                              disabled={session.status === 'cancelled' || session.status === 'completed'}
                              className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium text-zinc-300 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-zinc-300 disabled:hover:bg-transparent"
                              title="Reschedule session"
                            >
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Reschedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            {filteredSessions.length > 0 && (
              <div className="mt-3 text-[11px] text-zinc-600">
                Showing {filteredSessions.length} of {sessions.length} sessions
              </div>
            )}
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeRescheduleModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Reschedule Session</h2>
              <button
                onClick={closeRescheduleModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Current Session</label>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                    <div className="text-xs text-white mb-1">{rescheduleModal.session?.session_code}</div>
                    <div className="text-[11px] text-zinc-400">
                      {formatDate(rescheduleModal.session?.date)} • {rescheduleModal.session?.time}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Select New Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                  >
                    <option value="">Choose a slot...</option>
                    {availableSlots.map((slot) => (
                      <option key={slot._id} value={slot.slot_code}>
                        {slot.slot_code} - {formatDate(slot.date)} • {slot.time} ({slot.runtime} min)
                      </option>
                    ))}
                  </select>
                  {availableSlots.length === 0 && (
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      No available slots found
                    </p>
                  )}
                </div>

                <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-md">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Rescheduling will update the Google Calendar event and notify all participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={closeRescheduleModal}
                disabled={rescheduling}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedSlot || rescheduling}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManagement;