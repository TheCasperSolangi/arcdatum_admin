"use client"
import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Loader2, AlertCircle, X, Plus, Copy, Eye, Clock, Star, BookOpen } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const CoursesManagement = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });
  const [addModal, setAddModal] = useState({ open: false });
  const [editModal, setEditModal] = useState({ open: false, course: null });
  const [viewModal, setViewModal] = useState({ open: false, course: null });
  const [formData, setFormData] = useState({
    course_title: '',
    category_code: '',
    cover_image: '',
    preview_image: '',
    preview_video: '',
    runtime: '',
    short_description: '',
    long_description: '',
    ratings: 0
  });
  const [categories, setCategories] = useState([]);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(course => 
        course.course_title?.toLowerCase().includes(query) || 
        course.courses_code?.toLowerCase().includes(query) ||
        course.short_description?.toLowerCase().includes(query) ||
        course.category_code?.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const authToken = Cookies.get('token');
      
      if (!authToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.arcdatumcode.info/api/courses', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(data.data || data);
      setFilteredCourses(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch('https://api.arcdatumcode.info/api/categories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const openDeleteModal = (course) => {
    setDeleteModal({ open: true, course });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, course: null });
  };

  const openViewModal = (course) => {
    setViewModal({ open: true, course });
  };

  const closeViewModal = () => {
    setViewModal({ open: false, course: null });
  };

  const openAddModal = () => {
    setFormData({
      course_title: '',
      category_code: '',
      cover_image: '',
      preview_image: '',
      preview_video: '',
      runtime: '',
      short_description: '',
      long_description: '',
      ratings: 0
    });
    setAddModal({ open: true });
  };

  const closeAddModal = () => {
    setAddModal({ open: false });
  };

  const openEditModal = (course) => {
    setFormData({
      course_title: course.course_title || '',
      category_code: course.category_code || '',
      cover_image: course.cover_image || '',
      preview_image: course.preview_image || '',
      preview_video: course.preview_video || '',
      runtime: course.runtime || '',
      short_description: course.short_description || '',
      long_description: course.long_description || '',
      ratings: course.ratings || 0
    });
    setEditModal({ open: true, course });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, course: null });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCourse = async () => {
    try {
      const authToken = Cookies.get('token');
      
      const response = await fetch('https://api.arcdatumcode.info/api/courses/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      const data = await response.json();
      setCourses(prev => [...prev, data.data]);
      setFilteredCourses(prev => [...prev, data.data]);
      closeAddModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditCourse = async () => {
    try {
      const authToken = Cookies.get('token');
      const courseId = editModal.course?._id;
      
      if (!courseId) return;

      const response = await fetch(`https://api.arcdatumcode.info/api/courses/update/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const data = await response.json();
      setCourses(prev => prev.map(course => 
        course._id === courseId ? data.data : course
      ));
      setFilteredCourses(prev => prev.map(course => 
        course._id === courseId ? data.data : course
      ));
      closeEditModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    const courseId = deleteModal.course?._id;
    if (!courseId) return;

    try {
      setDeletingId(courseId);
      const authToken = Cookies.get('token');

      const response = await fetch(`https://api.arcdatumcode.info/api/courses/delete/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      setCourses(prev => prev.filter(c => c._id !== courseId));
      setFilteredCourses(prev => prev.filter(c => c._id !== courseId));
      closeDeleteModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const navigateToCourseLessons = (courseId) => {
    router.push(`/courses/${courseId}`);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const coursesToExport = filteredCourses;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Courses List</title>
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
            .course-code {
              font-family: monospace;
              background-color: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.9em;
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
          <h1>Courses Management</h1>
          <p class="subtitle">Complete list of courses</p>
          <p><strong>Total Courses:</strong> ${coursesToExport.length}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Category</th>
                <th>Runtime</th>
                <th>Description</th>
                <th>Ratings</th>
              </tr>
            </thead>
            <tbody>
              ${coursesToExport.map(course => `
                <tr>
                  <td><span class="course-code">${course.courses_code || 'N/A'}</span></td>
                  <td><strong>${course.course_title || 'N/A'}</strong></td>
                  <td>${course.category_code || 'N/A'}</td>
                  <td>${course.readable_runtime || course.runtime || 'N/A'}</td>
                  <td>${course.short_description ? course.short_description.substring(0, 100) + '...' : 'N/A'}</td>
                  <td>${course.ratings || 0} ⭐</td>
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

  const formatRuntime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800/80">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">Courses Management</h1>
            <p className="text-zinc-500 text-xs">
              Manage your learning courses and content
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-5 py-5">
        {/* Search, Add and Export Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses by title, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
            />
          </div>
          <button
            onClick={openAddModal}
            className="h-9 px-4 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredCourses.length === 0}
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
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Code</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Course Title</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Category</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Runtime</th>
                    <th className="text-left py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Rating</th>
                    <th className="text-right py-2.5 px-4 font-medium text-zinc-500 text-[11px] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-600 text-xs">
                        {searchQuery ? 'No courses found matching your search.' : 'No courses found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <tr 
                        key={course._id} 
                        className={`${index !== filteredCourses.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-zinc-900/30 transition-colors duration-150`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded">
                              {course.courses_code || 'N/A'}
                            </span>
                            <button
                              onClick={() => copyToClipboard(course.courses_code)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
                              title="Copy code"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-white text-xs font-medium">{course.course_title || 'N/A'}</span>
                            <span className="text-zinc-500 text-[11px] mt-0.5 line-clamp-1">
                              {course.short_description || 'No description'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                            {course.category_code || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Clock className="h-3 w-3" />
                            {formatRuntime(course.runtime)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{course.ratings || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => navigateToCourseLessons(course._id)}
                              className="inline-flex items-center justify-center h-7 w-7 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/30 rounded-md transition-all duration-150"
                              title="Manage Lessons"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openViewModal(course)}
                              className="inline-flex items-center justify-center h-7 w-7 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-all duration-150"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="inline-flex items-center justify-center h-7 w-7 text-zinc-500 hover:text-green-400 hover:bg-green-950/30 rounded-md transition-all duration-150"
                              title="Edit course"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(course)}
                              disabled={deletingId === course._id}
                              className="inline-flex items-center justify-center h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete course"
                            >
                              {deletingId === course._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
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
            {filteredCourses.length > 0 && (
              <div className="mt-3 text-[11px] text-zinc-600">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Course Modal */}
      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeAddModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-base font-semibold">Add New Course</h2>
              <button
                onClick={closeAddModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Course Title *</label>
                  <input
                    type="text"
                    name="course_title"
                    value={formData.course_title}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category Code *</label>
                  <select
                    name="category_code"
                    value={formData.category_code}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.category_code}>
                        {category.category_code} - {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Runtime (minutes)</label>
                    <input
                      type="number"
                      name="runtime"
                      value={formData.runtime}
                      onChange={handleFormChange}
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                      placeholder="e.g., 120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Ratings</label>
                    <input
                      type="number"
                      name="ratings"
                      value={formData.ratings}
                      onChange={handleFormChange}
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                      placeholder="0-5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cover Image URL</label>
                  <input
                    type="text"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Preview Image URL</label>
                  <input
                    type="text"
                    name="preview_image"
                    value={formData.preview_image}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    placeholder="https://example.com/preview.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Preview Video URL</label>
                  <input
                    type="text"
                    name="preview_video"
                    value={formData.preview_video}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Description</label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150 resize-none"
                    placeholder="Brief description (displayed in lists)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Long Description</label>
                  <textarea
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150 resize-none"
                    placeholder="Detailed course description"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900 z-10">
              <button
                onClick={closeAddModal}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                disabled={!formData.course_title.trim() || !formData.category_code}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeEditModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-base font-semibold">Edit Course</h2>
              <button
                onClick={closeEditModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 p-3 bg-zinc-800/30 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400">Course Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                      {editModal.course?.courses_code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(editModal.course?.courses_code)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
                      title="Copy code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Course Title *</label>
                  <input
                    type="text"
                    name="course_title"
                    value={formData.course_title}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category Code *</label>
                  <select
                    name="category_code"
                    value={formData.category_code}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.category_code}>
                        {category.category_code} - {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Runtime (minutes)</label>
                    <input
                      type="number"
                      name="runtime"
                      value={formData.runtime}
                      onChange={handleFormChange}
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Ratings</label>
                    <input
                      type="number"
                      name="ratings"
                      value={formData.ratings}
                      onChange={handleFormChange}
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cover Image URL</label>
                  <input
                    type="text"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Preview Image URL</label>
                  <input
                    type="text"
                    name="preview_image"
                    value={formData.preview_image}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Preview Video URL</label>
                  <input
                    type="text"
                    name="preview_video"
                    value={formData.preview_video}
                    onChange={handleFormChange}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Description</label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Long Description</label>
                  <textarea
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-150 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900 z-10">
              <button
                onClick={closeEditModal}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-750 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCourse}
                disabled={!formData.course_title.trim() || !formData.category_code}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 active:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Course Details Modal */}
      {viewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeViewModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 scale-100 opacity-100 transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-base font-semibold">Course Details</h2>
              <button
                onClick={closeViewModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="space-y-6">
                {/* Course Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                        {viewModal.course?.courses_code}
                      </span>
                      <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                        {viewModal.course?.category_code}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{viewModal.course?.course_title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="text-sm">{viewModal.course?.ratings || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{formatRuntime(viewModal.course?.runtime)}</span>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
                  <p className="text-sm text-zinc-300 whitespace-pre-line">
                    {viewModal.course?.long_description || viewModal.course?.short_description || 'No description available.'}
                  </p>
                </div>

                {/* Media Previews */}
                <div className="grid grid-cols-2 gap-4">
                  {viewModal.course?.cover_image && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Cover Image</h4>
                      <div className="bg-zinc-800/30 rounded-md p-2 border border-zinc-800">
                        <p className="text-xs text-zinc-500 truncate">{viewModal.course.cover_image}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewModal.course?.preview_image && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Preview Image</h4>
                      <div className="bg-zinc-800/30 rounded-md p-2 border border-zinc-800">
                        <p className="text-xs text-zinc-500 truncate">{viewModal.course.preview_image}</p>
                      </div>
                    </div>
                  )}
                </div>

                {viewModal.course?.preview_video && (
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Preview Video</h4>
                    <div className="bg-zinc-800/30 rounded-md p-2 border border-zinc-800">
                      <p className="text-xs text-zinc-500 truncate">{viewModal.course.preview_video}</p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t border-zinc-800">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Course Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Course Slug:</span>
                      <p className="text-zinc-300 font-mono mt-1">{viewModal.course?.course_slug || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Created At:</span>
                      <p className="text-zinc-300 mt-1">
                        {viewModal.course?.createdAt ? new Date(viewModal.course.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => navigateToCourseLessons(viewModal.course?._id)}
                className="h-8 px-3 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 inline-flex items-center gap-2"
              >
                <BookOpen className="h-3 w-3" />
                Manage Lessons
              </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={closeDeleteModal}
          />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4 scale-100 opacity-100 transition-all duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Delete Course</h2>
              <button
                onClick={closeDeleteModal}
                className="text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-zinc-300 text-sm mb-3">
                Are you sure you want to delete <span className="text-white font-medium">{deleteModal.course?.course_title}</span> (Code: <span className="font-mono">{deleteModal.course?.courses_code}</span>)?
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                This action cannot be undone. This will permanently delete the course and all associated data including lessons, modules, and user progress.
              </p>
            </div>

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
                  'Delete Course'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;