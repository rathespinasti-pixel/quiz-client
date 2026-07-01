"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import PageLoading from "@/components/page-loading"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <PageLoading />
  }

  if (!user) return null

  return <>{children}</>
}
