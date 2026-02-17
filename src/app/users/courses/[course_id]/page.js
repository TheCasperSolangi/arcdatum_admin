"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Menu,
  X,
} from "lucide-react";

export default function CourseLearningPage() {
  const [courseId, setCourseId] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingProgress, setMarkingProgress] = useState(false);
  
  const videoRef = useRef(null);

  useEffect(() => {
    // Extract course_id from URL
    const path = window.location.pathname;
    const id = path.split('/').pop();
    setCourseId(id);
  }, []);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const getToken = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") return value;
    }
    return null;
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch course details
      const coursesResponse = await fetch("https://api.arcdatum.com/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
      const coursesData = await coursesResponse.json();
      const foundCourse = coursesData.data.find((c) => c._id === courseId);

      if (!foundCourse) throw new Error("Course not found");
      setCourse(foundCourse);

      // Fetch lessons
      const lessonsResponse = await fetch(
        `https://api.arcdatum.com/api/lessons?course_id=${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!lessonsResponse.ok) throw new Error("Failed to fetch lessons");
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData.data || []);

      // Fetch progress
      const progressResponse = await fetch(
        `https://api.arcdatum.com/api/progress/courses/${foundCourse.courses_code}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(progressData);

        // Set current video to next video or first video
        if (progressData.next_video && lessonsData.data) {
          const lesson = lessonsData.data.find(
            (l) => l._id === progressData.next_video.lesson_code
          );
          if (lesson) {
            const video = lesson.videos.find(
              (v) => v.video_code === progressData.next_video.video_code
            );
            if (video) {
              setCurrentVideo(video);
              setCurrentLesson(lesson);
              setExpandedLessons({ [lesson._id]: true });
            }
          }
        }
      }

      // If no current video set, use first video
      if (!currentVideo && lessonsData.data && lessonsData.data.length > 0) {
        const firstLesson = lessonsData.data[0];
        if (firstLesson.videos && firstLesson.videos.length > 0) {
          setCurrentVideo(firstLesson.videos[0]);
          setCurrentLesson(firstLesson);
          setExpandedLessons({ [firstLesson._id]: true });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const isVideoCompleted = (videoCode) => {
    if (!progress) return false;
    return progress.progress_details.some(
      (p) => p.video_code === videoCode && p.status === "Complete"
    );
  };

  const markVideoComplete = async (videoCode, lessonId) => {
    try {
      setMarkingProgress(true);
      const token = getToken();

      const response = await fetch(
        `https://api.arcdatum.com/api/progress/courses/${course.courses_code}/add-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lesson_code: lessonId,
            video_code: videoCode,
            status: "Complete",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark video complete");

      // Refresh progress
      await fetchCourseData();
    } catch (err) {
      console.error("Error marking video complete:", err);
    } finally {
      setMarkingProgress(false);
    }
  };

  const handleVideoSelect = (video, lesson) => {
    setCurrentVideo(video);
    setCurrentLesson(lesson);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleVideoEnd = () => {
    if (currentVideo && currentLesson) {
      markVideoComplete(currentVideo.video_code, currentLesson._id);
    }
  };

  const handleMarkComplete = () => {
    if (currentVideo && currentLesson && !isVideoCompleted(currentVideo.video_code)) {
      markVideoComplete(currentVideo.video_code, currentLesson._id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={fetchCourseData}
            variant="outline"
            className="bg-transparent border-gray-800 text-white hover:bg-gray-900"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden text-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Video Player */}
        <div className="bg-black aspect-video w-full">
          {currentVideo ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onEnded={handleVideoEnd}
              key={currentVideo.video_code}
            >
              <source src={currentVideo.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Select a video to start learning
            </div>
          )}
        </div>

        {/* Video Info */}
        {currentVideo && (
          <div className="p-6 border-b border-[#1A1A1A]">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {currentVideo.video_title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {currentLesson?.lesson_title}
                </p>
              </div>
              <Button
                onClick={handleMarkComplete}
                size="sm"
                className={`ml-4 ${
                  isVideoCompleted(currentVideo.video_code)
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
                disabled={markingProgress || isVideoCompleted(currentVideo.video_code)}
              >
                {markingProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isVideoCompleted(currentVideo.video_code) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            </div>

            {currentVideo.video_description && (
              <p className="text-gray-300 text-sm mt-3">
                {currentVideo.video_description}
              </p>
            )}
          </div>
        )}

        {/* Course Progress */}
        {progress && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Course Progress</h3>
              <span className="text-sm text-gray-400">
                {progress.completed_videos}/{progress.total_videos} videos
                completed
              </span>
            </div>
            <Progress
              value={progress.completion}
              className="h-2 bg-[#1A1A1A]"
            />
            <p className="text-sm text-gray-400 mt-2">
              {progress.completion}% Complete
            </p>
          </div>
        )}
      </div>

      {/* Sidebar - Lessons */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } transition-all duration-300 border-l border-[#1A1A1A] overflow-hidden flex-shrink-0`}
      >
        <div className="h-full overflow-y-auto bg-[#0A0A0A]">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#1A1A1A] sticky top-0 bg-[#0A0A0A] z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Course Content</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0 hover:bg-[#1A1A1A]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {progress && (
              <p className="text-xs text-gray-500">
                {lessons.length} lessons • {progress.total_videos} videos
              </p>
            )}
          </div>

          {/* Lessons List */}
          <div className="p-2">
            {lessons.map((lesson, index) => (
              <Card
                key={lesson._id}
                className="mb-2 bg-[#0F0F0F] border-[#1A1A1A] overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Lesson Header */}
                  <button
                    onClick={() => toggleLesson(lesson._id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      {expandedLessons[lesson._id] ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Lesson {index + 1}
                        </p>
                        <p className="text-sm font-medium">
                          {lesson.lesson_title}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {lesson.videos?.length || 0} videos
                    </span>
                  </button>

                  {/* Videos List */}
                  {expandedLessons[lesson._id] && (
                    <div className="border-t border-[#1A1A1A]">
                      {lesson.videos?.map((video) => {
                        const isCompleted = isVideoCompleted(video.video_code);
                        const isCurrent =
                          currentVideo?.video_code === video.video_code;

                        return (
                          <button
                            key={video.video_code}
                            onClick={() => handleVideoSelect(video, lesson)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-[#1A1A1A] transition-colors ${
                              isCurrent ? "bg-[#1A1A1A]" : ""
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 text-left">
                              <p
                                className={`text-sm ${
                                  isCurrent ? "text-white" : "text-gray-300"
                                }`}
                              >
                                {video.video_title}
                              </p>
                              {video.runtime && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    {Math.floor(video.runtime / 60)}:
                                    {(video.runtime % 60)
                                      .toString()
                                      .padStart(2, "0")}
                                  </span>
                                </div>
                              )}
                            </div>
                            {isCurrent && (
                              <Play className="h-4 w-4 text-white flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg z-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}