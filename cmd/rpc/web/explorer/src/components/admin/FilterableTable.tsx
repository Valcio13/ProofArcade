import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export interface Column<T> {
  key: string
  label: string
  render: (item: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'number' | 'select'
  filterOptions?: string[]
}

interface FilterableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  exportFilename?: string
}

export default function FilterableTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  exportFilename = 'export',
}: FilterableTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Handle filtering
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }))
  }

  // Apply filters and sorting
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const column = columns.find((c) => c.key === key)
        if (column) {
          result = result.filter((item) => {
            const cellValue = String(column.render(item))
            return cellValue.toLowerCase().includes(value.toLowerCase())
          })
        }
      }
    })

    // Apply sorting
    if (sortColumn) {
      const column = columns.find((c) => c.key === sortColumn)
      if (column) {
        result.sort((a, b) => {
          const aValue = String(column.render(a))
          const bValue = String(column.render(b))
          
          const comparison = aValue.localeCompare(bValue, undefined, { numeric: true })
          return sortDirection === 'asc' ? comparison : -comparison
        })
      }
    }

    return result
  }, [data, filters, sortColumn, sortDirection, columns])

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map((c) => c.label).join(',')
    const rows = processedData.map((item) =>
      columns.map((c) => {
        const value = String(c.render(item))
        // Escape commas and quotes
        return `"${value.replace(/"/g, '""')}"`
      }).join(',')
    )
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-black/20 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
          {Object.keys(filters).some((k) => filters[k]) && (
            <button
              onClick={() => setFilters({})}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            {processedData.length} {processedData.length === 1 ? 'row' : 'rows'}
          </span>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-black/20 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-lg border border-white/10 bg-black/20 p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {columns.filter((c) => c.filterable !== false).map((column) => (
              <div key={column.key}>
                <label className="block text-xs text-slate-400 mb-1">{column.label}</label>
                <input
                  type="text"
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  placeholder={`Filter ${column.label.toLowerCase()}...`}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30 border-b border-white/5">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                  >
                    {column.sortable !== false ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center space-x-1 hover:text-white transition-colors"
                      >
                        <span>{column.label}</span>
                        {sortColumn === column.key && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {sortDirection === 'asc' ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            )}
                          </svg>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedData.length > 0 ? (
                processedData.map((item) => (
                  <tr key={keyExtractor(item)} className="hover:bg-white/5 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
