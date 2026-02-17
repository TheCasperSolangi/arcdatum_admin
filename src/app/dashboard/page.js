import React from 'react';
import { Plus, BarChart3, Users, Activity, Clock, User, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="space-y-9 max-w-8xl">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Welcome back, John</h1>
          <p className="text-sm text-zinc-400">Here's what's happening with your projects today.</p>
        </div>
        <Button className="bg-white text-black hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: BarChart3 },
          { title: 'Active Users', value: '+2,543', change: '+180.1%', icon: Users },
          { title: 'Tasks Completed', value: '+573', change: '+19%', icon: Activity },
          { title: 'Avg. Response', value: '1.2h', change: '-12%', icon: Clock },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>
                    {stat.change}
                  </span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription>Your team's latest updates and changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { user: 'Sarah Johnson', action: 'deployed to production', project: 'API v2', time: '2m ago' },
              { user: 'Mike Peters', action: 'created a pull request', project: 'Dashboard', time: '1h ago' },
              { user: 'Emma Wilson', action: 'commented on issue #234', project: 'Mobile App', time: '3h ago' },
              { user: 'David Brown', action: 'merged branch feature/auth', project: 'Backend', time: '5h ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-black border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm text-white">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-zinc-400"> {activity.action}</span>
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs">
                      {activity.project}
                    </Badge>
                    <span className="text-xs text-zinc-500">{activity.time}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="lg:col-span-3 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
            <CardDescription>Your most recent work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Marketing Website', status: 'In Progress', progress: 75, color: 'bg-blue-500' },
              { name: 'Mobile Application', status: 'Review', progress: 90, color: 'bg-emerald-500' },
              { name: 'Dashboard Redesign', status: 'Planning', progress: 25, color: 'bg-yellow-500' },
              { name: 'API Integration', status: 'Testing', progress: 60, color: 'bg-purple-500' },
            ].map((project, index) => (
              <button
                key={index}
                className="w-full p-3 rounded-lg bg-black border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{project.name}</p>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs">
                    {project.status}
                  </Badge>
                  <span className="text-xs text-zinc-500">{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${project.color} rounded-full transition-all duration-300`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

