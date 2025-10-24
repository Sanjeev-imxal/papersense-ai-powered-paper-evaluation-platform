import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from './SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen bg-papersense-secondary/50 dark:bg-background">
        <SidebarNav />
        <SidebarInset className="flex-1 transition-all duration-300 ease-in-out">
          <div className="absolute left-2 top-2 z-20">
            <SidebarTrigger />
          </div>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="py-8 md:py-10 lg:py-12">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
export default MainLayout;