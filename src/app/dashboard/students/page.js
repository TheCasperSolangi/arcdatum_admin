"use client"
import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import Cookies from 'js-cookie';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student => 
        student.name?.toLowerCase().includes(query) || 
        student.email?.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const authToken = Cookies.get('token');
      
      if (!authToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.arcdatum.com/api/users/students', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (student) => {
    setDeleteModal({ open: true, student });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, student: null });
  };

  const handleDelete = async () => {
    const studentId = deleteModal.student?._id;
    if (!studentId) return;

    try {
      setDeletingId(studentId);
      const authToken = Cookies.get('authToken');

      const response = await fetch(`https://api.arcdatum.com/api/users/delete/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      setStudents(prev => prev.filter(s => s._id !== studentId));
      setFilteredStudents(prev => prev.filter(s => s._id !== studentId));
      closeDeleteModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const studentsToExport = filteredStudents;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student List</title>
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
          </style>
        </head>
        <body>
          <h1>Student Management</h1>
          <p class="subtitle">Complete list of registered students</p>
          <p><strong>Total Students:</strong> ${studentsToExport.length}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              ${studentsToExport.map(student => `
                <tr>
                  <td>${student.name || 'N/A'}</td>
                  <td>${student.email || 'N/A'}</td>
                  <td>${student.phone || 'N/A'}</td>
                  <td>${student.address || 'N/A'}</td>
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
            <h1 className="text-2xl font-semibold tracking-tight">Students Management</h1>
            <p className="text-zinc-500 text-xs">
              Manage your registered students
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
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
            />
          </div>
          <button
            onClick={exportToPDF}
            disabled={filteredStudents.length === 0}
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
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Location</th>
                    <th className="text-right py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-zinc-600 text-xs">
                        {searchQuery ? 'No students found matching your search.' : 'No students found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr 
                        key={student._id} 
                        className={`${index !== filteredStudents.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-zinc-900/30 transition-colors duration-150`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium overflow-hidden flex-shrink-0">
                              {student.profile_picture ? (
                                <img src={student.profile_picture} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span>{student.name?.charAt(0) || '?'}</span>
                              )}
                            </div>
                            <span className="font-medium text-xs">{student.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-xs">{student.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-zinc-400 text-xs">{student.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-zinc-400 text-xs">{student.address || 'N/A'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openDeleteModal(student)}
                            disabled={deletingId === student._id}
                            className="inline-flex items-center justify-center h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete student"
                          >
                            {deletingId === student._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            {filteredStudents.length > 0 && (
              <div className="mt-3 text-[11px] text-zinc-600">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeDeleteModal}
          />
          
          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Delete Student</h2>
              <button
                onClick={closeDeleteModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-zinc-300 text-sm mb-3">
                Are you sure you want to delete <span className="text-white font-medium">{deleteModal.student?.name}</span>? 
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                This action cannot be undone. This will permanently delete the student account and all associated data.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="h-8 px-3 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 active:bg-red-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;