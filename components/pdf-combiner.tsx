'use client'

import React, { useState, ChangeEvent } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUp, ArrowDown } from 'lucide-react'

interface PDFFile {
  file: File;
  name: string;
}

export function PdfCombiner() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPdfFiles = Array.from(files)
        .filter(file => file.type === 'application/pdf')
        .map(file => ({ file, name: file.name }))
      setPdfFiles(prevFiles => [...prevFiles, ...newPdfFiles])
    }
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newPdfFiles = [...pdfFiles]
    if (direction === 'up' && index > 0) {
      [newPdfFiles[index - 1], newPdfFiles[index]] = [newPdfFiles[index], newPdfFiles[index - 1]]
    } else if (direction === 'down' && index < newPdfFiles.length - 1) {
      [newPdfFiles[index], newPdfFiles[index + 1]] = [newPdfFiles[index + 1], newPdfFiles[index]]
    }
    setPdfFiles(newPdfFiles)
  }

  const removeFile = (index: number) => {
    const newPdfFiles = pdfFiles.filter((_, i) => i !== index)
    setPdfFiles(newPdfFiles)
  }

  const combinePDFs = async () => {
    if (pdfFiles.length === 0) {
      alert('Por favor, selecciona al menos un archivo PDF.')
      return
    }

    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(pdfBytes)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'combined_pdf.pdf'
      link.click()
    } catch (error) {
      console.error('Error al combinar PDFs:', error)
      alert('Ocurrió un error al combinar los PDFs. Por favor, intenta de nuevo.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Combinador de PDFs</h1>
      <div className="mb-4">
        <Label htmlFor="pdf-upload" className="block mb-2">
          Seleccionar PDFs
        </Label>
        <Input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="w-full"
        />
      </div>
      {pdfFiles.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Archivos seleccionados:</h2>
          <ul className="space-y-2">
            {pdfFiles.map((pdfFile, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <span className="truncate flex-grow">{pdfFile.name}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === pdfFiles.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeFile(index)}
                  >
                    &times;
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button onClick={combinePDFs} className="w-full" disabled={pdfFiles.length === 0}>
        Combinar PDFs
      </Button>
    </div>
  )
}