import Link from 'next/link'
import { Wallet, Calendar, ShoppingCart } from 'lucide-react'

export default function Home() {
  return (
    <div className="px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          HouseKeeper
        </h1>
        <p className="text-xl text-gray-600">
          Sistema completo para administração doméstica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Link href="/financas">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Wallet className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Finanças</h2>
              <p className="text-gray-600">
                Gerencie as contas mensais da sua casa com uploads de PDF e controle de pagamentos
              </p>
            </div>
          </div>
        </Link>

        <Link href="/limpeza">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Calendar className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agenda de Limpeza</h2>
              <p className="text-gray-600">
                Organize a limpeza da casa com calendário e responsáveis
              </p>
            </div>
          </div>
        </Link>

        <Link href="/estoque">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <ShoppingCart className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compras e Estoque</h2>
              <p className="text-gray-600">
                Controle o estoque e gere lista de compras em PDF
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
