import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ReduxProvider from "@/components/redux-provider"
import AuthWrapper from "@/components/auth-wrapper"

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
            <ReduxProvider>
                <AuthWrapper>
                    {children}
                    <Toaster />
                </AuthWrapper>
            </ReduxProvider>
        </body>
        </html>
    )
}


