import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isPast, isFuture, addDays, startOfDay } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format OPS number for display: OPS-25881 → EM-25-881
export function formatOpsNo(opsNo: string): string {
  if (!opsNo) return ''

  // Extract numbers from OPS-XXXXX format
  const match = opsNo.match(/OPS-(\d+)/)
  if (!match) return opsNo

  const numbers = match[1]
  // Get current year's last 2 digits
  const currentYear = new Date().getFullYear().toString().slice(-2)

  // If number starts with year (like 25XXX), extract sequence
  if (numbers.length >= 4) {
    const year = numbers.substring(0, 2)
    const seq = numbers.substring(2)
    return `EM-${year}-${seq}`
  }

  // Fallback: use current year
  return `EM-${currentYear}-${numbers}`
}

// Generate date range for calendar
export function generateDateRange(days: number = 14): Date[] {
  const dates: Date[] = []
  const today = startOfDay(new Date())

  for (let i = 0; i < days; i++) {
    dates.push(addDays(today, i))
  }

  return dates
}

// Format date for display
export function formatDate(date: Date | string, formatStr: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return format(d, formatStr)
}

// Check if date is today
export function isTodayDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return isToday(d)
}

// Check if date is in the past
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return isPast(startOfDay(d)) && !isToday(d)
}

// Check if date is in the future
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return isFuture(startOfDay(d))
}

// Get days until inspection
export function getDaysUntil(date: string): number {
  const today = startOfDay(new Date())
  const targetDate = startOfDay(new Date(date))
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Format relative time
export function formatRelativeTime(date: string): string {
  const days = getDaysUntil(date)

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days <= 7) return `In ${days} days`

  return formatDate(date, 'dd MMM')
}

// Status colors
export function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rescheduled':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-500 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Company colors
export function getCompanyColor(company: 'EMPL' | 'EHI'): string {
  return company === 'EMPL'
    ? 'bg-blue-500 text-white'
    : 'bg-purple-500 text-white'
}

// Get company badge style
export function getCompanyBadgeStyle(company: 'EMPL' | 'EHI'): string {
  return company === 'EMPL'
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-purple-100 text-purple-800 border-purple-200'
}

// Label status colors
export function getLabelStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Test result colors
export function getTestResultColor(result: string | undefined): string {
  switch (result) {
    case 'pass':
      return 'bg-green-100 text-green-800'
    case 'fail':
      return 'bg-red-100 text-red-800'
    case 'conditional':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Get file icon based on type
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename)
  switch (ext) {
    case 'pdf':
      return '📄'
    case 'ppt':
    case 'pptx':
      return '📊'
    case 'xls':
    case 'xlsx':
      return '📈'
    case 'doc':
    case 'docx':
      return '📝'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️'
    default:
      return '📎'
  }
}

// Truncate text
export function truncate(str: string, length: number = 30): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
