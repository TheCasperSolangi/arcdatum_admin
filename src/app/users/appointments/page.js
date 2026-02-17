"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
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
  Plus,
  X,
  AlertCircle,
  Video,
  RotateCcw,
  Check,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays, isToday, isPast, isValid, parseISO } from "date-fns";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchUserAndAppointments();
  }, []);

  useEffect(() => {
    if (modalOpen && selectedDate) {
      // Send date in YYYY-MM-DD format to match what API expects
      fetchAvailableSlots(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [modalOpen, selectedDate]);

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

  // Helper function to safely parse dates
  const safeParseDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Try parsing as ISO string first
      let date = parseISO(dateString);
      if (isValid(date)) return date;
      
      // Try as regular Date constructor
      date = new Date(dateString);
      if (isValid(date)) return date;
      
      return null;
    } catch (e) {
      console.error('Error parsing date:', dateString, e);
      return null;
    }
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString, formatStr = "MMM dd, yyyy") => {
    const date = safeParseDate(dateString);
    if (!date) return "Invalid date";
    
    try {
      return format(date, formatStr);
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return "Invalid date";
    }
  };

  // Helper function to create appointment datetime
  const getAppointmentDateTime = (app) => {
    if (!app.date || !app.time) return null;
    
    try {
      // Parse the date
      const date = safeParseDate(app.date);
      if (!date) return null;
      
      // Extract start time from time range (e.g., "10:00-11:00" -> "10:00")
      const startTime = app.time.split('-')[0]?.trim();
      if (!startTime) return null;
      
      // Create datetime string
      const dateStr = format(date, "yyyy-MM-dd");
      const dateTimeStr = `${dateStr}T${startTime}:00`;
      
      const appDate = new Date(dateTimeStr);
      return isValid(appDate) ? appDate : null;
    } catch (e) {
      console.error('Error creating appointment datetime:', app, e);
      return null;
    }
  };

  const fetchUserAndAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const userResponse = await fetch("https://api.arcdatum.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      setUser(userData);
      setBookingEmail(userData.email);

      const appointmentsResponse = await fetch(
        `https://api.arcdatum.com/api/sessions/email/${encodeURIComponent(userData.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!appointmentsResponse.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const appointmentsData = await appointmentsResponse.json();
      const sortedAppointments = appointmentsData.data?.sort((a, b) => {
        const dateA = safeParseDate(b.date);
        const dateB = safeParseDate(a.date);
        if (!dateA || !dateB) return 0;
        return dateA - dateB;
      }) || [];
      
      setAppointments(sortedAppointments);

      // Calculate stats
      const now = new Date();
      const completed = sortedAppointments.filter(app => app.status === 'completed').length;
      const upcoming = sortedAppointments.filter(app => {
        const appDate = getAppointmentDateTime(app);
        return app.status === 'scheduled' && appDate && appDate > now;
      }).length;
      const cancelled = sortedAppointments.filter(app => app.status === 'cancelled').length;

      setStats({
        totalAppointments: sortedAppointments.length,
        completed,
        upcoming,
        cancelled
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      setSlotsLoading(true);
      setAvailableSlots([]);
      setSelectedSlot(null);
      setBookingError(null);
      setBookingSuccess(false);

      const token = getToken();
      const response = await fetch(`https://api.arcdatum.com/api/slots/available?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const data = await response.json();
      setAvailableSlots(data.data?.slots || []);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      setBookingError(null);
      setBookingSuccess(false);

      if (!selectedSlot) {
        throw new Error("Please select a slot");
      }

      if (!bookingEmail) {
        throw new Error("Email is required");
      }

      const token = getToken();
      const response = await fetch("https://api.arcdatum.com/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slot_code: selectedSlot.slot_code,
          email: bookingEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book appointment");
      }

      setBookingSuccess(true);
      // Refresh appointments after short delay
      setTimeout(() => {
        fetchUserAndAppointments();
        setModalOpen(false);
      }, 1500);
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'on-going':
        return <Video className="h-4 w-4 text-purple-400" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-400" />;
      case 'reschedule':
        return <RotateCcw className="h-4 w-4 text-amber-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-400';
      case 'on-going': return 'bg-purple-500/10 text-purple-400';
      case 'completed': return 'bg-green-500/10 text-green-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'reschedule': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-gray-500/10 text-gray-400';
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
              Loading your appointments
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
            onClick={fetchUserAndAppointments}
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
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  My Appointments
                </h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">
                Manage your scheduled sessions and book new ones easily.
              </p>
            </div>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Book New Appointment
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-300">Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-white",
                            !selectedDate && "text-gray-400"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800 text-white">
                        <div className="p-3 space-y-2">
                          <Select
                            onValueChange={(value) => {
                              const newDate = addDays(new Date(), parseInt(value));
                              setSelectedDate(newDate);
                            }}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Quick select" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800">
                              <SelectItem value="0">Today</SelectItem>
                              <SelectItem value="1">Tomorrow</SelectItem>
                              <SelectItem value="2">In 2 days</SelectItem>
                              <SelectItem value="3">In 3 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={format(selectedDate, "yyyy-MM-dd")}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            min={format(new Date(), "yyyy-MM-dd")}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Available Slots - Cinema/Flight Style Grid */}
                  <div className="space-y-4">
                    <Label className="text-gray-300 text-lg font-semibold">Available Slots</Label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                      </div>
                    ) : bookingError ? (
                      <div className="flex items-center justify-center py-8 text-red-400">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {bookingError}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3" />
                        <p className="text-lg">No slots available for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto pr-2 py-2">
                        {availableSlots.map((slot) => {
                          const isBooked = slot.status !== 'Free';
                          const isSelected = selectedSlot?._id === slot._id;
                          
                          return (
                            <Button
                              key={slot._id}
                              variant="outline"
                              disabled={isBooked}
                              className={cn(
                                "h-24 flex flex-col items-center justify-center text-sm font-medium border-2 transition-all duration-300 relative overflow-hidden",
                                isBooked
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400 cursor-not-allowed opacity-60"
                                  : isSelected
                                  ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20 scale-105"
                                  : "border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 text-gray-300 hover:scale-105"
                              )}
                              onClick={() => !isBooked && setSelectedSlot(slot)}
                            >
                              {isBooked && (
                                <div className="absolute top-1 right-1">
                                  <X className="h-3 w-3 text-amber-400" />
                                </div>
                              )}
                              <Clock className="h-5 w-5 mb-2" />
                              <span className="font-bold">{slot.time}</span>
                              <span className="text-xs text-gray-500 mt-1">
                                {slot.runtime} min
                              </span>
                              {isBooked && (
                                <span className="text-xs text-amber-400 mt-1 font-semibold">
                                  Booked
                                </span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Booking Button */}
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || slotsLoading || bookingSuccess}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                  >
                    {bookingSuccess ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Booked Successfully
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>

                  {bookingError && (
                    <p className="text-red-400 text-sm text-center mt-2">{bookingError}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAppointments}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-white">{stats.upcoming}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Cancelled</p>
                  <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <X className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Grid */}
        {appointments.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-sm border border-gray-800/30">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Appointments Yet</h3>
              <p className="text-gray-400 mb-8">
                Start by booking your first appointment
              </p>
              <Button 
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl"
              >
                Book Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((app) => {
              const appDate = getAppointmentDateTime(app);
              const isUpcoming = app.status === 'scheduled' && appDate && appDate > new Date();
              const statusColor = getStatusColor(app.status);

              return (
                <div
                  key={app._id}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Gradient Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-700" />

                  {/* Header Image Placeholder */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <img
                      src="https://images.unsplash.com/photo-1520607162513-6a0790ec0fe9?w=800&auto=format&fit=crop&q=60"
                      alt="Appointment"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-50"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-transparent group-hover:from-black/40 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70"></div>
                        <div className={`relative px-3 py-1.5 rounded-full bg-gray-900/90 backdrop-blur-sm border border-white/10 capitalize ${statusColor}`}>
                          <span className="text-sm font-bold">
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                        <Calendar className="h-3 w-3 text-gray-300" />
                        <span className="text-xs font-medium text-white">
                          {safeFormatDate(app.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 relative">
                    {/* Session Code */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {app.session_code}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                      Scheduled session for {app.runtime} minutes
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">{app.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(app.status)}
                          <span className="text-sm text-gray-400 capitalize">{app.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">1:1 Session</span>
                      </div>
                    </div>

                    {/* Progress/Status Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Status</span>
                        <span className="capitalize">{app.status}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${statusColor}`}
                          style={{ width: app.status === 'completed' ? '100%' : app.status === 'on-going' ? '50%' : '0%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                    </div>

                    {/* Next Action Preview */}
                    {isUpcoming && app.joining_link && (
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Action
                          </p>
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </div>
                        <a 
                          href={app.joining_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-white mb-1 line-clamp-1 hover:text-blue-300 transition-colors"
                        >
                          Join Meeting
                        </a>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          Google Meet link ready
                        </p>
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button
                      onClick={() => window.location.href = `/appointments/${app.session_code}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      <Video className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      View Details
                    </Button>

                    {/* Booked Date */}
                    <div className="mt-4 flex items-center justify-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-600" />
                      <span className="text-xs text-gray-500">
                        Booked on {safeFormatDate(app.createdAt || new Date())}
                      </span>
                    </div>
                  </CardContent>
                </div>
              );
            })}
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