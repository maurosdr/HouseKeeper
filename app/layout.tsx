import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HouseKeeper - Administração Doméstica',
  description: 'Sistema completo para administrar sua casa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">
                    Home
                  </Link>
                  <Link href="/financas" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">
                    Finanças
                  </Link>
                  <Link href="/limpeza" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">
                    Agenda de Limpeza
                  </Link>
                  <Link href="/estoque" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">
                    Compras e Estoque
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
