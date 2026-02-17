import React from 'react';

export default function Footer() {
  return (
    <footer className="h-12 bg-black border-t border-zinc-800 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-6">
        <p className="text-xs text-zinc-500">
          © 2024 Lyca Technologies Pvt Ltd.
        </p>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
