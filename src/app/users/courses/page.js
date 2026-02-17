"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  Zap,
  Star,
  Users,
  Calendar
} from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completionRate: 0,
    totalHours: 0,
    streakDays: 0
  });

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
      const matchedCourses = [];

      // Fetch progress for all enrolled courses
      const progressPromises = enrolledCourses.map(async (enrolled) => {
        const courseDetail = coursesData.data?.find(
          (c) => c.courses_code === enrolled.course_code
        );

        if (!courseDetail) return null;

        try {
          const progressResponse = await fetch(
            `https://api.arcdatum.com/api/progress/courses/${enrolled.course_code}/progress`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let progressData = null;
          if (progressResponse.ok) {
            progressData = await progressResponse.json();
          }

          return {
            ...courseDetail,
            purchased_on: enrolled.purchased_on,
            progress: progressData,
          };
        } catch (err) {
          return {
            ...courseDetail,
            purchased_on: enrolled.purchased_on,
            progress: null,
          };
        }
      });

      const results = await Promise.all(progressPromises);
      const validCourses = results.filter(Boolean);
      setCourses(validCourses);

      // Calculate stats
      const totalCompletion = validCourses.reduce(
        (sum, course) => sum + (course.progress?.completion || 0),
        0
      );
      const avgCompletion = validCourses.length
        ? totalCompletion / validCourses.length
        : 0;

      setStats({
        totalCourses: validCourses.length,
        completionRate: avgCompletion,
        totalHours: validCourses.reduce(
          (sum, course) => sum + (course.total_hours || 0),
          0
        ),
        streakDays: userData.streak_days || 0
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCourse = (courseSlug) => {
    window.location.href = `/users/courses/${courseSlug}`;
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
              Loading your learning journey
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
        {/* Header with Stats */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-gray-800">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  My Courses
                </h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">
                Continue your learning journey. Each step brings you closer to mastery.
              </p>
            </div>
            {stats.streakDays > 0 && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">
                  {stats.streakDays} day streak
                </span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Completion</p>
                  <p className="text-3xl font-bold text-white">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-white">{stats.totalHours}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 group-hover:purple-500/20 transition-colors">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-white">4</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
              </div>
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
              <h3 className="text-2xl font-semibold text-white mb-3">No Courses Yet</h3>
              <p className="text-gray-400 mb-8">
                Start your learning journey by enrolling in your first course
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl">
                Browse Courses
              </Button>
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

                {/* Course Image - FIXED: Always visible */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                  <img
                    src={course.cover_image}
                    alt={course.course_title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60";
                    }}
                  />
                  {/* Subtle static gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/70 to-transparent" />
                  
                  {/* Only show additional overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-transparent group-hover:from-black/40 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500" />
                  
                  {/* Course Progress Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70"></div>
                      <div className="relative bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-sm font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {course.progress?.completion || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

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
                  {/* Course Title */}
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {course.course_title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                    {course.short_description || "Master new skills with this comprehensive course"}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                          {course.readable_runtime || "N/A"}
                        </span>
                      </div>
                      {course.progress && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-400">
                            {course.progress.completed_videos}/{course.progress.total_videos}
                          </span>
                        </div>
                      )}
                    </div>
                    {course.instructor && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{course.instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>{course.progress?.completion || 0}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                        style={{ width: `${course.progress?.completion || 0}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Next Lesson Preview */}
                  {course.progress?.next_video && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Up Next
                        </p>
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1 line-clamp-1">
                        {course.progress.next_video.video_title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {course.progress.next_video.lesson_title}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleAccessCourse(course._id)}
                    className="w-full "
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Play className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      {course.progress?.completion > 0 ? "Continue Learning" : "Start Learning"}
                    </div>
                  </Button>

                  {/* Enrolled Date */}
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs text-gray-500">
                      Enrolled on {new Date(course.purchased_on).toLocaleDateString()}
                    </span>
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