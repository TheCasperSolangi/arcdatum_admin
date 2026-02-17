"use client"
import React, { useState, useEffect } from 'react';
import { Search, Download, Loader2, AlertCircle, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Cookies from 'js-cookie';

const TransactionsManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    channel: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const authToken = Cookies.get('token');
      
      if (!authToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.channel && { channel: filters.channel }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`https://api.arcdatum.com/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      channel: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.type || filters.channel || filters.status;

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      transaction.transaction_code?.toLowerCase().includes(query) ||
      transaction.title?.toLowerCase().includes(query) ||
      transaction.description?.toLowerCase().includes(query) ||
      transaction.payment_method?.toLowerCase().includes(query)
    );
  });

  const exportToPDF = async () => {
    try {
      const authToken = Cookies.get('token');
      
      // Fetch ALL transactions with current filters (no pagination limit)
      const params = new URLSearchParams({
        ...(filters.type && { type: filters.type }),
        ...(filters.channel && { channel: filters.channel }),
        ...(filters.status && { status: filters.status }),
        page: '1',
      });

      // Fetch all pages
      let allTransactions = [];
      let currentExportPage = 1;
      let hasMore = true;

      while (hasMore) {
        params.set('page', currentExportPage.toString());
        const response = await fetch(`https://api.arcdatum.com/api/transactions?${params}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) break;

        const data = await response.json();
        allTransactions = [...allTransactions, ...(data.transactions || [])];
        
        hasMore = currentExportPage < data.pages;
        currentExportPage++;
      }

      // Apply search filter
      const transactionsToExport = allTransactions.filter(transaction => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          transaction.transaction_code?.toLowerCase().includes(query) ||
          transaction.title?.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query)
        );
      });

      generatePDF(transactionsToExport);
    } catch (err) {
      alert(`Error exporting: ${err.message}`);
    }
  };

  const generatePDF = (transactionsToExport) => {
    const printWindow = window.open('', '_blank');

    const filterInfo = [];
    if (filters.type) filterInfo.push(`Type: ${filters.type}`);
    if (filters.channel) filterInfo.push(`Channel: ${filters.channel}`);
    if (filters.status) filterInfo.push(`Status: ${filters.status}`);
    if (searchQuery) filterInfo.push(`Search: "${searchQuery}"`);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transactions List</title>
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
              margin-bottom: 20px;
            }
            .filters {
              background: #f3f4f6;
              padding: 12px;
              border-radius: 6px;
              margin-bottom: 20px;
              font-size: 12px;
              color: #374151;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 10px; 
              text-align: left;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .type-income { color: #10b981; font-weight: 600; }
            .type-expense { color: #ef4444; font-weight: 600; }
            .status-completed { color: #10b981; font-weight: 600; }
            .status-pending { color: #f59e0b; font-weight: 600; }
            .status-failed { color: #ef4444; font-weight: 600; }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .code {
              font-family: 'Courier New', monospace;
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <h1>Transactions Management</h1>
          <p class="subtitle">Complete list of transactions</p>
          ${filterInfo.length > 0 ? `<div class="filters"><strong>Active Filters:</strong> ${filterInfo.join(' • ')}</div>` : ''}
          <p><strong>Total Transactions:</strong> ${transactionsToExport.length}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Description</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsToExport.map(transaction => `
                <tr>
                  <td><span class="code">${transaction.transaction_code || 'N/A'}</span></td>
                  <td>${transaction.title || 'N/A'}</td>
                  <td>${transaction.description || 'N/A'}</td>
                  <td class="type-${transaction.type?.toLowerCase()}">${transaction.type || 'N/A'}</td>
                  <td>${transaction.channel || 'N/A'}</td>
                  <td>${transaction.payment_method || 'N/A'}</td>
                  <td class="status-${transaction.status?.toLowerCase()}">${transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'N/A'}</td>
                  <td>${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}</td>
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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800/80">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">Transactions Management</h1>
            <p className="text-zinc-500 text-xs">
              View and manage all transactions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-5 py-5">
        {/* Search, Filter and Export Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-4 text-sm font-medium rounded-md border transition-colors duration-150 inline-flex items-center gap-2 ${
              hasActiveFilters 
                ? 'bg-white text-black border-white hover:bg-zinc-100' 
                : 'border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded">
                {[filters.type, filters.channel, filters.status].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredTransactions.length === 0}
            className="h-9 px-4 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-5 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Filter Transactions</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Channel</label>
                <select
                  value={filters.channel}
                  onChange={(e) => handleFilterChange('channel', e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                >
                  <option value="">All Channels</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="REFUND">Refund</option>
                  <option value="SETTLEMENT">Settlement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>
        )}

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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Code</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Title</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Description</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Type</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Channel</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Payment</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Status</th>
                      <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-zinc-600 text-xs">
                          {searchQuery ? 'No transactions found matching your search.' : 'No transactions found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <tr 
                          key={transaction._id} 
                          className={`${index !== filteredTransactions.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-zinc-900/30 transition-colors duration-150`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded">
                              {transaction.transaction_code || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white text-xs">{transaction.title || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-xs max-w-xs truncate">
                            {transaction.description || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transaction.type === 'INCOME' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {transaction.type || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300 text-xs">
                            {transaction.channel || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-zinc-300 text-xs">
                            {transaction.payment_method || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === 'COMPLETED' 
                                ? 'bg-green-900/30 text-green-400' 
                                : transaction.status === 'PENDING'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-xs whitespace-nowrap">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <div className="text-[11px] text-zinc-600">
                  Page {currentPage} of {totalPages} • {totalCount} total transactions
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-zinc-800 hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors duration-150 ${
                          currentPage === pageNum
                            ? 'bg-white text-black'
                            : 'border border-zinc-800 hover:bg-zinc-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-zinc-800 hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Results Count (when no pagination) */}
            {totalPages === 1 && filteredTransactions.length > 0 && (
              <div className="mt-3 text-[11px] text-zinc-600">
                Showing {filteredTransactions.length} of {totalCount} transactions
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsManagement;