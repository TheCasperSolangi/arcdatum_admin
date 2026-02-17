"use client"
import React, { useState, useEffect } from 'react';
import { Search, Download, Loader2, AlertCircle, X, Mail, Phone, Calendar, MessageSquare, Check } from 'lucide-react';
import Cookies from 'js-cookie';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, lead: null });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, lead: null });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(lead => 
        lead.full_name?.toLowerCase().includes(query) || 
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.status?.toLowerCase().includes(query) ||
        lead.additional_message?.toLowerCase().includes(query)
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const authToken = Cookies.get('token');
      
      if (!authToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.arcdatum.com/api/leads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const data = await response.json();
      setLeads(data.data || data);
      setFilteredLeads(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (lead) => {
    setViewModal({ open: true, lead });
  };

  const closeViewModal = () => {
    setViewModal({ open: false, lead: null });
  };

  const openStatusModal = (lead) => {
    setStatusModal({ open: true, lead });
  };

  const closeStatusModal = () => {
    setStatusModal({ open: false, lead: null });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-900/30 text-blue-400 border-blue-800/50',
      'follow-up': 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
      'complete': 'bg-green-900/30 text-green-400 border-green-800/50'
    };
    return colors[status] || 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'new': 'New',
      'follow-up': 'Follow-up',
      'complete': 'Complete'
    };
    return labels[status] || status;
  };

  const statusOptions = [
    { value: 'new', label: 'New', description: 'Lead has just been received' },
    { value: 'follow-up', label: 'Follow-up', description: 'Lead requires follow-up action' },
    { value: 'complete', label: 'Complete', description: 'Lead has been fully processed' }
  ];

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setUpdatingStatus(leadId);
      closeStatusModal();
      const authToken = Cookies.get('token');

      const response = await fetch(`https://api.arcdatum.com/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      const data = await response.json();
      
      // Update both leads arrays
      setLeads(prev => prev.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));
      setFilteredLeads(prev => prev.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));

      // Update view modal if it's open
      if (viewModal.open && viewModal.lead?._id === leadId) {
        setViewModal(prev => ({
          ...prev,
          lead: { ...prev.lead, status: newStatus }
        }));
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const leadsToExport = filteredLeads;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leads List</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              color: #000;
            }
            h1 { 
              color: #1f2937; 
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              margin-bottom: 30px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 12px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .message-cell {
              max-width: 300px;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h1>Lead Management</h1>
          <p class="subtitle">Complete list of leads</p>
          <p><strong>Total Leads:</strong> ${leadsToExport.length}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Additional Message</th>
              </tr>
            </thead>
            <tbody>
              ${leadsToExport.map(lead => `
                <tr>
                  <td>${lead.full_name || 'N/A'}</td>
                  <td>${lead.email || 'N/A'}</td>
                  <td class="message-cell">${lead.additional_message || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800/80">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">Lead Management</h1>
            <p className="text-zinc-500 text-xs">
              View and manage your business leads
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-5 py-5">
        {/* Search and Export Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
            />
          </div>
          <button
            onClick={exportToPDF}
            disabled={filteredLeads.length === 0}
            className="h-9 px-4 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
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
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Name</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Email</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Phone</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Status</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Date</th>
                    <th className="text-right py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-600 text-xs">
                        {searchQuery ? 'No leads found matching your search.' : 'No leads found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead, index) => (
                      <tr 
                        key={lead._id} 
                        className={`${index !== filteredLeads.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-zinc-900/30 transition-colors duration-150`}
                      >
                        <td className="py-3 px-4">
                          <span className="text-white text-xs font-medium">{lead.full_name || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-zinc-500" />
                            <span className="text-zinc-400 text-xs">{lead.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-zinc-500" />
                            <span className="text-zinc-400 text-xs">{lead.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openStatusModal(lead)}
                            disabled={updatingStatus === lead._id}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all duration-150 border ${getStatusColor(lead.status)} ${updatingStatus === lead._id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                          >
                            {updatingStatus === lead._id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <span>{getStatusLabel(lead.status)}</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-zinc-500" />
                            <span className="text-zinc-400 text-xs">{formatDate(lead.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openViewModal(lead)}
                            className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-all duration-150"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            {filteredLeads.length > 0 && (
              <div className="mt-3 text-[11px] text-zinc-600">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
            )}
          </>
        )}
      </div>

      {/* View Lead Details Modal */}
      {viewModal.open && viewModal.lead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeViewModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 scale-100 opacity-100 transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-base font-semibold">Lead Details</h2>
              <button
                onClick={closeViewModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                      <div className="text-sm text-white">{viewModal.lead.full_name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
                      <button
                        onClick={() => openStatusModal(viewModal.lead)}
                        disabled={updatingStatus === viewModal.lead._id}
                        className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md font-medium transition-all duration-150 border ${getStatusColor(viewModal.lead.status)} ${updatingStatus === viewModal.lead._id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                      >
                        {updatingStatus === viewModal.lead._id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>{getStatusLabel(viewModal.lead.status)}</span>
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                      <div className="text-sm text-white">{viewModal.lead.email || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phone</label>
                      <div className="text-sm text-white">{viewModal.lead.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Created At</label>
                      <div className="text-sm text-white">{formatDate(viewModal.lead.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Questions & Answers */}
                {viewModal.lead.questions && viewModal.lead.questions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Questions & Answers</h3>
                    <div className="space-y-3">
                      {viewModal.lead.questions.map((qa, index) => (
                        <div key={qa._id || index} className="bg-zinc-950 border border-zinc-800 rounded-md p-3">
                          <div className="text-xs font-medium text-zinc-400 mb-1.5">{qa.question}</div>
                          <div className="text-sm text-white">{qa.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Message */}
                {viewModal.lead.additional_message && (
                  <div>
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Additional Message</h3>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-white leading-relaxed">{viewModal.lead.additional_message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
              <button
                onClick={closeViewModal}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal.open && statusModal.lead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeStatusModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Change Lead Status</h2>
              <button
                onClick={closeStatusModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-zinc-400 text-xs mb-4">
                Select a new status for <span className="text-white font-medium">{statusModal.lead.full_name}</span>
              </p>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(statusModal.lead._id, option.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                      statusModal.lead.status === option.value
                        ? 'bg-zinc-800 border-zinc-700'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium px-2.5 py-0.5 rounded-md ${getStatusColor(option.value)}`}>
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{option.description}</p>
                      </div>
                      {statusModal.lead.status === option.value && (
                        <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={closeStatusModal}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;