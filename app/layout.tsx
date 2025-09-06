import './globals.css'
import QueryProvider from './components/query-provider'
import { ToastProvider } from './components/toast-provider'
import { NavigationHeader } from './components/navigation-header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <NavigationHeader />
          <main className="min-h-screen">
            {children}
          </main>
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  )
}
