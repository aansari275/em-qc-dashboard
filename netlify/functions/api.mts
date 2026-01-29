import type { Context } from "@netlify/functions"
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const INSPECTIONS_COLLECTION = 'inspection_schedules'

// Lazy Firebase initialization
let firebaseApp: App | null = null
let db: Firestore | null = null

function getDb(): Firestore {
  if (!db) {
    if (getApps().length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      })
    }
    db = getFirestore()
  }
  return db
}

// PIN verification
function verifyPin(request: Request): boolean {
  const pin = request.headers.get('x-pin')
  const validPin = process.env.QC_APP_PIN || '1234'
  return pin === validPin
}

// Response helpers
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-pin',
    }
  })
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status)
}

// OPS number format variations - handles multiple formats:
// EM-25-747, 25-747, EM25747, OPS-25747, etc.
function getOpsVariations(opsNo: string): string[] {
  const variations: string[] = [opsNo]
  const numbersOnly = opsNo.replace(/[^0-9]/g, '')

  // Extract year and rest (e.g., from "EM-25-747" get year=25, rest=747)
  let year = ''
  let rest = ''

  // Pattern: EM-25-747 or 25-747
  const dashMatch = opsNo.match(/(?:EM-)?(\d{2})-(\d+)/)
  if (dashMatch) {
    year = dashMatch[1]
    rest = dashMatch[2]
  }
  // Pattern: EM25747 or OPS-25747
  else if (numbersOnly.length >= 4) {
    year = numbersOnly.substring(0, 2)
    rest = numbersOnly.substring(2)
  }

  if (year && rest) {
    // Generate all possible formats
    variations.push(`${year}-${rest}`)           // 25-747
    variations.push(`EM-${year}-${rest}`)        // EM-25-747
    variations.push(`EM${year}${rest}`)          // EM25747 (normalized format)
    variations.push(`OPS-${year}${rest}`)        // OPS-25747
    variations.push(`${year}${rest}`)            // 25747
    variations.push(`EM-${year}${rest}`)         // EM-25747 (no second dash)
  }

  // Also try with just the original stripped of prefixes
  if (opsNo.startsWith('EM-')) {
    variations.push(opsNo.replace('EM-', ''))
  }
  if (opsNo.startsWith('OPS-')) {
    variations.push(opsNo.replace('OPS-', ''))
  }

  return [...new Set(variations)]
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const path = url.pathname.replace('/.netlify/functions/api', '').replace('/api', '')
  const method = request.method

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-pin',
      }
    })
  }

  try {
    // === POST /verify-pin ===
    if (path === '/verify-pin' && method === 'POST') {
      const body = await request.json()
      const { pin } = body
      const validPin = process.env.QC_APP_PIN || '1234'

      if (pin !== validPin) {
        return errorResponse('Invalid PIN', 401)
      }

      return jsonResponse({ success: true })
    }

    // All other endpoints require PIN auth
    if (!verifyPin(request)) {
      return errorResponse('Unauthorized', 401)
    }

    const database = getDb()

    // === GET /inspections ===
    if (path === '/inspections' && method === 'GET') {
      const company = url.searchParams.get('company')
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')

      if (!startDate || !endDate) {
        return errorResponse('startDate and endDate are required')
      }

      let query: FirebaseFirestore.Query = database.collection(INSPECTIONS_COLLECTION)
        .where('inspectionDate', '>=', startDate)
        .where('inspectionDate', '<=', endDate)

      if (company && company !== 'all') {
        query = query.where('inspectionCompany', '==', company)
      }

      const snapshot = await query.get()
      const inspections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort by inspectionDate
      inspections.sort((a: any, b: any) => a.inspectionDate.localeCompare(b.inspectionDate))

      return jsonResponse(inspections)
    }

    // === GET /ops/:opsNo - Full OPS details with order, items, TED, merchant ===
    const opsMatch = path.match(/^\/ops\/(.+)$/)
    if (opsMatch && method === 'GET') {
      const opsNo = decodeURIComponent(opsMatch[1])
      const variations = getOpsVariations(opsNo)

      console.log('Looking up OPS:', opsNo, 'Variations:', variations)

      let opsData: any = null
      let orderId: string | null = null

      // Try to find in ops_no collection
      for (const variation of variations) {
        const opsQuery = await database.collection('ops_no')
          .where('opsNo', '==', variation)
          .limit(1)
          .get()

        if (!opsQuery.empty) {
          const opsDoc = opsQuery.docs[0]
          opsData = { id: opsDoc.id, ...opsDoc.data() }
          orderId = opsData.sourceId || null
          console.log('Found OPS in ops_no collection:', variation, 'orderId:', orderId)
          break
        }
      }

      // If not found in ops_no, try orders by salesNo
      if (!orderId) {
        for (const variation of variations) {
          const orderQuery = await database.collection('orders').doc('data').collection('orders')
            .where('salesNo', '==', variation)
            .limit(1)
            .get()

          if (!orderQuery.empty) {
            orderId = orderQuery.docs[0].id
            console.log('Found order by salesNo:', variation, 'orderId:', orderId)
            break
          }
        }
      }

      let orderData: any = null
      let items: any[] = []
      let tedForms: any = {}
      let merchantName: string | null = null

      if (orderId) {
        const orderDoc = await database.collection('orders').doc('data').collection('orders').doc(orderId).get()

        if (orderDoc.exists) {
          orderData = { id: orderDoc.id, ...orderDoc.data() }
          items = orderData.items || []

          // Fetch merchant name from buyers collection → merchants collection
          const buyerCode = orderData.buyerCode || orderData.customerCode
          if (buyerCode) {
            // Try to find buyer by code
            const buyerQuery = await database.collection('buyers')
              .where('code', '==', buyerCode)
              .limit(1)
              .get()

            if (!buyerQuery.empty) {
              const buyerData = buyerQuery.docs[0].data()
              const merchantId = buyerData.primaryMerchantId

              if (merchantId) {
                // Fetch merchant name
                const merchantDoc = await database.collection('merchants').doc(merchantId).get()
                if (merchantDoc.exists) {
                  merchantName = merchantDoc.data()?.name || null
                }
              }
            }
          }

          // Also check if merchant is directly on order
          if (!merchantName && orderData.merchantCode) {
            merchantName = orderData.merchantCode
          }

          // Fetch TED forms for line items
          const tedPromises = items.map(async (item: any) => {
            if (item.articleName) {
              const tedQuery = await database.collection('tedForms')
                .where('empl_design_no', '==', item.articleName)
                .limit(1)
                .get()

              if (!tedQuery.empty) {
                const tedDoc = tedQuery.docs[0]
                return {
                  itemId: item.id,
                  ted: { id: tedDoc.id, ...tedDoc.data() }
                }
              }
            }
            return { itemId: item.id, ted: null }
          })

          const tedResults = await Promise.all(tedPromises)
          tedForms = tedResults.reduce((acc: any, item: any) => {
            if (item.ted) {
              acc[item.itemId] = item.ted
            }
            return acc
          }, {})
        }
      }

      return jsonResponse({
        opsNo,
        ops: opsData,
        order: orderData,
        tedForms,
        merchantName,
      })
    }

    // === GET /product-docs/:buyerCode/:articleCode - Full product documentation ===
    const productDocsMatch = path.match(/^\/product-docs\/([^/]+)\/(.+)$/)
    if (productDocsMatch && method === 'GET') {
      const buyerCode = decodeURIComponent(productDocsMatch[1])
      const articleCode = decodeURIComponent(productDocsMatch[2])

      // Fetch PDoc
      let pdoc: any = null
      const pdocQuery = await database.collection('pdoc')
        .where('buyerCode', '==', buyerCode)
        .where('articleCode', '==', articleCode)
        .limit(1)
        .get()

      if (!pdocQuery.empty) {
        pdoc = { id: pdocQuery.docs[0].id, ...pdocQuery.docs[0].data() }
      }

      // Fetch DWP if linked
      let dwp: any = null
      if (pdoc?.activeDwpNumber) {
        const dwpQuery = await database.collection('dwp')
          .where('dwpNumber', '==', pdoc.activeDwpNumber)
          .limit(1)
          .get()

        if (!dwpQuery.empty) {
          dwp = { id: dwpQuery.docs[0].id, ...dwpQuery.docs[0].data() }
        }
      }

      // Fetch TED
      let ted: any = null
      const tedQuery = await database.collection('tedForms')
        .where('buyer_code', '==', buyerCode)
        .where('empl_design_no', '==', articleCode)
        .limit(1)
        .get()

      if (!tedQuery.empty) {
        ted = { id: tedQuery.docs[0].id, ...tedQuery.docs[0].data() }
      }

      // Fetch buyer certifications
      const buyerCertsQuery = await database.collection('buyer_certifications')
        .where('buyerCode', '==', buyerCode)
        .get()

      const buyerCertifications = buyerCertsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Fetch company certifications that apply to this buyer
      const companyCertsQuery = await database.collection('company_certifications')
        .where('appliedBuyerCodes', 'array-contains', buyerCode)
        .get()

      const companyCertifications = companyCertsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Fetch buyer packaging instructions
      let packagingInstructions: any = null
      const buyerDoc = await database.collection('buyers').doc(buyerCode).get()
      if (buyerDoc.exists) {
        const buyerData = buyerDoc.data()
        packagingInstructions = buyerData?.packagingDetails || null
      }

      return jsonResponse({
        pdoc,
        dwp,
        ted,
        buyerCertifications,
        companyCertifications,
        packagingInstructions,
      })
    }

    // === POST /inspections/:id/complete - Mark inspection as complete ===
    const completeMatch = path.match(/^\/inspections\/([^/]+)\/complete$/)
    if (completeMatch && method === 'POST') {
      const inspectionId = completeMatch[1]

      const docRef = database.collection(INSPECTIONS_COLLECTION).doc(inspectionId)
      const doc = await docRef.get()

      if (!doc.exists) {
        return errorResponse('Inspection not found', 404)
      }

      const now = new Date().toISOString()
      await docRef.update({
        status: 'completed',
        completedAt: now,
        updatedAt: now
      })

      return jsonResponse({
        success: true,
        id: inspectionId,
        status: 'completed',
        completedAt: now
      })
    }

    // === PUT /inspections/:id - Update inspection (reschedule) ===
    const updateMatch = path.match(/^\/inspections\/([^/]+)$/)
    if (updateMatch && method === 'PUT') {
      const inspectionId = updateMatch[1]
      const body = await request.json()

      const docRef = database.collection(INSPECTIONS_COLLECTION).doc(inspectionId)
      const doc = await docRef.get()

      if (!doc.exists) {
        return errorResponse('Inspection not found', 404)
      }

      const currentData = doc.data()
      const updateData: any = {
        updatedAt: new Date().toISOString()
      }

      if (body.inspectionDate && body.inspectionDate !== currentData?.inspectionDate) {
        updateData.inspectionDate = body.inspectionDate
        updateData.status = 'rescheduled'
        updateData.rescheduledFrom = currentData?.inspectionDate
      }

      if (body.notes !== undefined) {
        updateData.notes = body.notes
      }

      await docRef.update(updateData)

      return jsonResponse({
        success: true,
        id: inspectionId,
        ...updateData
      })
    }

    // === GET /qc-reports/:opsNo - Get QC reports for an OPS ===
    const qcReportsMatch = path.match(/^\/qc-reports\/(.+)$/)
    if (qcReportsMatch && method === 'GET') {
      const opsNo = decodeURIComponent(qcReportsMatch[1])
      const variations = getOpsVariations(opsNo)

      // Fetch bazaar inspections
      const bazaarInspections: any[] = []
      for (const variation of variations) {
        const query = await database.collection('bazaar_inspections')
          .where('opsNo', '==', variation)
          .get()

        query.docs.forEach(doc => {
          bazaarInspections.push({ id: doc.id, ...doc.data() })
        })
      }

      // Fetch final inspections
      const finalInspections: any[] = []
      for (const variation of variations) {
        const query = await database.collection('final_inspections')
          .where('opsNo', '==', variation)
          .get()

        query.docs.forEach(doc => {
          finalInspections.push({ id: doc.id, ...doc.data() })
        })
      }

      return jsonResponse({
        opsNo,
        bazaarInspections,
        finalInspections,
        summary: {
          bazaarCount: bazaarInspections.length,
          finalCount: finalInspections.length,
          passedFinal: finalInspections.filter((i: any) => i.inspectionResult === 'PASS').length,
          failedFinal: finalInspections.filter((i: any) => i.inspectionResult === 'FAIL').length,
        }
      })
    }

    // === GET /buyers - List all buyers ===
    if (path === '/buyers' && method === 'GET') {
      const snapshot = await database.collection('buyers').get()
      const buyers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return jsonResponse(buyers)
    }

    // === GET /packaging-materials - List all packaging materials ===
    if (path === '/packaging-materials' && method === 'GET') {
      const snapshot = await database.collection('packaging_materials').get()
      const materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return jsonResponse(materials)
    }

    // 404 for unknown routes
    return errorResponse('Not found', 404)

  } catch (error) {
    console.error('API Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export const config = {
  path: ["/api/*"]
}
