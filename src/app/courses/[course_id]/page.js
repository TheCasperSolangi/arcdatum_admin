"use client"
import React, { useState, useEffect } from 'react';
import { Clock, Star, PlayCircle, FileText, ChevronDown, ChevronUp, User, Calendar, Award, Users, Globe, CheckCircle, Loader2, AlertCircle, Download, Infinity, Smartphone, Trophy, X } from 'lucide-react';

const API_BASE = "https://api.arcdatumcode.info/api";
const COURSE_ID = "6933b0349fd3ecd574d64cbb";

const getAuthToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') return value;
  }
  return null;
};

const CourseDetailsPage = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchCourseData();
    loadPayPalScript();
  }, []);

const loadPayPalScript = () => {
  if (window.paypal) {
    setPaypalLoaded(true);
    return;
  }

  const script = document.createElement('script');
  // Use generic sandbox for staging/testing
  script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&components=buttons';
  script.async = true;
  script.onload = () => {
    console.log('PayPal Sandbox SDK loaded successfully');
    setPaypalLoaded(true);
  };
  script.onerror = (error) => {
    console.error('PayPal SDK failed to load:', error);
    // Don't set a hard error, just log it
  };
  document.body.appendChild(script);
};

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const courseRes = await fetch(`${API_BASE}/courses/${COURSE_ID}`);
      if (!courseRes.ok) throw new Error('Failed to fetch course');
      const courseData = await courseRes.json();
      
      if (courseData.success) {
        setCourse(courseData.data);
        
        const lessonsRes = await fetch(`${API_BASE}/lessons?course_id=${COURSE_ID}`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          if (lessonsData.success) {
            setLessons(lessonsData.data || []);
          }
        }

        const reviewsRes = await fetch(`${API_BASE}/reviews/${courseData.data.courses_code}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          if (reviewsData.success) {
            setReviews(reviewsData.data || []);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{clipPath: 'inset(0 50% 0 0)'}} />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-600" />);
      }
    }
    return stars;
  };

  const calculateTotalVideos = () => {
    return lessons.reduce((total, lesson) => total + (lesson.videos?.length || 0), 0);
  };

  const handleBuyNow = () => {
    const token = getAuthToken();
    if (!token) {
      alert('Please login to purchase this course');
      window.location.href = '/login';
      return;
    }
    setShowPaymentModal(true);
  };

  const initializePayPal = async () => {
    if (!paypalLoaded || !window.paypal) {
      console.error('PayPal SDK not loaded');
      return;
    }

    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) return;

    paypalContainer.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: async () => {
        setPaymentLoading(true);
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_BASE}/purchase/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              course_code: course.courses_code
            })
          });

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Failed to create order');
          }

          return data.orderId;
        } catch (err) {
          console.error('Create order error:', err);
          alert(err.message || 'Failed to create PayPal order');
          setPaymentLoading(false);
          throw err;
        }
      },
      onApprove: async (data) => {
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_BASE}/purchase/capture-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: data.orderID,
              course_code: course.courses_code
            })
          });

          const result = await response.json();

          if (result.success) {
            alert('Payment successful! Redirecting to your courses...');
            setTimeout(() => {
              window.location.href = '/my-courses';
            }, 2000);
          } else {
            throw new Error(result.message || 'Payment capture failed');
          }
        } catch (err) {
          console.error('Capture error:', err);
          alert(err.message || 'Payment processing failed');
        } finally {
          setPaymentLoading(false);
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        alert('Payment failed. Please try again.');
        setPaymentLoading(false);
      },
      onCancel: () => {
        console.log('Payment cancelled');
        setPaymentLoading(false);
      }
    }).render('#paypal-button-container');
  };

  useEffect(() => {
    if (showPaymentModal && paypalLoaded) {
      setTimeout(() => {
        initializePayPal();
      }, 100);
    }
  }, [showPaymentModal, paypalLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-red-950/20 border border-red-900 rounded-lg p-6 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2 text-center">Error Loading Course</h3>
          <p className="text-gray-400 text-center">{error}</p>
          <button 
            onClick={fetchCourseData}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {course.cover_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img 
                src={course.cover_image} 
                alt={course.course_title}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          )}

          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white leading-tight">
              {course.course_title}
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {course.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold text-lg">{course.ratings || 0}</span>
                <div className="flex gap-1">{renderStars(course.ratings || 0)}</div>
                <span className="text-purple-400 underline">({reviews.length} ratings)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-5 h-5" />
                <span>{course.students_enrolled || 0} students enrolled</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Created by <span className="text-purple-400">{course.instructor || 'Instructor'}</span></span>
              </div>
              {course.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated {formatDate(course.updatedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{course.language || 'English'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="border-b border-gray-800">
              <div className="flex gap-8">
                {['overview', 'curriculum', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-semibold transition capitalize ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-purple-600'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">What you&apos;ll learn</h2>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {lessons.slice(0, 8).map((lesson, idx) => (
                        <div key={idx} className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{lesson.lesson_title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Course Description</h2>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {course.long_description}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Course Content</h2>
                  <div className="text-sm text-gray-400">
                    {lessons.length} sections • {calculateTotalVideos()} lectures
                  </div>
                </div>

                {lessons.map((lesson) => (
                  <div key={lesson._id} className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                    <button
                      onClick={() => toggleLesson(lesson._id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#222] transition"
                    >
                      <div className="flex items-center gap-4">
                        {expandedLessons[lesson._id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{lesson.lesson_title}</h3>
                          {lesson.lesson_short_description && (
                            <p className="text-sm text-gray-400 mt-1">{lesson.lesson_short_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {lesson.videos?.length || 0} lectures
                      </div>
                    </button>

                    {expandedLessons[lesson._id] && (
                      <div className="border-t border-gray-800 bg-[#151515]">
                        {lesson.videos?.map((video) => (
                          <div
                            key={video.video_code}
                            className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition border-b border-gray-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{video.video_title}</span>
                            </div>
                            <span className="text-sm text-gray-400">{video.runtime}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-yellow-400">{course.ratings || 0}</span>
                    <div>
                      <div className="flex gap-1">{renderStars(course.ratings || 0)}</div>
                      <p className="text-sm text-gray-400 mt-1">Course Rating</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-lg p-12 text-center border border-gray-800">
                      <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                      <p className="text-gray-400">Be the first to review this course!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {review.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{review.full_name}</h4>
                              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex gap-1 mb-3">
                              {renderStars(review.ratings)}
                            </div>
                            <p className="text-gray-300 leading-relaxed">{review.review}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
                <div className="relative aspect-video bg-black">
                  {course.preview_image ? (
                    <img 
                      src={course.preview_image} 
                      alt="Course Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-20 h-20 text-gray-700" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">$49.99</span>
                    <span className="text-lg text-gray-500 line-through">$199.99</span>
                    <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded">75% OFF</span>
                  </div>
                  
                  <div className="text-sm text-red-400 font-semibold">
                    🔥 2 days left at this price!
                  </div>

                  <button 
                    onClick={handleBuyNow}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition"
                  >
                    Buy Now
                  </button>

                  <div className="text-center text-sm text-gray-400 pt-2">
                    30-Day Money-Back Guarantee
                  </div>
                </div>

                <div className="border-t border-gray-800 p-6">
                  <h3 className="font-bold text-white mb-4">This course includes:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Clock className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>{course.readable_runtime || '40 hours'} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Download className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>{lessons.reduce((t, l) => t + (l.attachments?.length || 0), 0)} downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Infinity className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Smartphone className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>Access on mobile and TV</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Trophy className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition"
                disabled={paymentLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-[#0f0f0f] rounded-lg p-4 mb-6 border border-gray-800">
                <div className="flex gap-4">
                  {course.preview_image && (
                    <img 
                      src={course.preview_image} 
                      alt={course.course_title}
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{course.course_title}</h3>
                    <p className="text-2xl font-bold text-purple-400">$49.99</p>
                  </div>
                </div>
              </div>

              {paymentLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Processing payment...</p>
                </div>
              )}

              <div id="paypal-button-container" className={paymentLoading ? 'hidden' : ''}></div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing your purchase you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;