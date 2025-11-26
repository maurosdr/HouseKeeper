'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Plus, Trash2, User } from 'lucide-react'

interface TarefaLimpeza {
  id: string
  responsavel: string
  data: Date
  recorrencia: string
  local: string
}

const opcoesRecorrencia = [
  'Única',
  'Diária',
  'Semanal',
  'Quinzenal',
  'Mensal'
]

const locaisObjetos = [
  'Sala',
  'Cozinha',
  'Banheiro',
  'Quarto Principal',
  'Quarto 2',
  'Quarto 3',
  'Área de Serviço',
  'Varanda',
  'Garagem',
  'Geladeira',
  'Fogão',
  'Forno',
  'Janelas',
  'Armários',
  'Outro'
]

export default function Limpeza() {
  const [tarefas, setTarefas] = useState<TarefaLimpeza[]>([])
  const [responsavel, setResponsavel] = useState('')
  const [data, setData] = useState(new Date())
  const [recorrencia, setRecorrencia] = useState('')
  const [local, setLocal] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const adicionarTarefa = () => {
    if (!responsavel || !recorrencia || !local) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const novaTarefa: TarefaLimpeza = {
      id: Date.now().toString(),
      responsavel,
      data,
      recorrencia,
      local
    }

    setTarefas([...tarefas, novaTarefa])
    setResponsavel('')
    setRecorrencia('')
    setLocal('')
    setData(new Date())
  }

  const removerTarefa = (id: string) => {
    setTarefas(tarefas.filter(tarefa => tarefa.id !== id))
  }

  const getTarefasParaData = (date: Date) => {
    return tarefas.filter(tarefa => {
      const tarefaData = new Date(tarefa.data)
      return (
        tarefaData.getDate() === date.getDate() &&
        tarefaData.getMonth() === date.getMonth() &&
        tarefaData.getFullYear() === date.getFullYear()
      )
    })
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const tarefasDoDia = getTarefasParaData(date)
      if (tarefasDoDia.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )
      }
    }
    return null
  }

  const tarefasSelecionadas = selectedDate ? getTarefasParaData(selectedDate) : []

  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Agenda de Limpeza
        </h1>

        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Adicionar Nova Tarefa de Limpeza
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável
              </label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={data.toISOString().split('T')[0]}
                onChange={(e) => setData(new Date(e.target.value + 'T00:00'))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recorrência
              </label>
              <select
                value={recorrencia}
                onChange={(e) => setRecorrencia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {opcoesRecorrencia.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local/Objeto
              </label>
              <select
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {locaisObjetos.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={adicionarTarefa}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Calendário</h2>
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate || data}
              tileContent={tileContent}
              locale="pt-BR"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedDate
                ? `Tarefas para ${selectedDate.toLocaleDateString('pt-BR')}`
                : 'Selecione uma data no calendário'}
            </h2>

            {selectedDate && (
              <div className="space-y-3">
                {tarefasSelecionadas.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma tarefa para esta data
                  </p>
                ) : (
                  tarefasSelecionadas.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">
                              {tarefa.responsavel}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Local:</span>
                              <span className="font-medium">{tarefa.local}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Recorrência:</span>
                              <span className="font-medium">
                                {tarefa.recorrencia}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removerTarefa(tarefa.id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Todas as Tarefas</h2>

        {tarefas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma tarefa cadastrada ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local/Objeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorrência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tarefas.map((tarefa) => (
                  <tr key={tarefa.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarefa.responsavel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarefa.local}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarefa.data.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarefa.recorrencia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removerTarefa(tarefa.id)}
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
