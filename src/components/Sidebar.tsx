import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Plus,
  LogOut,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { user, logout, isBikram, isSuperAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="bg-primary p-2 rounded-lg">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">QWB Admin</h2>
          <p className="text-sm text-muted-foreground">Question Wala Bank</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary-light p-2 rounded-full">
            <span className="text-sm font-medium text-primary">
              {user?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {isBikram ? 'Partner (30% Share)' : isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Dashboard - Always visible */}
        <NavLink
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        
        {/* Add Orders - Only for Super Admin */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground">
            <Plus className="h-4 w-4" />
            Add Orders
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}