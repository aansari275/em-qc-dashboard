import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  InspectionSchedule,
  OpsDetailsResponse,
  ProductDocsResponse,
} from '../types'

const API_BASE = '/api'

function getPin(): string | null {
  return localStorage.getItem('qc_dashboard_pin')
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const pin = getPin()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (pin) {
    headers['x-pin'] = pin
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// ============== PIN Verification ==============

export function useVerifyPin() {
  return useMutation({
    mutationFn: async (pin: string) => {
      const res = await fetch(`${API_BASE}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (!res.ok) {
        throw new Error('Invalid PIN')
      }

      localStorage.setItem('qc_dashboard_pin', pin)
      return true
    },
  })
}

// ============== Inspections ==============

export function useInspections(
  company: 'EMPL' | 'EHI' | 'all',
  startDate: string,
  endDate: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['inspections', company, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        company,
        startDate,
        endDate,
      })

      const res = await fetchWithAuth(`${API_BASE}/inspections?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch inspections')
      }

      return res.json() as Promise<InspectionSchedule[]>
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

export function useMarkComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const res = await fetchWithAuth(`${API_BASE}/inspections/${inspectionId}/complete`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to mark inspection complete')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}

export function useRescheduleInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, inspectionDate, notes }: { id: string; inspectionDate: string; notes?: string }) => {
      const res = await fetchWithAuth(`${API_BASE}/inspections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ inspectionDate, notes }),
      })

      if (!res.ok) {
        throw new Error('Failed to reschedule inspection')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}

// ============== OPS Details ==============

export function useOpsDetails(opsNo: string | null) {
  return useQuery({
    queryKey: ['ops', opsNo],
    queryFn: async () => {
      if (!opsNo) return null

      const res = await fetchWithAuth(`${API_BASE}/ops/${encodeURIComponent(opsNo)}`)

      if (!res.ok) {
        throw new Error('Failed to fetch OPS details')
      }

      return res.json() as Promise<OpsDetailsResponse>
    },
    enabled: !!opsNo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============== Product Documentation ==============

export function useProductDocs(buyerCode: string | null, articleCode: string | null) {
  return useQuery({
    queryKey: ['product-docs', buyerCode, articleCode],
    queryFn: async () => {
      if (!buyerCode || !articleCode) return null

      const res = await fetchWithAuth(
        `${API_BASE}/product-docs/${encodeURIComponent(buyerCode)}/${encodeURIComponent(articleCode)}`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch product documentation')
      }

      return res.json() as Promise<ProductDocsResponse>
    },
    enabled: !!buyerCode && !!articleCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============== QC Reports ==============

export function useQcReports(opsNo: string | null) {
  return useQuery({
    queryKey: ['qc-reports', opsNo],
    queryFn: async () => {
      if (!opsNo) return null

      const res = await fetchWithAuth(`${API_BASE}/qc-reports/${encodeURIComponent(opsNo)}`)

      if (!res.ok) {
        throw new Error('Failed to fetch QC reports')
      }

      return res.json()
    },
    enabled: !!opsNo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============== Buyers ==============

export function useBuyers() {
  return useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      const res = await fetchWithAuth(`${API_BASE}/buyers`)

      if (!res.ok) {
        throw new Error('Failed to fetch buyers')
      }

      return res.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============== Packaging Materials ==============

export function usePackagingMaterials() {
  return useQuery({
    queryKey: ['packaging-materials'],
    queryFn: async () => {
      const res = await fetchWithAuth(`${API_BASE}/packaging-materials`)

      if (!res.ok) {
        throw new Error('Failed to fetch packaging materials')
      }

      return res.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
