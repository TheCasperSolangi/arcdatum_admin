"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle, X, Video, Paperclip, Clock, BookOpen, PlayCircle, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import Cookies from 'js-cookie';

const CourseContentManagement = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.course_id;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addLessonModal, setAddLessonModal] = useState({ open: false });
  const [editLessonModal, setEditLessonModal] = useState({ open: false, lesson: null });
  const [addVideoModal, setAddVideoModal] = useState({ open: false, lesson: null });
  const [addAttachmentModal, setAddAttachmentModal] = useState({ open: false, lesson: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null, type: null });
  const [expandedLesson, setExpandedLesson] = useState(null);

  const [lessonForm, setLessonForm] = useState({
    lesson_title: '',
    lesson_short_description: '',
    lesson_long_description: '',
    course_code: '',
    lesson_order: 1
  });

  const [videoForm, setVideoForm] = useState({
    video_title: '',
    video_url: '',
    video_duration: '',
    video_order: 1
  });

  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch course');
      
      const data = await response.json();
      setCourse(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/lessons?course_id=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch lessons');
      
      const data = await response.json();
      setLessons(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch('https://api.arcdatum.com/api/lessons/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...lessonForm,
          course_code: course?.courses_code
        })
      });

      if (!response.ok) throw new Error('Failed to create lesson');
      
      await fetchLessons();
      setAddLessonModal({ open: false });
      setLessonForm({ lesson_title: '', lesson_short_description: '', lesson_long_description: '', course_code: '', lesson_order: 1 });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditLesson = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/lessons/${editLessonModal.lesson._id}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonForm)
      });

      if (!response.ok) throw new Error('Failed to update lesson');
      
      await fetchLessons();
      setEditLessonModal({ open: false, lesson: null });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddVideo = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/lessons/${addVideoModal.lesson._id}/add-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...videoForm,
          video_code: `VID${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Failed to add video');
      
      await fetchLessons();
      setAddVideoModal({ open: false, lesson: null });
      setVideoForm({ video_title: '', video_url: '', video_duration: '', video_order: 1 });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddAttachment = async () => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/lessons/${addAttachmentModal.lesson._id}/add-attachment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attachment_url: attachmentUrl })
      });

      if (!response.ok) throw new Error('Failed to add attachment');
      
      await fetchLessons();
      setAddAttachmentModal({ open: false, lesson: null });
      setAttachmentUrl('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://files.arcdatum.com/api/uploads', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload video');

      const data = await response.json();
      setVideoForm({ ...videoForm, video_url: data.url });
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAttachmentFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://files.arcdatum.com/api/uploads', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const data = await response.json();
      setAttachmentUrl(data.url);
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDeleteVideo = async (lessonId, videoCode) => {
    try {
      const authToken = Cookies.get('token');
      const response = await fetch(`https://api.arcdatum.com/api/lessons/${lessonId}/delete-video/${videoCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete video');
      
      await fetchLessons();
      setDeleteModal({ open: false, item: null, type: null });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openEditLessonModal = (lesson) => {
    setLessonForm({
      lesson_title: lesson.lesson_title || '',
      lesson_short_description: lesson.lesson_short_description || '',
      lesson_long_description: lesson.lesson_long_description || '',
      course_code: lesson.course_code || '',
      lesson_order: lesson.lesson_order || 1
    });
    setEditLessonModal({ open: true, lesson });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-8xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-150 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Courses</span>
          </button>
          
          {course && (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                    {course.courses_code}
                  </span>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                    {course.category_code}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{course.course_title}</h1>
                <p className="text-zinc-500 text-sm mt-1">{course.short_description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="h-4 w-4" />
                  {course.readable_runtime}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <BookOpen className="h-4 w-4" />
                  {lessons.length} Lessons
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-6 py-6">
        {/* Add Lesson Button */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Course Content</h2>
          <button
            onClick={() => setAddLessonModal({ open: true })}
            className="h-9 px-4 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-100 transition-colors duration-150 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 px-3 py-2.5 bg-red-950/50 border border-red-900/50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 rounded-lg">
                <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No lessons yet. Add your first lesson to get started.</p>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <div key={lesson._id} className="border border-zinc-800 rounded-lg overflow-hidden">
                  {/* Lesson Header */}
                  <div className="bg-zinc-900/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-zinc-500">
                            Lesson {lesson.lesson_order || index + 1}
                          </span>
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {expandedLesson === lesson._id ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                        <h3 className="text-base font-semibold mb-1">{lesson.lesson_title}</h3>
                        {lesson.lesson_short_description && (
                          <p className="text-sm text-zinc-400 line-clamp-2">{lesson.lesson_short_description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5" />
                            {lesson.videos?.length || 0} Videos
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5" />
                            {lesson.attachments?.length || 0} Attachments
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAddVideoModal({ open: true, lesson })}
                          className="h-8 w-8 inline-flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-all"
                          title="Add video"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAddAttachmentModal({ open: true, lesson })}
                          className="h-8 w-8 inline-flex items-center justify-center text-zinc-500 hover:text-green-400 hover:bg-green-950/30 rounded-md transition-all"
                          title="Add attachment"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditLessonModal(lesson)}
                          className="h-8 w-8 inline-flex items-center justify-center text-zinc-500 hover:text-yellow-400 hover:bg-yellow-950/30 rounded-md transition-all"
                          title="Edit lesson"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedLesson === lesson._id && (
                    <div className="p-4 space-y-4 bg-zinc-950/30">
                      {/* Videos */}
                      {lesson.videos && lesson.videos.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Videos</h4>
                          <div className="space-y-2">
                            {lesson.videos.map((video) => (
                              <div key={video.video_code} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-md">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-zinc-800 rounded flex items-center justify-center">
                                    <PlayCircle className="h-5 w-5 text-zinc-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{video.video_title}</p>
                                    <p className="text-xs text-zinc-500">{formatDuration(video.video_duration)}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setDeleteModal({ open: true, item: { lessonId: lesson._id, videoCode: video.video_code, title: video.video_title }, type: 'video' })}
                                  className="h-7 w-7 inline-flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Attachments</h4>
                          <div className="space-y-2">
                            {lesson.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-md">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                  <p className="text-sm text-zinc-300 truncate">{attachment}</p>
                                </div>
                                <a
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <LinkIcon className="h-3 w-3" />
                                  Open
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Lesson Modal */}
      {addLessonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddLessonModal({ open: false })} />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Add New Lesson</h2>
              <button onClick={() => setAddLessonModal({ open: false })} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonForm.lesson_title}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_title: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Description *</label>
                <textarea
                  value={lessonForm.lesson_short_description}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_short_description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
                  placeholder="Brief description (displayed in lists)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Long Description *</label>
                <textarea
                  value={lessonForm.lesson_long_description}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_long_description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
                  placeholder="Detailed lesson description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Lesson Order</label>
                <input
                  type="number"
                  value={lessonForm.lesson_order}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_order: parseInt(e.target.value) })}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => setAddLessonModal({ open: false })}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLesson}
                disabled={!lessonForm.lesson_title.trim() || !lessonForm.lesson_short_description.trim() || !lessonForm.lesson_long_description.trim()}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editLessonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditLessonModal({ open: false, lesson: null })} />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Edit Lesson</h2>
              <button onClick={() => setEditLessonModal({ open: false, lesson: null })} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonForm.lesson_title}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_title: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Description *</label>
                <textarea
                  value={lessonForm.lesson_short_description}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_short_description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Long Description *</label>
                <textarea
                  value={lessonForm.lesson_long_description}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_long_description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
                  placeholder="Detailed description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Lesson Order</label>
                <input
                  type="number"
                  value={lessonForm.lesson_order}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_order: parseInt(e.target.value) })}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => setEditLessonModal({ open: false, lesson: null })}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLesson}
                disabled={!lessonForm.lesson_title.trim() || !lessonForm.lesson_short_description.trim() || !lessonForm.lesson_long_description.trim()}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 disabled:opacity-50"
              >
                Update Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {addVideoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddVideoModal({ open: false, lesson: null })} />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Add Video</h2>
              <button onClick={() => setAddVideoModal({ open: false, lesson: null })} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Video Title *</label>
                <input
                  type="text"
                  value={videoForm.video_title}
                  onChange={(e) => setVideoForm({ ...videoForm, video_title: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Upload Video File</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center w-full h-24 px-4 border-2 border-dashed border-zinc-800 rounded-md hover:border-zinc-700 transition-colors cursor-pointer bg-zinc-950">
                    <div className="text-center">
                      {uploadingVideo ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                          <span className="text-xs text-zinc-500">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-zinc-500" />
                          <span className="text-xs text-zinc-400">Click to upload video</span>
                          <span className="text-[10px] text-zinc-600">MP4, WebM, or other video formats</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      disabled={uploadingVideo}
                    />
                  </label>
                  {videoForm.video_url && (
                    <div className="flex items-center gap-2 p-2 bg-green-950/20 border border-green-900/30 rounded-md">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">Video uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Video URL (Auto-generated)</label>
                <input
                  type="text"
                  value={videoForm.video_url}
                  readOnly
                  className="w-full h-9 px-3 bg-zinc-900/50 border border-zinc-800 rounded-md text-sm text-zinc-500 cursor-not-allowed"
                  placeholder="URL will appear here after upload"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Duration (seconds)</label>
                  <input
                    type="number"
                    value={videoForm.video_duration}
                    onChange={(e) => setVideoForm({ ...videoForm, video_duration: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Video Order</label>
                  <input
                    type="number"
                    value={videoForm.video_order}
                    onChange={(e) => setVideoForm({ ...videoForm, video_order: parseInt(e.target.value) })}
                    className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => setAddVideoModal({ open: false, lesson: null })}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVideo}
                disabled={!videoForm.video_title.trim() || !videoForm.video_url.trim()}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 disabled:opacity-50"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Attachment Modal */}
      {addAttachmentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddAttachmentModal({ open: false, lesson: null })} />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Add Attachment</h2>
              <button onClick={() => setAddAttachmentModal({ open: false, lesson: null })} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Upload Attachment File</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center w-full h-24 px-4 border-2 border-dashed border-zinc-800 rounded-md hover:border-zinc-700 transition-colors cursor-pointer bg-zinc-950">
                    <div className="text-center">
                      {uploadingAttachment ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                          <span className="text-xs text-zinc-500">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-zinc-500" />
                          <span className="text-xs text-zinc-400">Click to upload file</span>
                          <span className="text-[10px] text-zinc-600">PDF, DOC, ZIP, or any file type</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentFileUpload}
                      disabled={uploadingAttachment}
                    />
                  </label>
                  {attachmentUrl && (
                    <div className="flex items-center gap-2 p-2 bg-green-950/20 border border-green-900/30 rounded-md">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">File uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Attachment URL (Auto-generated)</label>
                <input
                  type="text"
                  value={attachmentUrl}
                  readOnly
                  className="w-full h-9 px-3 bg-zinc-900/50 border border-zinc-800 rounded-md text-sm text-zinc-500 cursor-not-allowed"
                  placeholder="URL will appear here after upload"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => setAddAttachmentModal({ open: false, lesson: null })}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAttachment}
                disabled={!attachmentUrl.trim()}
                className="h-8 px-3 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-100 disabled:opacity-50"
              >
                Add Attachment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, item: null, type: null })} />
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold">Delete Video</h2>
              <button onClick={() => setDeleteModal({ open: false, item: null, type: null })} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-zinc-300 text-sm mb-3">
                Are you sure you want to delete <span className="text-white font-medium">{deleteModal.item?.title}</span>?
              </p>
              <p className="text-zinc-500 text-xs">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-zinc-800">
              <button
                onClick={() => setDeleteModal({ open: false, item: null, type: null })}
                className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteModal.item?.lessonId, deleteModal.item?.videoCode)}
                className="h-8 px-3 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700"
              >
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentManagement;