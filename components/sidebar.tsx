"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, GraduationCap, User, Key, LogOut, Settings, UserCog } from "lucide-react"
import { useAuth, UserRole } from "@/lib/auth-context"

// Define navigation items with their roles
const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    roles: [UserRole.HEALTH_VISITOR, UserRole.ASSISTANT_HEALTH_VISITOR, UserRole.MANAGER, UserRole.ADMIN] 
  },
  { 
    name: "Families", 
    href: "/families", 
    icon: Users, 
    roles: [UserRole.HEALTH_VISITOR, UserRole.ASSISTANT_HEALTH_VISITOR, UserRole.MANAGER, UserRole.ADMIN] 
  },
  { 
    name: "FRAIT Training", 
    href: "/training", 
    icon: GraduationCap, 
    roles: [UserRole.HEALTH_VISITOR, UserRole.ASSISTANT_HEALTH_VISITOR, UserRole.MANAGER, UserRole.ADMIN] 
  },
  { 
    name: "User Management", 
    href: "/user-management", 
    icon: UserCog, 
    roles: [UserRole.ADMIN, UserRole.MANAGER] 
  },
  { 
    name: "System Settings", 
    href: "/settings", 
    icon: Settings, 
    roles: [UserRole.ADMIN] 
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role as UserRole)
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <nav className="p-4 space-y-8">
        <div className="space-y-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User area</p>
          {user && (
            <div className="px-3 py-2 text-sm text-gray-700">
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          )}
          <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}


