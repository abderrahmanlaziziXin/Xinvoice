import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Document Generator MVP
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Generate invoices and NDAs with AI assistance
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link
            href="/new/invoice"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Single Invoice
          </Link>
          
          <Link
            href="/new/invoice-batch"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Create Batch Invoices
          </Link>
          
          <button
            disabled
            className="px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
          >
            Create NDA (Coming Soon)
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ This application does not provide legal advice.</p>
          <p>All generated documents should be reviewed by qualified professionals.</p>
        </div>
      </div>
    </main>
  )
}
