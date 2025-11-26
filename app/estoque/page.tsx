'use client'

import { useState } from 'react'
import { Plus, Trash2, FileDown, Package, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'

interface ItemEstoque {
  id: string
  nome: string
  quantidade: number
  estoqueMinimo: number
  unidade: string
}

const unidadesMedida = ['Un', 'Kg', 'g', 'L', 'ml', 'Caixa', 'Pacote']

const itensComuns = [
  'Arroz',
  'Feijão',
  'Açúcar',
  'Sal',
  'Óleo',
  'Café',
  'Macarrão',
  'Leite',
  'Ovos',
  'Farinha de Trigo',
  'Papel Higiênico',
  'Sabão em Pó',
  'Detergente',
  'Esponja',
  'Água Sanitária',
  'Desinfetante',
  'Shampoo',
  'Sabonete',
  'Pasta de Dente',
  'Papel Toalha'
]

export default function Estoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([])
  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  const [unidade, setUnidade] = useState('Un')
  const [itemPersonalizado, setItemPersonalizado] = useState('')

  const adicionarItem = () => {
    const nomeItem = itemPersonalizado || nome

    if (!nomeItem || !quantidade || !estoqueMinimo || !unidade) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const novoItem: ItemEstoque = {
      id: Date.now().toString(),
      nome: nomeItem,
      quantidade: parseFloat(quantidade),
      estoqueMinimo: parseFloat(estoqueMinimo),
      unidade
    }

    setItens([...itens, novoItem])
    setNome('')
    setItemPersonalizado('')
    setQuantidade('')
    setEstoqueMinimo('')
    setUnidade('Un')
  }

  const atualizarQuantidade = (id: string, novaQuantidade: number) => {
    setItens(itens.map(item =>
      item.id === id ? { ...item, quantidade: novaQuantidade } : item
    ))
  }

  const removerItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id))
  }

  const itensFaltantes = itens.filter(item => item.quantidade < item.estoqueMinimo)

  const gerarPDFListaCompras = () => {
    if (itensFaltantes.length === 0) {
      alert('Não há itens faltantes para gerar o PDF')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Lista de Compras', 20, 20)

    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30)

    doc.setFontSize(11)
    let y = 45

    doc.text('Itens Necessários:', 20, y)
    y += 10

    itensFaltantes.forEach((item, index) => {
      const quantidadeNecessaria = item.estoqueMinimo - item.quantidade
      const texto = `${index + 1}. ${item.nome} - ${quantidadeNecessaria.toFixed(1)} ${item.unidade}`

      if (y > 270) {
        doc.addPage()
        y = 20
      }

      doc.text(texto, 25, y)
      y += 7
    })

    y += 10
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(10)
    doc.text(`Total de itens: ${itensFaltantes.length}`, 20, y)

    doc.save(`lista-compras-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Compras e Estoque
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-blue-600">{itens.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Itens em Estoque</p>
                <p className="text-2xl font-bold text-green-600">
                  {itens.filter(i => i.quantidade >= i.estoqueMinimo).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Itens Faltantes</p>
                <p className="text-2xl font-bold text-red-600">
                  {itensFaltantes.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Item</h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Comum
              </label>
              <select
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setItemPersonalizado('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione ou digite abaixo...</option>
                {itensComuns.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou Digite Novo Item
              </label>
              <input
                type="text"
                value={itemPersonalizado}
                onChange={(e) => {
                  setItemPersonalizado(e.target.value)
                  setNome('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do item personalizado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Atual
              </label>
              <input
                type="number"
                step="0.1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                step="0.1"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {unidadesMedida.map((un) => (
                  <option key={un} value={un}>{un}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 flex items-end">
              <button
                onClick={adicionarItem}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {itensFaltantes.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">
                Itens Faltantes ({itensFaltantes.length})
              </h2>
            </div>
            <button
              onClick={gerarPDFListaCompras}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Gerar PDF da Lista de Compras
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itensFaltantes.map((item) => (
              <div key={item.id} className="bg-white border border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{item.nome}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Atual:</span>
                    <span className="font-medium">
                      {item.quantidade} {item.unidade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mínimo:</span>
                    <span className="font-medium">
                      {item.estoqueMinimo} {item.unidade}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-red-600 font-medium">Falta:</span>
                    <span className="font-bold text-red-600">
                      {(item.estoqueMinimo - item.quantidade).toFixed(1)} {item.unidade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Estoque Completo</h2>

        {itens.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum item cadastrado ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itens.map((item) => (
                  <tr key={item.id} className={item.quantidade < item.estoqueMinimo ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={item.quantidade}
                        onChange={(e) => atualizarQuantidade(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-600">{item.unidade}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.estoqueMinimo} {item.unidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantidade >= item.estoqueMinimo ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          OK
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Faltando
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removerItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
