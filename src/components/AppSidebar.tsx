import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Calendar, BookOpen, User, Users, LineChart } from "lucide-react";

const AppSidebar: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const enseignantItems = [
    {
      title: "Vue calendrier",
      path: "/calendrier",
      icon: Calendar,
    },
    {
      title: "Mes réservations",
      path: "/reservations",
      icon: BookOpen,
    },
    {
      title: "Profil",
      path: "/profil",
      icon: User,
    },
  ];

  const adminItems = [
    {
      title: "Gestion utilisateurs",
      path: "/utilisateurs",
      icon: Users,
    },
    {
      title: "Supervision planning",
      path: "/supervision",
      icon: LineChart,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enseignantItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    active={isActive(item.path)}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasRole('admin') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      active={isActive(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
