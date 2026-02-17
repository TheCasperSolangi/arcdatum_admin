'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  return (
    <header className="h-14 bg-black border-b border-zinc-800 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 h-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 w-64"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-900">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}