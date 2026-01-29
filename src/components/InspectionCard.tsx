import type { InspectionSchedule } from '../types'
import { cn, formatOpsNo, getStatusColor, getCompanyBadgeStyle } from '../lib/utils'
import { Check, Clock, RotateCcw, X } from 'lucide-react'

interface InspectionCardProps {
  inspection: InspectionSchedule
  onClick: () => void
  showCompany?: boolean
}

export function InspectionCard({ inspection, onClick, showCompany = false }: InspectionCardProps) {
  const statusIcon = {
    scheduled: <Clock className="w-3 h-3" />,
    completed: <Check className="w-3 h-3" />,
    rescheduled: <RotateCcw className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
  }

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
