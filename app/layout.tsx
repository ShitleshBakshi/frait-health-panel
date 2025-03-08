import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import StoreProvider from "./StoreProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "FRAIT - Health Visitor Control Panel",
    description: "Health visitor control panel for FRAIT system",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <StoreProvider>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
            </StoreProvider>
        </body>
        </html>
    )
}

