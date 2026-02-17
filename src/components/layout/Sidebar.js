"use client";

import React, { useState, useEffect } from 'react';
import { Home, Users, Settings, FileText, BarChart3, User, HelpCircle, Videotape, Settings2, LogOut, DollarSign, LucideDollarSign, DownloadCloudIcon, Disc, TargetIcon, BookOpen, Calendar, CreditCard, MessageSquare, LifeBuoy, BookCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Define menu items based on role
  const getMenuItems = (role) => {
    const adminItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/dashboard' },
      { id: 'student', icon: Users, label: 'Student', href: '/dashboard/students' },
      { id: "categories", icon: Disc, label: "Categories", href: "/dashboard/categories"},
      { id: 'courses', icon: BarChart3, label: 'Course Management', href: '/dashboard/courses' },
      { id: 'leads', icon: TargetIcon, label: 'Leads Management', href: '/dashboard/leads' },
      { id: 'appointments', icon: Videotape, label: "1 on 1 Sessions", href: "/dashboard/sessions"},
      { id: "transactions", icon: DownloadCloudIcon, label: "Transactions", href: "/dashboard/transactions"},
      { id: "settings", icon: Settings2, label: "Settings", href: "/dashboard/settings"}
    ];

    const userItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/users' },
      { id: 'my-courses', icon: BookOpen, label: 'My Courses', href: '/users/courses' },
      { id: 'browse-course', icon: BookCheck, label: "Browse Courses", href:"/users/browse-course"},
      { id: 'appointments', icon: Calendar, label: 'My Appointments', href: '/users/appointments' },
      { id: "health", icon: LifeBuoy, label: "Health & Fitness", href: "/users/health"},
      { id: 'profile', icon: User, label: 'Profile Settings', href: '/users/profile' }
    ];

    return role === 'admin' ? adminItems : userItems;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from cookies
        const token = Cookies.get('token');

        const response = await fetch('https://api.arcdatum.com/api/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          // If unauthorized, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get role from userData
  const userRole = userData?.authId?.role || 'user';
  
  // Get menu items based on role
  const menuItems = getMenuItems(userRole);

  // Handle navigation
  const handleNavigation = (href, id) => {
    setActiveItem(id);
    router.push(href);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      
      const response = await fetch('https://api.arcdatum.com/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Clear token from cookies
        Cookies.remove('token');
        // Clear user data
        setUserData(null);
        // Redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to get redirect path based on role
  const getRoleBasedPath = (path) => {
    if (userRole === 'admin') {
      return path.startsWith('/dashboard') ? path : `/dashboard${path}`;
    } else {
      return path.startsWith('/user') ? path : `/user${path}`;
    }
  };

  return (
    <aside className="h-screen w-72 bg-black flex flex-col border-r border-zinc-800">
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 flex-shrink-0 border-b border-zinc-800">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-black font-bold text-base">A</span>
            </div>
            <span className="text-white font-semibold text-base">
              {userRole === 'admin' ? 'Arcdatum Admin' : 'Arcdatum Learning'}
            </span>
          </div>
        </div>

        {/* Profile Card - Dynamic */}
        <div className="px-4 py-6 flex-shrink-0 border-b border-zinc-800">
          {loading ? (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ) : userData ? (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={userData.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`}
                    alt={userData.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`;
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${userRole === 'admin' ? 'bg-purple-900/30 text-purple-300' : 'bg-blue-900/30 text-blue-300'}`}>
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                    <p className="text-xs text-zinc-500 truncate">{userData.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Guest User</p>
                  <p className="text-xs text-zinc-400 truncate">Please login</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href, item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Support Section */}
        <div className="px-4 py-4 flex-shrink-0 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 group cursor-pointer">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors duration-200">
                <HelpCircle className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Having difficulty?</p>
                <button 
                  onClick={() => router.push(userRole === 'admin' ? '/dashboard/support' : '/user/support')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}