"use client"

import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function ReduxProvider({
                                          children,
                                      }: {
    children: React.ReactNode
}) {
    return (
        <Provider store={store}>
            <PersistGate
                loading={
                    <div className="flex items-center justify-center h-screen w-screen">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                }
                persistor={persistor}
            >
                {children}
            </PersistGate>
        </Provider>
    )
}