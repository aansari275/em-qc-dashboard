import { useState, useMemo } from 'react'
import { format, startOfDay, addDays, isSameDay } from 'date-fns'
import { useInspections, useOverdueInspections } from '../hooks/useApi'
import { DayColumn } from './DayColumn'
import { MobileListView } from './MobileListView'
import { InspectionDetailModal } from './InspectionDetailModal'
import type { InspectionSchedule, CompanyCode } from '../types'
import { Loader2, Calendar, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { cn } from '../lib/utils'

interface InspectionCalendarProps {
  company: CompanyCode | 'all'
}

export function InspectionCalendar({ company }: InspectionCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedInspection, setSelectedInspection] = useState<InspectionSchedule | null>(null)

  // Generate 14-day range starting from current week offset
  const dateRange = useMemo(() => {
    const today = startOfDay(new Date())
    const startDate = addDays(today, weekOffset * 7)
    const dates: Date[] = []

    for (let i = 0; i < 14; i++) {
      dates.push(addDays(startDate, i))
    }

    return dates
  }, [weekOffset])

  const startDate = format(dateRange[0], 'yyyy-MM-dd')
  const endDate = format(dateRange[dateRange.length - 1], 'yyyy-MM-dd')

  const { data: inspections = [], isLoading, refetch, isFetching } = useInspections(
    company,
    startDate,
    endDate
  )

  // Fetch overdue inspections (past dates, still scheduled)
  const { data: overdueInspections = [] } = useOverdueInspections(company)

  // Group inspections by date
  const inspectionsByDate = useMemo(() => {
    const grouped: Record<string, InspectionSchedule[]> = {}

    dateRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      grouped[dateStr] = []
    })

    inspections.forEach(inspection => {
      if (grouped[inspection.inspectionDate]) {
        grouped[inspection.inspectionDate].push(inspection)
      }
    })

    return grouped
  }, [inspections, dateRange])

  // Stats
  const stats = useMemo(() => {
    const scheduled = inspections.filter(i => i.status === 'scheduled').length
    const completed = inspections.filter(i => i.status === 'completed').length
    const overdue = overdueInspections.length
    const total = inspections.length

    return { scheduled, completed, overdue, total }
  }, [inspections, overdueInspections])

  // Split into two weeks
  const week1 = dateRange.slice(0, 7)
  const week2 = dateRange.slice(7, 14)

  const today = startOfDay(new Date())

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 md:px-4 md:py-3 border-b border-slate-200 bg-white gap-2">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className={cn(
                "px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors",
                weekOffset === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Date Range */}
          <div className="hidden sm:flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-sm">
              {format(dateRange[0], 'MMM d')} - {format(dateRange[13], 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
          {/* Stats */}
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            {stats.overdue > 0 && (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-bold">{stats.overdue}</span>
                <span className="hidden md:inline">overdue</span>
              </span>
            )}
            <span className="text-slate-500">
              <span className="font-semibold text-blue-600">{stats.scheduled}</span>
              <span className="hidden md:inline"> scheduled</span>
            </span>
            <span className="text-slate-500">
              <span className="font-semibold text-green-600">{stats.completed}</span>
              <span className="hidden md:inline"> completed</span>
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 md:p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Mobile Date Range - shown only on small screens */}
      <div className="sm:hidden flex items-center justify-center gap-2 py-2 bg-slate-50 border-b text-xs text-slate-600">
        <Calendar className="w-3 h-3" />
        <span>{format(dateRange[0], 'MMM d')} - {format(dateRange[13], 'MMM d, yyyy')}</span>
      </div>

      {/* Mobile/Tablet View: List (< 1024px) */}
      <div className="flex-1 overflow-hidden lg:hidden">
        <MobileListView
          dates={dateRange}
          inspections={inspections}
          overdueInspections={overdueInspections}
          companyFilter={company}
          onInspectionClick={setSelectedInspection}
        />
      </div>

      {/* Desktop View: Grid (≥ 1024px) */}
      <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          <div className="space-y-4">
            {/* Week 1 */}
            <div className="grid grid-cols-7 gap-2">
              {week1.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayInspections = inspectionsByDate[dateStr] || []
                const isCurrentDay = isSameDay(date, today)

                return (
                  <DayColumn
                    key={dateStr}
                    date={date}
                    inspections={dayInspections}
                    isToday={isCurrentDay}
                    onInspectionClick={setSelectedInspection}
                    companyFilter={company}
                  />
                )
              })}
            </div>

            {/* Week 2 */}
            <div className="grid grid-cols-7 gap-2">
              {week2.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayInspections = inspectionsByDate[dateStr] || []
                const isCurrentDay = isSameDay(date, today)

                return (
                  <DayColumn
                    key={dateStr}
                    date={date}
                    inspections={dayInspections}
                    isToday={isCurrentDay}
                    onInspectionClick={setSelectedInspection}
                    companyFilter={company}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInspection && (
        <InspectionDetailModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  )
}
