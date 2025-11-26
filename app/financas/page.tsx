'use client'

import { useState } from 'react'
import { Upload, Trash2, CheckCircle, Circle } from 'lucide-react'

interface Conta {
  id: string
  tipo: string
  valor: number
  vencimento: string
  pago: boolean
  pdfUrl?: string
  pdfNome?: string
}

const tiposPagamento = [
  'Luz',
  'Água',
  'Condomínio',
  'Internet',
  'Aluguel',
  'Gás',
  'Telefone',
  'IPTU',
  'Supermercado',
  'Outros'
]

export default function Financas() {
  const [contas, setContas] = useState<Conta[]>([])
  const [tipo, setTipo] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')

  const adicionarConta = () => {
    if (!tipo || !valor || !vencimento) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const novaConta: Conta = {
      id: Date.now().toString(),
      tipo,
      valor: parseFloat(valor),
      vencimento,
      pago: false
    }

    setContas([...contas, novaConta])
    setTipo('')
    setValor('')
    setVencimento('')
  }

  const uploadPDF = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file)
      setContas(contas.map(conta =>
        conta.id === id
          ? { ...conta, pdfUrl: url, pdfNome: file.name, pago: true }
          : conta
      ))
    } else {
      alert('Por favor, selecione um arquivo PDF')
    }
  }

  const removerConta = (id: string) => {
    setContas(contas.filter(conta => conta.id !== id))
  }

  const totalContas = contas.reduce((sum, conta) => sum + conta.valor, 0)
  const totalPago = contas.filter(c => c.pago).reduce((sum, conta) => sum + conta.valor, 0)
  const totalPendente = totalContas - totalPago

  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Finanças</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total de Contas</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalContas.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalPago.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Pendente</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalPendente.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Nova Conta</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pagamento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {tiposPagamento.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={adicionarConta}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Contas do Mês</h2>

        {contas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma conta cadastrada ainda
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contas.map((conta) => (
              <div
                key={conta.id}
                className={`border-2 rounded-lg p-4 ${
                  conta.pago
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {conta.pago ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                    <h3 className="font-semibold text-lg">{conta.tipo}</h3>
                  </div>
                  <button
                    onClick={() => removerConta(conta.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-semibold">
                      R$ {conta.valor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vencimento:</span>
                    <span className="font-semibold">
                      {new Date(conta.vencimento + 'T00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {conta.pdfNome ? (
                  <div className="bg-white rounded p-2 border border-green-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">
                        {conta.pdfNome}
                      </span>
                      <a
                        href={conta.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Ver PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => uploadPDF(conta.id, e)}
                      className="hidden"
                      id={`pdf-${conta.id}`}
                    />
                    <label
                      htmlFor={`pdf-${conta.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload PDF
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
