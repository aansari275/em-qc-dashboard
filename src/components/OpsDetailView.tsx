import { format } from 'date-fns'
import type { Order, OpsNo } from '../types'
import { formatOpsNo } from '../lib/utils'
import {
  Calendar,
  FileText,
  MapPin,
  Ship,
  Building,
  Hash,
} from 'lucide-react'

interface OpsDetailViewProps {
  order: Order
  ops: OpsNo | null
}

export function OpsDetailView({ order, ops: _ops }: OpsDetailViewProps) {
  // _ops is available for future use (linked samples, dispatches, etc.)
  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr) return '—'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '—'
      return format(date, 'dd MMM yyyy')
    } catch {
      return '—'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Order Details
        </h3>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {/* PO Number */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Hash className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">PO Number</span>
          </div>
          <p className="text-slate-800 font-medium">{order.poNo || '—'}</p>
        </div>

        {/* OPS Number */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">OPS #</span>
          </div>
          <p className="text-slate-800 font-medium">{formatOpsNo(order.salesNo)}</p>
        </div>

        {/* Order Type */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Building className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">Order Type</span>
          </div>
          <p className="text-slate-800 font-medium capitalize">
            {order.orderType?.replace('_', ' ') || '—'}
          </p>
        </div>

        {/* Order Confirmation Date */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">Order Date</span>
          </div>
          <p className="text-slate-800 font-medium">
            {formatDateSafe(order.orderConfirmationDate)}
          </p>
        </div>

        {/* Ex-Factory Date */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Ship className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">Ex-Factory</span>
          </div>
          <p className="text-slate-800 font-medium">
            {formatDateSafe(order.shipDate)}
          </p>
        </div>

        {/* Buyer Ship Date */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase">Buyer Ship Date</span>
          </div>
          <p className="text-slate-800 font-medium">
            {formatDateSafe(order.buyerPoShipDate)}
          </p>
        </div>
      </div>

      {/* Totals Row */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-500 uppercase">Total Pcs</span>
            <p className="text-lg font-bold text-slate-800">{order.totalPcs || 0}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase">Total SQM</span>
            <p className="text-lg font-bold text-slate-800">{order.totalSqm?.toFixed(2) || 0}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase">Items</span>
            <p className="text-lg font-bold text-slate-800">{order.items?.length || 0}</p>
          </div>
        </div>

        {/* Status */}
        <div className="text-right">
          <span className="text-xs text-slate-500 uppercase">Status</span>
          <p className="text-lg font-bold capitalize text-slate-800">
            {order.status === 'sent' ? 'Open' : order.status}
          </p>
        </div>
      </div>

      {/* Remarks */}
      {order.remarks && (
        <div className="px-4 py-3 border-t border-slate-200">
          <span className="text-xs text-slate-500 uppercase">Remarks</span>
          <p className="text-slate-700 mt-1">{order.remarks}</p>
        </div>
      )}
    </div>
  )
}
