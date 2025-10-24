import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { LayoutDashboard, Upload, LogOut, Repeat, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function SidebarNav() {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const switchRole = useAppStore((state) => state.switchRole);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full ${isActive ? 'bg-papersense-primary/10 text-papersense-primary dark:bg-primary/20 dark:text-primary-foreground' : ''}`;
  return (
    <Sidebar>
      <SidebarHeader>
        <NavLink to="/app/dashboard" className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 rounded-md transition-colors">
          <BookOpen className="w-8 h-8 text-papersense-primary" />
          <span className="text-xl font-bold text-papersense-primary">PaperSense</span>
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to="/app/dashboard" className={navLinkClass}>
              <SidebarMenuButton>
                <LayoutDashboard /> <span>Dashboard</span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <NavLink to="/app/upload" className={navLinkClass}>
              <SidebarMenuButton>
                <Upload /> <span>Upload Paper</span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
        <div></div>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.name}`} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={switchRole}>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Switch to {user?.role === 'teacher' ? 'Student' : 'Teacher'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}