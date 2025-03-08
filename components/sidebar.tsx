"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, GraduationCap, User, Key, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin"] },
  { name: "Families", href: "/families", icon: Users, roles: ["super_admin"] },
  { name: "FRAIT Training", href: "/training", icon: GraduationCap, roles: ["super_admin", "restricted_user"] },
]

const userNavigation = [
  { name: "My profile", href: "/profile", icon: User, roles: ["super_admin", "restricted_user"] },
  { name: "Change your password", href: "/change-password", icon: Key, roles: ["super_admin", "restricted_user"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <nav className="p-4 space-y-8">
        <div className="space-y-2">
          {navigation
              .filter((item) => user && item.roles.includes(user.role))
              .map((item) => (
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
          {userNavigation
              .filter((item) => user && item.roles.includes(user.role))
              .map((item) => (
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

