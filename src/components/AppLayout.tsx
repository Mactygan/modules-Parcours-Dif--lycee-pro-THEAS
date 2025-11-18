import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from './Logo';
import UserNav from './UserNav';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 h-20 bg-background border-b flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="p-2"> {/* Ajouter des marges ou paddings autour du logo */}
                <Logo />
              </div>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
