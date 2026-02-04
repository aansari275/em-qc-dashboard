import { useState } from 'react'
import { format, isToday, isTomorrow } from 'date-fns'
import { ChevronDown, ChevronRight, Calendar, AlertTriangle } from 'lucide-react'
import { InspectionCard } from './InspectionCard'
import type { InspectionSchedule, CompanyCode } from '../types'

interface MobileListViewProps {
  dates: Date[]
  inspections: InspectionSchedule[]
  overdueInspections?: InspectionSchedule[]
  companyFilter: CompanyCode | 'all'
  onInspectionClick: (inspection: InspectionSchedule) => void
}

export function MobileListView({
  dates,
  inspections,
  overdueInspections = [],
  companyFilter,
  onInspectionClick
}: MobileListViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(() => {
    // Start with today and overdue expanded
    const today = format(new Date(), 'yyyy-MM-dd')
    const initial = new Set([today])
    if (overdueInspections.length > 0) {
      initial.add('overdue')
    }
    return initial
  })
  const [showMiniCalendar, setShowMiniCalendar] = useState(true)

  // Group inspections by date
  const inspectionsByDate = dates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayInspections = inspections.filter(i => i.inspectionDate === dateStr)
    return {
      date,
      dateStr,
      inspections: dayInspections
    }
  })

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(dateStr)) {
        next.delete(dateStr)
      } else {
        next.add(dateStr)
      }
      return next
    })
  }

  const scrollToDate = (dateStr: string) => {
    // Expand the date first
    setExpandedDates(prev => new Set(prev).add(dateStr))
    // Scroll to the element
    setTimeout(() => {
      const element = document.getElementById(`date-${dateStr}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mini Calendar Toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
        <button
          onClick={() => setShowMiniCalendar(!showMiniCalendar)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 tap-highlight"
        >
          <Calendar className="w-4 h-4" />
          <span>Week Overview</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMiniCalendar ? '' : '-rotate-90'}`} />
        </button>
        <span className="text-xs text-slate-500">
          Tap day to jump
        </span>
      </div>

      {/* Mini Calendar Strip */}
      {showMiniCalendar && (
        <div className="flex overflow-x-auto px-2 py-3 bg-white border-b gap-1 hide-scrollbar">
          {inspectionsByDate.map(({ date, dateStr, inspections: dayInspections }) => {
            const hasInspections = dayInspections.length > 0
            const isCurrentDay = isToday(date)
            const isExpanded = expandedDates.has(dateStr)
            const scheduledCount = dayInspections.filter(i => i.status === 'scheduled').length
            const completedCount = dayInspections.filter(i => i.status === 'completed').length

            return (
              <button
                key={dateStr}
                onClick={() => scrollToDate(dateStr)}
                className={`flex-shrink-0 w-14 py-2 rounded-lg text-center transition-all tap-highlight ${
                  isCurrentDay
                    ? 'bg-teal-600 text-white'
                    : isExpanded
                    ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-300'
                    : hasInspections
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-medium opacity-75">
                  {format(date, 'EEE')}
                </div>
                <div className="text-lg font-bold leading-tight">
                  {format(date, 'd')}
                </div>
                {hasInspections ? (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {scheduledCount > 0 && (
                      <span className={`text-[10px] font-bold px-1 rounded ${
                        isCurrentDay ? 'bg-white/30' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {scheduledCount}
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className={`text-[10px] font-bold px-1 rounded ${
                        isCurrentDay ? 'bg-white/30' : 'bg-green-100 text-green-700'
                      }`}>
                        ✓{completedCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] mt-1 opacity-50">—</div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Inspection List */}
      <div className="flex-1 overflow-y-auto pb-4 smooth-scroll">
        {/* Overdue Section */}
        {overdueInspections.length > 0 && (
          <div id="date-overdue">
            {/* Overdue Header */}
            <button
              onClick={() => toggleDate('overdue')}
              className="w-full sticky top-0 z-10 px-3 py-2.5 flex items-center justify-between tap-highlight bg-red-600 text-white"
            >
              <div className="flex items-center gap-2">
                {expandedDates.has('overdue') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <span className="font-bold">Overdue</span>
                  <span className="ml-2 text-sm text-red-100">
                    Needs action
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                {overdueInspections.length} pending
              </span>
            </button>

            {/* Overdue Inspections */}
            {expandedDates.has('overdue') && (
              <div className="px-3 py-2 space-y-2 bg-red-50">
                {overdueInspections.map(inspection => (
                  <div
                    key={inspection.id}
                    className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden"
                  >
                    <InspectionCard
                      inspection={inspection}
                      onClick={() => onInspectionClick(inspection)}
                      showCompany={companyFilter === 'all'}
                      variant="mobile"
                      isOverdue
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Date Sections */}
        {inspectionsByDate.map(({ date, dateStr, inspections: dayInspections }) => {
          const isExpanded = expandedDates.has(dateStr)
          const isCurrentDay = isToday(date)
          const hasInspections = dayInspections.length > 0
          const scheduledCount = dayInspections.filter(i => i.status === 'scheduled').length
          const completedCount = dayInspections.filter(i => i.status === 'completed').length

          // Skip days with no inspections unless it's today
          if (!hasInspections && !isCurrentDay) return null

          return (
            <div key={dateStr} id={`date-${dateStr}`}>
              {/* Date Header - Clickable to collapse/expand */}
              <button
                onClick={() => toggleDate(dateStr)}
                className={`w-full sticky top-0 z-10 px-3 py-2.5 flex items-center justify-between tap-highlight ${
                  isCurrentDay
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-bold text-lg">{format(date, 'd')}</span>
                  <div>
                    <span className="font-semibold">{getDateLabel(date)}</span>
                    <span className={`ml-2 text-sm ${isCurrentDay ? 'text-teal-100' : 'text-slate-500'}`}>
                      {format(date, 'MMM')}
                    </span>
                  </div>
                </div>

                {/* Inspection count badges */}
                <div className="flex items-center gap-1.5">
                  {scheduledCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isCurrentDay
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {scheduledCount} pending
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isCurrentDay
                        ? 'bg-white/20 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {completedCount} done
                    </span>
                  )}
                  {!hasInspections && (
                    <span className={`text-xs ${isCurrentDay ? 'text-teal-200' : 'text-slate-400'}`}>
                      No inspections
                    </span>
                  )}
                </div>
              </button>

              {/* Inspections List - Collapsible */}
              {isExpanded && (
                <div className="px-3 py-2 space-y-2 bg-white">
                  {dayInspections.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">
                      No inspections scheduled for today
                    </p>
                  ) : (
                    dayInspections.map(inspection => (
                      <div
                        key={inspection.id}
                        className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                      >
                        <InspectionCard
                          inspection={inspection}
                          onClick={() => onInspectionClick(inspection)}
                          showCompany={companyFilter === 'all'}
                          variant="mobile"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
