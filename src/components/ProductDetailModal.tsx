import { useState } from 'react'
import { useProductDocs } from '../hooks/useApi'
import type { OrderItem } from '../types'
import { cn, getLabelStatusColor, getTestResultColor, getFileIcon, formatDate, truncate } from '../lib/utils'
import {
  X,
  Loader2,
  Package,
  FileText,
  Image,
  Tag,
  TestTube,
  Award,
  Box,
  Wrench,
  ExternalLink,
  Download,
  Eye,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react'

interface ProductDetailModalProps {
  item: OrderItem
  buyerCode: string
  onClose: () => void
}

type TabId = 'overview' | 'ted' | 'labels' | 'tests' | 'certs' | 'packaging' | 'documents' | 'photos'

export function ProductDetailModal({ item, buyerCode, onClose }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const articleCode = item.articleName || item.emDesignName || ''
  const { data, isLoading } = useProductDocs(buyerCode, articleCode)

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Package className="w-4 h-4" /> },
    { id: 'ted', label: 'TED', icon: <Wrench className="w-4 h-4" /> },
    { id: 'labels', label: 'Labels', icon: <Tag className="w-4 h-4" />, count: data?.pdoc?.labels?.length },
    { id: 'tests', label: 'Test Reports', icon: <TestTube className="w-4 h-4" />, count: data?.pdoc?.testReports?.length },
    { id: 'certs', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: (data?.buyerCertifications?.length || 0) + (data?.companyCertifications?.length || 0) },
    { id: 'packaging', label: 'Packaging', icon: <Box className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, count: data?.pdoc?.documents?.length },
    { id: 'photos', label: 'Photos', icon: <Image className="w-4 h-4" />, count: data?.pdoc?.photos?.length },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.articleName} className="w-full h-full object-cover" />
              ) : data?.pdoc?.thumbnailUrl ? (
                <img src={data.pdoc.thumbnailUrl} alt={item.articleName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {item.articleName || 'Product Details'}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                <span className="font-medium">{buyerCode}</span>
                {item.size && <span>• {item.size}</span>}
                {item.color && <span>• {item.color}</span>}
                {item.quality && <span>• {item.quality}</span>}
              </div>
              {data?.pdoc?.pdocNumber && (
                <p className="text-xs text-teal-600 mt-1">PDOC: {data.pdoc.pdocNumber}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white text-teal-700 shadow-sm border border-teal-200"
                  : "text-slate-600 hover:bg-white/50"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <OverviewTab item={item} data={data} />
              )}

              {/* TED Tab */}
              {activeTab === 'ted' && (
                <TedTab ted={data?.ted} />
              )}

              {/* Labels Tab */}
              {activeTab === 'labels' && (
                <LabelsTab labels={data?.pdoc?.labels || []} />
              )}

              {/* Test Reports Tab */}
              {activeTab === 'tests' && (
                <TestReportsTab reports={data?.pdoc?.testReports || []} />
              )}

              {/* Certifications Tab */}
              {activeTab === 'certs' && (
                <CertificationsTab
                  buyerCerts={data?.buyerCertifications || []}
                  companyCerts={data?.companyCertifications || []}
                />
              )}

              {/* Packaging Tab */}
              {activeTab === 'packaging' && (
                <PackagingTab dwp={data?.dwp} packagingInstructions={data?.packagingInstructions} />
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <DocumentsTab documents={data?.pdoc?.documents || []} />
              )}

              {/* Photos Tab */}
              {activeTab === 'photos' && (
                <PhotosTab photos={data?.pdoc?.photos || []} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============== Tab Components ==============

function OverviewTab({ item, data }: { item: OrderItem; data: any }) {
  const pdoc = data?.pdoc
  const dwp = data?.dwp
  const ted = data?.ted

  const stats = [
    { label: 'Labels', value: pdoc?.labels?.length || 0, icon: <Tag className="w-4 h-4" /> },
    { label: 'Test Reports', value: pdoc?.testReports?.length || 0, icon: <TestTube className="w-4 h-4" /> },
    { label: 'Documents', value: pdoc?.documents?.length || 0, icon: <FileText className="w-4 h-4" /> },
    { label: 'Photos', value: pdoc?.photos?.length || 0, icon: <Image className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Article" value={item.articleName || '—'} />
        <InfoCard label="Size" value={item.size || '—'} />
        <InfoCard label="Color" value={item.color || '—'} />
        <InfoCard label="Quality" value={item.quality || '—'} />
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-medium text-blue-600 uppercase mb-1">Quantity</p>
          <p className="text-2xl font-bold text-blue-800">{item.pcs} pcs</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs font-medium text-purple-600 uppercase mb-1">Area</p>
          <p className="text-2xl font-bold text-purple-800">{item.sqm?.toFixed(2)} sqm</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              {stat.icon}
              <span className="text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-3">Quick Status</h4>
        <div className="flex flex-wrap gap-3">
          {ted ? (
            <StatusBadge status="success" label="TED Available" />
          ) : (
            <StatusBadge status="warning" label="No TED" />
          )}
          {dwp ? (
            <StatusBadge status="success" label={`DWP: ${dwp.dwpNumber}`} />
          ) : (
            <StatusBadge status="warning" label="No DWP" />
          )}
          {pdoc?.labels?.some((l: any) => l.status === 'approved') ? (
            <StatusBadge status="success" label="Labels Approved" />
          ) : pdoc?.labels?.length > 0 ? (
            <StatusBadge status="pending" label="Labels Pending" />
          ) : (
            <StatusBadge status="warning" label="No Labels" />
          )}
        </div>
      </div>

      {/* Technical Description */}
      {pdoc?.technicalDescription && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-2">Technical Description</h4>
          <p className="text-slate-600">{pdoc.technicalDescription}</p>
        </div>
      )}
    </div>
  )
}

function TedTab({ ted }: { ted: any }) {
  if (!ted) {
    return (
      <EmptyState
        icon={<Wrench className="w-12 h-12" />}
        title="No TED Found"
        description="No Technical Execution Document has been created for this product yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-teal-800">{ted.empl_design_no}</h3>
            {ted.buyer_design_name && (
              <p className="text-teal-600">{ted.buyer_design_name}</p>
            )}
          </div>
          {ted.pp_meeting_date && (
            <div className="text-right">
              <p className="text-xs text-teal-600 uppercase">PP Meeting</p>
              <p className="font-medium text-teal-800">{ted.pp_meeting_date}</p>
            </div>
          )}
        </div>
      </div>

      {/* Construction & Technical Specs */}
      <SectionCard title="Construction & Technical Specs">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoCard label="Product Type" value={ted.product_type} />
          <InfoCard label="Construction" value={ted.construction} />
          <InfoCard label="Quality" value={ted.product_quality} />
          <InfoCard label="Size" value={ted.size} />
          <InfoCard label="Unfinished GSM" value={ted.unfinished_gsm} />
          <InfoCard label="Finished GSM" value={ted.finished_gsm} />
          <InfoCard label="Weaving Loss" value={ted.weaving_loss} />
          <InfoCard label="Finishing Loss" value={ted.finishing_loss} />
          <InfoCard label="Size Tolerance" value={ted.size_tolerance} />
        </div>
      </SectionCard>

      {/* Material Specifications */}
      <SectionCard title="Material Specifications">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard label="Pile Material" value={ted.pile_material} />
          <InfoCard label="Pile Height (Unfinished)" value={ted.pile_height_unfinished} />
          <InfoCard label="Pile Height (Finished)" value={ted.pile_height_finished} />
          <InfoCard label="Fringes Details" value={ted.fringes_details} />
        </div>

        {/* Warp Materials */}
        {ted.warp_materials?.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-slate-700 mb-2">Warp Materials</h5>
            <div className="flex flex-wrap gap-2">
              {ted.warp_materials.map((m: any, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-sm">
                  {m.name} {m.plyCount && `(${m.plyCount} ply)`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weft Materials */}
        {ted.weft_materials?.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-slate-700 mb-2">Weft Materials</h5>
            <div className="flex flex-wrap gap-2">
              {ted.weft_materials.map((m: any, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-sm">
                  {m.name} {m.plyCount && `(${m.plyCount} ply)`}
                </span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Quality & Process */}
      {(ted.process_flow || ted.quality_call_outs_ctq || ted.buyers_specific_requirements) && (
        <SectionCard title="Quality & Process Requirements">
          {ted.process_flow && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-slate-700 mb-1">Process Flow</h5>
              <p className="text-slate-600">{ted.process_flow}</p>
            </div>
          )}
          {ted.quality_call_outs_ctq && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-slate-700 mb-1">Quality Call Outs (CTQ)</h5>
              <p className="text-slate-600">{ted.quality_call_outs_ctq}</p>
            </div>
          )}
          {ted.buyers_specific_requirements && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-1">Buyer's Specific Requirements</h5>
              <p className="text-slate-600 whitespace-pre-wrap">{ted.buyers_specific_requirements}</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Images */}
      {ted.imageUrls && Object.keys(ted.imageUrls).some(k => ted.imageUrls[k]?.length > 0) && (
        <SectionCard title="Reference Images">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ted.imageUrls.product_photo?.map((url: string, i: number) => (
              <ImageCard key={`product-${i}`} url={url} label="Product Photo" />
            ))}
            {ted.imageUrls.shade_card_photo?.map((url: string, i: number) => (
              <ImageCard key={`shade-${i}`} url={url} label="Shade Card" />
            ))}
            {ted.imageUrls.red_seal_photo?.map((url: string, i: number) => (
              <ImageCard key={`seal-${i}`} url={url} label="Red Seal" />
            ))}
            {ted.imageUrls.approved_cad?.map((url: string, i: number) => (
              <ImageCard key={`cad-${i}`} url={url} label="Approved CAD" />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Remarks */}
      {ted.remarks && (
        <SectionCard title="Remarks">
          <p className="text-slate-600 whitespace-pre-wrap">{ted.remarks}</p>
        </SectionCard>
      )}
    </div>
  )
}

function LabelsTab({ labels }: { labels: any[] }) {
  if (labels.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="w-12 h-12" />}
        title="No Labels"
        description="No labels have been uploaded for this product yet."
      />
    )
  }

  const labelTypeNames: Record<string, string> = {
    main: 'Main Label',
    care: 'Care Label',
    size: 'Size Label',
    hangtag: 'Hangtag',
    custom: 'Custom',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {labels.map(label => (
        <div key={label.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">
                {label.customLabelName || labelTypeNames[label.labelType] || label.labelType}
              </span>
            </div>
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getLabelStatusColor(label.status)
            )}>
              {label.status}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Artwork */}
            {label.artworkUrl && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Artwork</p>
                <a
                  href={label.artworkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{truncate(label.artworkName || 'View Artwork', 30)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Photograph */}
            {label.photographUrl && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Photograph</p>
                <a
                  href={label.photographUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={label.photographUrl}
                    alt="Label photo"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                </a>
              </div>
            )}

            {/* Notes */}
            {label.notes && (
              <p className="text-sm text-slate-600">{label.notes}</p>
            )}

            {/* Approval Date */}
            {label.approvalDate && (
              <p className="text-xs text-slate-500">
                Approved: {formatDate(label.approvalDate)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TestReportsTab({ reports }: { reports: any[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<TestTube className="w-12 h-12" />}
        title="No Test Reports"
        description="No test reports have been uploaded for this product yet."
      />
    )
  }

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <TestTube className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{report.testType}</h4>
                {report.reportNumber && (
                  <p className="text-sm text-slate-500">Report #: {report.reportNumber}</p>
                )}
                {report.labName && (
                  <p className="text-sm text-slate-500">Lab: {report.labName}</p>
                )}
              </div>
            </div>

            {report.result && (
              <span className={cn(
                "px-3 py-1 text-sm font-medium rounded-full",
                getTestResultColor(report.result)
              )}>
                {report.result.toUpperCase()}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.testDate && (
              <div>
                <p className="text-xs text-slate-500">Test Date</p>
                <p className="text-sm font-medium">{formatDate(report.testDate)}</p>
              </div>
            )}
            {report.expiryDate && (
              <div>
                <p className="text-xs text-slate-500">Expiry</p>
                <p className="text-sm font-medium">{formatDate(report.expiryDate)}</p>
              </div>
            )}
            {report.sampleDescription && (
              <div className="col-span-2">
                <p className="text-xs text-slate-500">Sample</p>
                <p className="text-sm font-medium">{report.sampleDescription}</p>
              </div>
            )}
          </div>

          {/* File Link */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href={report.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">{truncate(report.reportName, 40)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

function CertificationsTab({ buyerCerts, companyCerts }: { buyerCerts: any[]; companyCerts: any[] }) {
  if (buyerCerts.length === 0 && companyCerts.length === 0) {
    return (
      <EmptyState
        icon={<Award className="w-12 h-12" />}
        title="No Certifications"
        description="No certifications have been linked to this buyer yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Buyer Certifications */}
      {buyerCerts.length > 0 && (
        <SectionCard title="Buyer Certifications">
          <div className="space-y-3">
            {buyerCerts.map(cert => (
              <CertCard key={cert.id} cert={cert} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Company Certifications */}
      {companyCerts.length > 0 && (
        <SectionCard title="Company Certifications">
          <div className="space-y-3">
            {companyCerts.map(cert => (
              <CertCard key={cert.id} cert={cert} isCompany />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function PackagingTab({ dwp, packagingInstructions }: { dwp: any; packagingInstructions: any }) {
  if (!dwp && !packagingInstructions?.packagingInstructions?.length) {
    return (
      <EmptyState
        icon={<Box className="w-12 h-12" />}
        title="No Packaging Info"
        description="No packaging specifications have been linked to this product yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* DWP */}
      {dwp && (
        <SectionCard title={`DWP: ${dwp.dwpNumber}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoCard label="Name" value={dwp.name} />
              <InfoCard label="Edition" value={dwp.edition} />
              <InfoCard label="Size Category" value={dwp.sizeCategory} />
              <InfoCard label="Product Type" value={dwp.productType} />
              <InfoCard label="Active From" value={formatDate(dwp.activeFrom)} />
            </div>

            {/* Consumer Packages */}
            {dwp.consumerPackages?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Consumer Packages</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Size</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Dimensions (mm)</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dwp.consumerPackages.map((pkg: any) => (
                        <tr key={pkg.id}>
                          <td className="px-3 py-2">{pkg.size} {pkg.sizeUnit}</td>
                          <td className="px-3 py-2">{pkg.lengthMm} x {pkg.widthMm} x {pkg.heightMm}</td>
                          <td className="px-3 py-2">{pkg.grossWeightKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unit Load */}
            {dwp.unitLoad && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Unit Load</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoCard label="Quantity" value={`${dwp.unitLoad.quantity} ${dwp.unitLoad.unit}`} />
                  <InfoCard label="Length" value={`${dwp.unitLoad.lengthMm} mm`} />
                  <InfoCard label="Width" value={`${dwp.unitLoad.widthMm} mm`} />
                  <InfoCard label="Height" value={`${dwp.unitLoad.heightMm} mm`} />
                </div>
              </div>
            )}

            {/* DWP Files */}
            {dwp.files?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Specification Files</h5>
                <div className="space-y-2">
                  {dwp.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Packaging Instructions */}
      {packagingInstructions?.packagingInstructions?.length > 0 && (
        <SectionCard title="Approved Packaging Instructions">
          <div className="space-y-2">
            {packagingInstructions.packagingInstructions.map((instr: any) => (
              <a
                key={instr.id}
                href={instr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-700">{instr.fileName}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded {formatDate(instr.uploadedAt)} by {instr.uploadedBy}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Special Instructions */}
      {packagingInstructions?.specialInstructions && (
        <SectionCard title="Special Instructions">
          <p className="text-slate-600">{packagingInstructions.specialInstructions}</p>
        </SectionCard>
      )}
    </div>
  )
}

function DocumentsTab({ documents }: { documents: any[] }) {
  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No Documents"
        description="No documents have been uploaded for this product yet."
      />
    )
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">{getFileIcon(doc.name)}</span>
            <div>
              <p className="font-medium text-slate-700">{doc.name}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {doc.category && <span>{doc.category}</span>}
                {doc.uploadedAt && <span>• {formatDate(doc.uploadedAt)}</span>}
              </div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-slate-400" />
        </a>
      ))}
    </div>
  )
}

function PhotosTab({ photos }: { photos: any[] }) {
  if (photos.length === 0) {
    return (
      <EmptyState
        icon={<Image className="w-12 h-12" />}
        title="No Photos"
        description="No photos have been uploaded for this product yet."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map(photo => (
        <a
          key={photo.id}
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100"
        >
          <img
            src={photo.url}
            alt={photo.caption || photo.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-xs text-white truncate">{photo.caption}</p>
            </div>
          )}
        </a>
      ))}
    </div>
  )
}

// ============== Helper Components ==============

function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase mb-1">{label}</p>
      <p className="text-slate-800 font-medium">{value || '—'}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h4 className="font-medium text-slate-700">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      {icon}
      <h4 className="mt-4 font-medium text-slate-600">{title}</h4>
      <p className="mt-1 text-sm text-center">{description}</p>
    </div>
  )
}

function StatusBadge({ status, label }: { status: 'success' | 'warning' | 'pending'; label: string }) {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    pending: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  const icons = {
    success: <Check className="w-3.5 h-3.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
  }

  return (
    <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border", styles[status])}>
      {icons[status]}
      {label}
    </span>
  )
}

function ImageCard({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100"
    >
      <img src={url} alt={label} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Eye className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs text-white">{label}</p>
      </div>
    </a>
  )
}

function CertCard({ cert, isCompany = false }: { cert: any; isCompany?: boolean }) {
  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date()
  const isExpiringSoon = cert.expiryDate && !isExpired && new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <a
      href={cert.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isCompany ? "bg-purple-100" : "bg-teal-100"
        )}>
          <Award className={cn("w-5 h-5", isCompany ? "text-purple-600" : "text-teal-600")} />
        </div>
        <div>
          <p className="font-medium text-slate-700">{cert.certName || cert.certType}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {cert.certificateNumber && <span>{cert.certificateNumber}</span>}
            {cert.issuingBody && <span>• {cert.issuingBody}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isExpired ? (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Expired
          </span>
        ) : isExpiringSoon ? (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            Expiring Soon
          </span>
        ) : cert.expiryDate ? (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Valid
          </span>
        ) : null}
        <ExternalLink className="w-4 h-4 text-slate-400" />
      </div>
    </a>
  )
}
