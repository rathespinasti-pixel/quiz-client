"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, FolderOpen, Shield, Users } from "lucide-react"

import ProtectedRoute from "@/components/ProtectedRoute"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role !== "admin") router.push("/dashboard")
  }, [user, loading, router])

  if (loading || user?.role !== "admin") return null

  const links = [
    { href: "/admin/users", icon: Users, title: "Manage Users", desc: "View and delete users" },
    { href: "/admin/categories", icon: FolderOpen, title: "Manage Categories", desc: "Create, edit, delete categories" },
    { href: "/admin/quizzes", icon: BookOpen, title: "Manage Quizzes", desc: "View and delete any quiz" },
  ]

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Shield />
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <l.icon className="size-5" />
                    {l.title}
                  </CardTitle>
                  <CardDescription>{l.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
