import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'

export interface DOCXInvoiceData {
  id: string
  number?: string
  date: string
  dueDate?: string
  currency: string
  status?: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  client?: {
    name: string
    email?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
}

export class InvoiceDOCXGenerator {
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  generateInvoiceDOCX(invoice: DOCXInvoiceData): Document {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Invoice Header
            new Paragraph({
              children: [
                new TextRun({
                  text: "INVOICE",
                  bold: true,
                  size: 32,
                  color: "2563EB"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Invoice Details
            new Paragraph({
              children: [
                new TextRun({
                  text: `Invoice #: ${invoice.number || invoice.id}`,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${this.formatDate(invoice.date)}`,
                  size: 22
                })
              ],
              spacing: { after: 200 }
            }),

            ...(invoice.dueDate ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Due Date: ${this.formatDate(invoice.dueDate)}`,
                    size: 22
                  })
                ],
                spacing: { after: 200 }
              })
            ] : []),

            ...(invoice.status ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Status: ${invoice.status.toUpperCase()}`,
                    bold: true,
                    size: 22,
                    color: invoice.status === 'paid' ? '059669' : invoice.status === 'overdue' ? 'DC2626' : 'D97706'
                  })
                ],
                spacing: { after: 400 }
              })
            ] : []),

            // Client Information
            ...(invoice.client ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Bill To:",
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { after: 200 }
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: invoice.client.name,
                    bold: true,
                    size: 22
                  })
                ],
                spacing: { after: 100 }
              }),

              ...(invoice.client.email ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: invoice.client.email,
                      size: 20
                    })
                  ],
                  spacing: { after: 100 }
                })
              ] : []),

              ...(invoice.client.address ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: invoice.client.address,
                      size: 20
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${invoice.client.city || ''}${invoice.client.state ? `, ${invoice.client.state}` : ''} ${invoice.client.zip || ''}`,
                      size: 20
                    })
                  ],
                  spacing: { after: 100 }
                }),
                ...(invoice.client.country ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: invoice.client.country,
                        size: 20
                      })
                    ],
                    spacing: { after: 400 }
                  })
                ] : [new Paragraph({ spacing: { after: 400 } })])
              ] : [new Paragraph({ spacing: { after: 400 } })])
            ] : [new Paragraph({ spacing: { after: 400 } })]),

            // Items Table
            new Paragraph({
              children: [
                new TextRun({
                  text: "Items:",
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 200 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Description", bold: true })],
                        alignment: AlignmentType.CENTER
                      })],
                      width: { size: 40, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Qty", bold: true })],
                        alignment: AlignmentType.CENTER
                      })],
                      width: { size: 15, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Rate", bold: true })],
                        alignment: AlignmentType.CENTER
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Amount", bold: true })],
                        alignment: AlignmentType.CENTER
                      })],
                      width: { size: 25, type: WidthType.PERCENTAGE }
                    })
                  ]
                }),
                // Item rows
                ...invoice.items.map(item => new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: item.description })] })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: item.quantity.toString() })],
                        alignment: AlignmentType.CENTER
                      })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: this.formatCurrency(item.rate, invoice.currency) })],
                        alignment: AlignmentType.RIGHT
                      })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: this.formatCurrency(item.amount, invoice.currency) })],
                        alignment: AlignmentType.RIGHT
                      })]
                    })
                  ]
                }))
              ]
            }),

            new Paragraph({ spacing: { after: 400 } }),

            // Totals
            new Table({
              width: { size: 50, type: WidthType.PERCENTAGE },
              alignment: AlignmentType.RIGHT,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Subtotal:", bold: true })],
                        alignment: AlignmentType.RIGHT
                      })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: this.formatCurrency(invoice.subtotal, invoice.currency) })],
                        alignment: AlignmentType.RIGHT
                      })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Tax:", bold: true })],
                        alignment: AlignmentType.RIGHT
                      })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: this.formatCurrency(invoice.tax, invoice.currency) })],
                        alignment: AlignmentType.RIGHT
                      })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Total:", bold: true, size: 24 })],
                        alignment: AlignmentType.RIGHT
                      })]
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ 
                          text: this.formatCurrency(invoice.total, invoice.currency),
                          bold: true,
                          size: 24
                        })],
                        alignment: AlignmentType.RIGHT
                      })]
                    })
                  ]
                })
              ]
            }),

            // Notes
            ...(invoice.notes ? [
              new Paragraph({ spacing: { after: 400 } }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Notes:",
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: invoice.notes,
                    size: 20
                  })
                ]
              })
            ] : [])
          ]
        }
      ]
    })

    return doc
  }

  async generateBuffer(invoice: DOCXInvoiceData): Promise<Buffer> {
    const doc = this.generateInvoiceDOCX(invoice)
    return await Packer.toBuffer(doc)
  }
}

export const invoiceDOCXGenerator = new InvoiceDOCXGenerator()