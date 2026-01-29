import { useState } from 'react'
import { format } from 'date-fns'
import { useOpsDetails, useMarkComplete } from '../hooks/useApi'
import { OpsDetailView } from './OpsDetailView'
import { ProductDetailModal } from './ProductDetailModal'
import type { InspectionSchedule, OrderItem } from '../types'
import { cn, formatOpsNo, getStatusColor, getCompanyBadgeStyle, formatRelativeTime } from '../lib/utils'
import {
  X,
  Loader2,
  Calendar,
  Package,
  User,
  Building2,
  FileText,
  Check,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

interface InspectionDetailModalProps {
  inspection: InspectionSchedule
  onClose: () => void
}

export function InspectionDetailModal({ inspection, onClose }: InspectionDetailModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<{ item: OrderItem; buyerCode: string } | null>(null)

  const { data: opsData, isLoading } = useOpsDetails(inspection.opsNo)
  const markComplete = useMarkComplete()

  const handleMarkComplete = () => {
    markComplete.mutate(inspection.id, {
      onSuccess: () => {
        // Don't close - let user see the updated state
      },
    })
  }

  const order = opsData?.order
  const ops = opsData?.ops
  const tedForms = opsData?.tedForms || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {formatOpsNo(inspection.opsNo)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border",
                    getStatusColor(inspection.status)
                  )}
                >
                  {inspection.status}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border",
                    getCompanyBadgeStyle(inspection.inspectionCompany)
                  )}
                >
                  {inspection.inspectionCompany}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Inspection Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Inspection Date */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Inspection</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-800">
                    {format(new Date(inspection.inspectionDate), 'dd MMM yyyy')}
                  </p>
                  <p className="text-sm text-emerald-600">
                    {formatRelativeTime(inspection.inspectionDate)}
                  </p>
                </div>

                {/* Buyer */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Buyer</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">
                    {inspection.buyerCode}
                  </p>
                  {order?.buyerName && (
                    <p className="text-sm text-blue-600 truncate">{order.buyerName}</p>
                  )}
                </div>

                {/* Quantity - prioritize order data over inspection data */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Quantity</span>
                  </div>
                  <p className="text-lg font-bold text-purple-800">
                    {order?.totalPcs || inspection.totalPcs || 0} pcs
                  </p>
                  <p className="text-sm text-purple-600">
                    {(order?.totalSqm || inspection.totalSqm || 0).toFixed(2)} sqm
                  </p>
                </div>

                {/* Merchant - use merchantName from API or fallback to inspection */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Merchant</span>
                  </div>
                  <p className="text-lg font-bold text-amber-800">
                    {opsData?.merchantName || order?.merchantCode || inspection.merchantCode || '—'}
                  </p>
                  {order?.assistantMerchantCode && (
                    <p className="text-sm text-amber-600">
                      Asst: {order.assistantMerchantCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              {order && (
                <OpsDetailView order={order} ops={ops || null} />
              )}

              {/* Products List */}
              {order?.items && order.items.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      Products ({order.items.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Click any product to view all documentation
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedProduct({ item, buyerCode: order.customerCode })}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.articleName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {item.articleName || item.sku || 'Unnamed Product'}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              {item.size && <span>{item.size}</span>}
                              {item.color && <span>{item.color}</span>}
                              {item.quality && <span>{item.quality}</span>}
                            </div>
                          </div>

                          {/* Quantities */}
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-slate-700">{item.pcs} pcs</p>
                            <p className="text-xs text-slate-500">{item.sqm?.toFixed(2)} sqm</p>
                          </div>

                          {/* TED indicator */}
                          {tedForms[item.id] && (
                            <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded">
                              TED
                            </span>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Order Found */}
              {!order && !isLoading && (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Order Not Found</h4>
                    <p className="text-sm text-amber-600 mt-1">
                      The linked order for this inspection could not be found. The order may have been deleted or the OPS number may be incorrect.
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {inspection.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
                  <p className="text-slate-600">{inspection.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Scheduled by <span className="font-medium">{inspection.scheduledBy}</span>
            {inspection.scheduledAt && (
              <span> on {format(new Date(inspection.scheduledAt), 'dd MMM yyyy')}</span>
            )}
          </div>

          {inspection.status === 'scheduled' && (
            <button
              onClick={handleMarkComplete}
              disabled={markComplete.isPending}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
                "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                "hover:from-emerald-600 hover:to-teal-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg shadow-emerald-500/25"
              )}
            >
              {markComplete.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Mark as Complete
            </button>
          )}

          {inspection.status === 'completed' && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Completed</span>
              {inspection.completedAt && (
                <span className="text-sm text-green-500">
                  on {format(new Date(inspection.completedAt), 'dd MMM yyyy')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct.item}
          buyerCode={selectedProduct.buyerCode}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
