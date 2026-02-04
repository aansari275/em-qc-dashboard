import type { InspectionSchedule } from '../types'
import { cn, formatOpsNo, getStatusColor, getCompanyBadgeStyle } from '../lib/utils'
import { Check, Clock, RotateCcw, X, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface InspectionCardProps {
  inspection: InspectionSchedule
  onClick: () => void
  showCompany?: boolean
  variant?: 'compact' | 'mobile'
  isOverdue?: boolean
}

export function InspectionCard({
  inspection,
  onClick,
  showCompany = false,
  variant = 'compact',
  isOverdue = false
}: InspectionCardProps) {
  const statusIcon = {
    scheduled: <Clock className="w-3 h-3" />,
    completed: <Check className="w-3 h-3" />,
    rescheduled: <RotateCcw className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
  }

  // Mobile variant - horizontal card with more info
  if (variant === 'mobile') {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-3 transition-all tap-highlight",
          isOverdue && "bg-red-50"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Main Info */}
          <div className="flex-1 min-w-0">
            {/* OPS Number */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base text-slate-900">
                {formatOpsNo(inspection.opsNo)}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>

            {/* Buyer + Company */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {inspection.buyerCode}
              </span>
              {showCompany && (
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    getCompanyBadgeStyle(inspection.inspectionCompany)
                  )}
                >
                  {inspection.inspectionCompany}
                </span>
              )}
            </div>

            {/* Quantities */}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-medium">{inspection.totalPcs} pcs</span>
              <span className="font-medium">{inspection.totalSqm?.toFixed(1)} sqm</span>
              {isOverdue && (
                <span className="text-xs text-red-500">
                  Due: {format(new Date(inspection.inspectionDate), 'MMM d')}
                </span>
              )}
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                inspection.status === 'scheduled' && "bg-blue-100 text-blue-700",
                inspection.status === 'completed' && "bg-green-100 text-green-700",
                inspection.status === 'rescheduled' && "bg-amber-100 text-amber-700",
                inspection.status === 'cancelled' && "bg-slate-100 text-slate-500"
              )}
            >
              {statusIcon[inspection.status]}
              <span className="capitalize">{inspection.status}</span>
            </span>
          </div>
        </div>
      </button>
    )
  }

  // Compact variant - for desktop grid view
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-lg border transition-all",
        "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        getStatusColor(inspection.status)
      )}
    >
      {/* OPS Number & Status */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-semibold text-xs truncate">
          {formatOpsNo(inspection.opsNo)}
        </span>
        <span className="flex-shrink-0">
          {statusIcon[inspection.status]}
        </span>
      </div>

      {/* Buyer Code */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/50">
          {inspection.buyerCode}
        </span>
        {showCompany && (
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded",
              getCompanyBadgeStyle(inspection.inspectionCompany)
            )}
          >
            {inspection.inspectionCompany}
          </span>
        )}
      </div>

      {/* Quantities */}
      <div className="flex items-center gap-2 text-[10px] opacity-75">
        <span>{inspection.totalPcs} pcs</span>
        <span>{inspection.totalSqm?.toFixed(1)} sqm</span>
      </div>

      {/* Completed indicator */}
      {inspection.status === 'completed' && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-green-700">
          <Check className="w-3 h-3" />
          <span>Done</span>
        </div>
      )}
    </button>
  )
}
