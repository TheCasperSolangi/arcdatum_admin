"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Loader2, 
  Zap,
  Star,
  Users,
  Eye,
  Book
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const getToken = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") {
        return value;
      }
    }
    return null;
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const [userResponse, coursesResponse] = await Promise.all([
        fetch("https://api.arcdatum.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.arcdatum.com/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!userResponse.ok || !coursesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [userData, coursesData] = await Promise.all([
        userResponse.json(),
        coursesResponse.json()
      ]);

      const enrolledCourses = userData.courses || [];

      // Prepare promises for all courses, fetching progress only if enrolled
      const coursePromises = coursesData.data.map(async (course) => {
        const enrolled = enrolledCourses.find(
          (e) => e.course_code === course.courses_code
        );

        if (!enrolled) {
          return {
            ...course,
            isEnrolled: false,
            progress: null,
          };
        }

        try {
          const progressResponse = await fetch(
            `https://api.arcdatum.com/api/progress/courses/${course.courses_code}/progress`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let progressData = null;
          if (progressResponse.ok) {
            progressData = await progressResponse.json();
          }

          return {
            ...course,
            purchased_on: enrolled.purchased_on,
            progress: progressData,
            isEnrolled: true,
          };
        } catch (err) {
          return {
            ...course,
            purchased_on: enrolled.purchased_on,
            progress: null,
            isEnrolled: true,
          };
        }
      });

      const results = await Promise.all(coursePromises);
      setCourses(results);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCourse = (courseId) => {
    window.location.href = `/users/courses/${courseId}`;
  };
  const handleAccessUnownedCourse = (courseId) => {
    window.location.href = `http://localhost:3000/courses/${courseId}`;
  }

  const handleBuyNow = async (courseId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`https://api.arcdatum.com/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        fetchCourses(); // Refresh to update enrollment status
      } else {
        console.error('Failed to enroll');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
            <Loader2 className="h-16 w-16 absolute top-2 left-2 animate-spin text-white" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loading courses
            </p>
            <p className="text-gray-400">Getting everything ready...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <Zap className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <Button
            onClick={fetchCourses}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-gray-800">
                  <Book className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Browse Courses
                </h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">
                Discover new courses to expand your knowledge and skills.
              </p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-sm border border-gray-800/30">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Courses Available</h3>
              <p className="text-gray-400 mb-8">
                Check back soon for new courses
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Gradient Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-700" />

                {/* Course Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                  <img
                    src={course.cover_image}
                    alt={course.course_title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-transparent group-hover:from-black/40 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500" />
                  
                  {/* Course Level Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-white">
                        {course.level || "Beginner"}
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 relative">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {course.course_title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                    {course.short_description || "Master new skills with this comprehensive course"}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                          {course.readable_runtime || "N/A"}
                        </span>
                      </div>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{course.instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    {course.isEnrolled ? (
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                        onClick={() => handleAccessCourse(course._id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Access Course
                      </Button>
                    ) : (
                      <Dialog>
                     
                          <Button
                            onClick={() => handleAccessUnownedCourse(course._id)}
                            className="flex-1 "
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </Button>
                       
                        <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none">
                          <div className="aspect-video">
                            {course.preview_video ? (
                              <video
                                src={course.preview_video}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
                                No preview available for this course
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {course.isEnrolled ? (
                      <Button
                        disabled
                        className="flex-1 bg-gray-600 text-gray-300 cursor-not-allowed"
                      >
                        Already Owned
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleBuyNow(course._id)}
                        className="flex-1"
                      >
                        Buy Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}