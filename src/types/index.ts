// ============== Inspection Schedule ==============

export type CompanyCode = 'EMPL' | 'EHI'
export type InspectionStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled'

export interface InspectionSchedule {
  id: string
  opsNo: string                    // "OPS-25881"
  orderId: string                  // Reference to order
  inspectionDate: string           // "YYYY-MM-DD"
  inspectionCompany: CompanyCode
  status: InspectionStatus
  buyerCode: string
  articleName?: string
  totalPcs: number
  totalSqm: number
  merchantCode: string
  scheduledBy: string
  scheduledAt: string
  completedAt?: string
  rescheduledFrom?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============== Order Types ==============

export type OrderType = 'custom' | 'broadloom' | 'area_rugs' | 'samples'

export interface OrderItem {
  id: string
  articleName: string
  sku: string
  size: string
  sizeUnit?: 'cms' | 'feet' | 'inches'
  pcs: number
  sqm: number
  unitPrice: number
  lineValue: number
  emDesignName?: string
  wireCodes?: string
  color?: string
  designCode?: string
  vendorStyle?: string
  designId?: string
  quality?: string
  contractorId?: string
  contractorName?: string
  folioNo?: string
  imageUrl?: string
  imageName?: string
}

export interface Order {
  id: string
  salesNo: string
  customerCode: string
  buyerName: string
  orderType: OrderType
  companyCode: CompanyCode
  orderConfirmationDate: string
  merchantCode: string
  assistantMerchantCode?: string
  managedBy: string
  poNo: string
  buyerPoShipDate: string
  shipDate: string
  items: OrderItem[]
  totalPcs: number
  totalSqm: number
  poValue: number
  poFileUrl?: string
  poFileName?: string
  remarks?: string
  status: 'draft' | 'submitted' | 'sent' | 'shipped'
  createdAt: string
  updatedAt: string
}

// ============== OPS ==============

export interface OpsNo {
  id: string
  opsNo: string
  buyerName: string
  buyerCode: string
  merchantCode?: string
  managedBy: string
  poNo: string
  orderType: OrderType
  companyCode: CompanyCode
  orderConfirmationDate: string
  buyerPoShipDate: string
  exFactoryDate: string
  totalPcs: number
  totalSqm: number
  poValue: number
  source: 'orders' | 'import' | 'manual'
  sourceId: string
  status: 'open' | 'in_production' | 'shipped' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// ============== PDoc (Product Document) ==============

export type PDocLabelType = 'main' | 'care' | 'size' | 'hangtag' | 'custom'
export type PDocLabelStatus = 'pending' | 'approved' | 'rejected'
export type PDocTestResult = 'pass' | 'fail' | 'conditional'

export interface PDocDocument {
  id: string
  name: string
  url: string
  type: 'pdf' | 'ppt' | 'excel' | 'other'
  category?: string
  uploadedBy?: string
  uploadedAt: string
}

export interface PDocPhoto {
  id: string
  name: string
  url: string
  caption?: string
  uploadedAt: string
}

export interface PDocLabel {
  id: string
  labelType: PDocLabelType
  customLabelName?: string
  artworkUrl?: string
  artworkName?: string
  photographUrl?: string
  photographName?: string
  status: PDocLabelStatus
  approvalDate?: string
  notes?: string
  uploadedAt: string
}

export interface PDocTestReport {
  id: string
  testType: string
  reportNumber?: string
  reportUrl: string
  reportName: string
  testDate?: string
  expiryDate?: string
  labName?: string
  sampleDescription?: string
  composition?: string
  result?: PDocTestResult
  notes?: string
  uploadedAt: string
}

export interface PDocCAD {
  id: string
  name: string
  url: string
  version: number
  type: 'cad' | 'approved_buyer_cad'
  notes?: string
  uploadedBy?: string
  uploadedAt: string
}

export interface PDocNominatedSupplier {
  id: string
  supplierId: string
  supplierName: string
  category: 'packaging' | 'transport' | 'raw_material' | 'other'
  isRequired: boolean
  notes?: string
  addedAt: string
}

export interface PDoc {
  id: string
  pdocNumber: string
  buyerCode: string
  articleCode: string
  articleName: string
  quality?: string
  thumbnailUrl?: string
  thumbnailName?: string
  documents: PDocDocument[]
  photos: PDocPhoto[]
  cads?: PDocCAD[]
  labels: PDocLabel[]
  testReports: PDocTestReport[]
  technicalDescription?: string
  activeDwpNumber?: string
  nominatedSuppliers?: PDocNominatedSupplier[]
  createdAt: string
  updatedAt: string
}

// ============== DWP (Packaging) ==============

export interface DwpFile {
  id: string
  name: string
  url: string
  uploadedAt: string
}

export interface ConsumerPackage {
  id: string
  size: string
  sizeUnit: 'cms' | 'feet'
  packageNumber: number
  widthMm: number
  lengthMm: number
  heightMm: number
  diameterMm?: number
  grossWeightKg: number
  materialIds: string[]
}

export interface UnitLoadDetails {
  quantity: number
  unit: 'pcs' | 'cm'
  lengthMm: number
  widthMm: number
  heightMm: number
  materialIds: string[]
}

export interface DwpRecord {
  id: string
  dwpNumber: string
  name: string
  description?: string
  sizeCategory?: string
  productType?: string
  edition: number
  activeFrom: string
  activeTo?: string
  firstDate: string
  latestUpdate: string
  expireOn?: string
  files: DwpFile[]
  consumerPackages: ConsumerPackage[]
  unitLoad: UnitLoadDetails
  createdAt: string
  updatedAt: string
}

// ============== TED (Technical Execution Document) ==============

export interface TedMaterial {
  name: string
  plyCount?: number
  gsmWithLoss?: number
  typeOfDyeing?: string
}

export interface TedForm {
  id: string
  timestamp?: string
  createdAt?: string
  updatedAt?: string
  pp_meeting_date?: string
  meeting_attendees?: string[]
  empl_design_no: string
  buyer_design_name?: string
  buyer_name?: string
  buyer_code: string
  product_type?: string
  construction?: string
  product_quality?: string
  weaving_loss?: string
  finishing_loss?: string
  unfinished_gsm?: number
  finished_gsm?: number
  size?: string
  reed_no_kanghi?: string
  warp_in_6_inches?: string
  weft_in_6_inches?: string
  warp_materials?: TedMaterial[]
  weft_materials?: TedMaterial[]
  pile_material?: string
  pile_height_unfinished?: string
  pile_height_finished?: string
  fringes_details?: string
  khati_details?: string
  size_tolerance?: string
  process_flow?: string
  quality_call_outs_ctq?: string
  remarks?: string
  buyers_specific_requirements?: string
  red_seal_available?: string
  shade_card_available?: string
  process_timeline?: Array<{ name: string }>
  imageUrls?: {
    shade_card_photo?: string[]
    master_hank_photo?: string[]
    red_seal_photo?: string[]
    product_photo?: string[]
    approved_cad?: string[]
    additional_images?: string[]
  }
}

// ============== Buyer ==============

export interface Buyer {
  id?: string
  name: string
  code: string
  isActive?: boolean
  primaryMerchantId?: string | null
  assistantMerchantId?: string | null
  managedByDirectorId?: string | null
  packagingDetails?: {
    boxSizes?: string[]
    maxWeightPerBox?: number
    palletRequired?: boolean
    palletType?: string
    specialInstructions?: string
    packagingInstructions?: Array<{
      id: string
      url: string
      fileName: string
      uploadedAt: string
      uploadedBy: string
    }>
  }
  createdAt?: string
  updatedAt?: string
}

// ============== Buyer Certifications ==============

export interface BuyerCertification {
  id: string
  buyerCode: string
  certType: string
  name: string
  certificateNumber?: string
  issuingBody?: string
  issueDate: string
  expiryDate?: string | null
  fileUrl: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyCertification {
  id: string
  certName: string
  certType: 'social' | 'environmental' | 'quality' | 'safety' | 'other'
  certificateNumber?: string
  issuingBody?: string
  issueDate: string
  expiryDate?: string | null
  fileUrl: string
  fileName: string
  appliedBuyerCodes: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============== QC Data ==============

export interface BazaarInspection {
  id: string
  company: string
  opsNo: string
  folioNo: string
  designNo: string
  sizes: string
  totalPcsInspected: number
  pcsAccepted: number
  pcsRejected: number
  inspectedBy: string
  defectTypes?: string[]
  qcRemark?: string
  qualityDefectPhotos?: string[]
  productionVsRedSealPhoto?: string
  inspectionDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface QCFinalInspection {
  id: string
  company: string
  documentNo: string
  opsNo: string
  customerName: string
  customerCode: string
  customerPoNo: string
  buyerDesignName: string
  merchant: string
  totalOrderQty: number
  inspectedLotQty: number
  acceptedQty: number
  rejectedQty: number
  inspectionResult: 'PASS' | 'FAIL'
  qcInspectorName: string
  qcInspectorRemarks?: string
  defects?: Array<{
    defectCode: string
    majorCount: number
    minorCount: number
    description: string
  }>
  approvedSamplePhoto?: string
  idPhoto?: string
  redSealFrontPhoto?: string
  backPhoto?: string
  labelPhoto?: string
  otherPhotos?: string[]
  inspectionDate?: string
  createdAt?: string
  updatedAt?: string
}

// ============== Combined Inspection Data for QC Dashboard ==============

export interface InspectionWithDetails extends InspectionSchedule {
  order?: Order | null
  ops?: OpsNo | null
  products?: ProductWithDocs[]
  tedForms?: Record<string, TedForm>
}

export interface ProductWithDocs {
  item: OrderItem
  pdoc?: PDoc | null
  dwp?: DwpRecord | null
  ted?: TedForm | null
  buyerCertifications?: BuyerCertification[]
  companyCertifications?: CompanyCertification[]
  packagingInstructions?: Buyer['packagingDetails']
}

// ============== API Response Types ==============

export interface OpsDetailsResponse {
  merchantName?: string
  opsNo: string
  ops: OpsNo | null
  order: Order | null
  tedForms: Record<string, TedForm>
}

export interface ProductDocsResponse {
  pdoc: PDoc | null
  dwp: DwpRecord | null
  ted: TedForm | null
  buyerCertifications: BuyerCertification[]
  companyCertifications: CompanyCertification[]
  packagingInstructions: Buyer['packagingDetails']
}
