/**
 * File parsing utilities for CSV and Excel files
 * Supports various formats and lets AI interpret the data
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface FileParseResult {
  success: boolean
  data: any[]
  headers: string[]
  rawData: string
  fileName: string
  fileType: 'csv' | 'excel'
  error?: string
}

export interface ParsedFileData {
  originalFileName: string
  fileType: 'csv' | 'excel'
  headers: string[]
  rows: any[]
  summary: string
  totalRows: number
}

/**
 * Parse uploaded file (CSV or Excel) and extract data
 */
export async function parseUploadedFile(file: File): Promise<FileParseResult> {
  try {
    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith('.csv')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (!isCSV && !isExcel) {
      return {
        success: false,
        data: [],
        headers: [],
        rawData: '',
        fileName: file.name,
        fileType: 'csv',
        error: 'Unsupported file type. Please upload CSV or Excel files.'
      }
    }

    if (isCSV) {
      return await parseCSVFile(file)
    } else {
      return await parseExcelFile(file)
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      headers: [],
      rawData: '',
      fileName: file.name,
      fileType: 'csv',
      error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Parse CSV file using Papa Parse
 */
async function parseCSVFile(file: File): Promise<FileParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || []
        const data = results.data as any[]
        
        // Create raw data representation for AI
        const rawData = generateRawDataSummary(headers, data, file.name)
        
        resolve({
          success: true,
          data,
          headers,
          rawData,
          fileName: file.name,
          fileType: 'csv'
        })
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          headers: [],
          rawData: '',
          fileName: file.name,
          fileType: 'csv',
          error: `CSV parse error: ${error.message}`
        })
      }
    })
  })
}

/**
 * Parse Excel file using XLSX
 */
async function parseExcelFile(file: File): Promise<FileParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            headers: [],
            rawData: '',
            fileName: file.name,
            fileType: 'excel',
            error: 'Excel file appears to be empty'
          })
          return
        }
        
        // First row as headers
        const headers = (jsonData[0] as any[]).map(h => String(h || '').trim()).filter(Boolean)
        
        // Rest as data rows
        const rows = jsonData.slice(1).map((row: any) => {
          const rowData: any = {}
          headers.forEach((header, index) => {
            rowData[header] = row[index] || ''
          })
          return rowData
        }).filter(row => Object.values(row).some(val => val !== ''))
        
        const rawData = generateRawDataSummary(headers, rows, file.name)
        
        resolve({
          success: true,
          data: rows,
          headers,
          rawData,
          fileName: file.name,
          fileType: 'excel'
        })
      } catch (error) {
        resolve({
          success: false,
          data: [],
          headers: [],
          rawData: '',
          fileName: file.name,
          fileType: 'excel',
          error: `Excel parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        headers: [],
        rawData: '',
        fileName: file.name,
        fileType: 'excel',
        error: 'Failed to read Excel file'
      })
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Generate a summary of the raw data for AI processing
 */
function generateRawDataSummary(headers: string[], data: any[], fileName: string): string {
  const summary = `
FILE: ${fileName}
TOTAL_ROWS: ${data.length}
HEADERS: ${headers.join(', ')}

SAMPLE_DATA (first 5 rows):
${data.slice(0, 5).map((row, index) => {
  const rowData = headers.map(header => `${header}: ${row[header] || 'N/A'}`).join(', ')
  return `Row ${index + 1}: ${rowData}`
}).join('\n')}

DATA_STRUCTURE:
${JSON.stringify(data.slice(0, 3), null, 2)}
`
  return summary.trim()
}

/**
 * Convert file data to AI-friendly prompt format
 */
export function convertFileDataToPrompt(parseResult: FileParseResult, userInstructions?: string): string {
  if (!parseResult.success) {
    return `Error parsing file: ${parseResult.error}`
  }

  const instructions = userInstructions || 'Generate invoices from this data'
  
  return `${instructions}

UPLOADED FILE DATA:
${parseResult.rawData}

INSTRUCTIONS:
- Analyze the data structure and extract relevant invoice information
- Handle any format - banks exports, accounting systems, custom spreadsheets, etc.
- Create appropriate invoices based on the data patterns you detect
- If data represents transactions, create invoices for each relevant transaction
- If data represents clients/projects, create invoices for each client/project
- Use intelligent field mapping - be flexible with column names and data formats
- Fill in reasonable defaults for missing information
- Group related data if it makes sense for billing

Please generate invoice(s) based on this data.`
}

/**
 * Prepare file data for batch processing
 */
export function prepareFileDataForBatch(parseResult: FileParseResult): string[] {
  if (!parseResult.success || parseResult.data.length === 0) {
    return []
  }

  // For batch processing, create individual prompts for each row
  return parseResult.data.map((row, index) => {
    const rowData = Object.entries(row)
      .filter(([key, value]) => value && String(value).trim() !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
    
    return `Row ${index + 1} from ${parseResult.fileName}: ${rowData}`
  })
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    }
  }

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload CSV or Excel files (.csv, .xls, .xlsx).'
    }
  }

  return { valid: true }
}
