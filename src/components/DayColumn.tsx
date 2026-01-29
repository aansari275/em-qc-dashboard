import { format, isPast, startOfDay } from 'date-fns'
import { InspectionCard } from './InspectionCard'
import type { InspectionSchedule, CompanyCode } from '../types'
import { cn } from '../lib/utils'

interface DayColumnProps {
  date: Date
  inspections: InspectionSchedule[]
  isToday: boolean
  onInspectionClick: (inspection: InspectionSchedule) => void
  companyFilter: CompanyCode | 'all'
}

export function DayColumn({
  date,
  inspections,
  isToday,
  onInspectionClick,
  companyFilter,
}: DayColumnProps) {
  const isPastDay = isPast(startOfDay(date)) && !isToday
  const dayName = format(date, 'EEE')
  const dayNumber = format(date, 'd')
  const monthName = format(date, 'MMM')

  // Sort inspections: scheduled first, then by buyer code
  const sortedInspections = [...inspections].sort((a, b) => {
    if (a.status === 'scheduled' && b.status !== 'scheduled') return -1
    if (a.status !== 'scheduled' && b.status === 'scheduled') return 1
    return a.buyerCode.localeCompare(b.buyerCode)
  })

  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length
  const completedCount = inspections.filter(i => i.status === 'completed').length

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden flex flex-col min-h-[200px] bg-white transition-all",
        isToday && "ring-2 ring-emerald-500 border-emerald-200",
        isPastDay && "opacity-60",
        !isToday && !isPastDay && "border-slate-200 hover:border-slate-300"
      )}
    >
      {/* Day Header */}
      <div
        className={cn(
          "px-3 py-2 border-b flex items-center justify-between",
          isToday
            ? "bg-emerald-50 border-emerald-100"
            : isPastDay
            ? "bg-slate-50 border-slate-100"
            : "bg-white border-slate-100"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium uppercase",
              isToday ? "text-emerald-600" : "text-slate-500"
            )}
          >
            {dayName}
          </span>
          <span
            className={cn(
              "text-sm font-bold",
              isToday ? "text-emerald-700" : "text-slate-700"
            )}
          >
            {dayNumber}
          </span>
          {(date.getDate() === 1 || isToday) && (
            <span className="text-xs text-slate-400">{monthName}</span>
          )}
        </div>

        {/* Counts */}
        {inspections.length > 0 && (
          <div className="flex items-center gap-1">
            {scheduledCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center">
                {scheduledCount}
              </span>
            )}
            {completedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center">
                {completedCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Inspections List */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {sortedInspections.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-slate-300 text-sm">—</span>
          </div>
        ) : (
          sortedInspections.map(inspection => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection}
              onClick={() => onInspectionClick(inspection)}
              showCompany={companyFilter === 'all'}
            />
          ))
        )}
      </div>
    </div>
  )
}
