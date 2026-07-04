import jsPDF from 'jspdf'
import type { Mascota } from './supabase'

// Genera un PDF tamaño carnet (85.6mm x 54mm, estándar tarjeta) con frente y reverso
export async function generarCarnetPDF(mascota: Mascota, qrDataUrl: string) {
  const W = 85.6
  const H = 54
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] })

  // ---- FRENTE ----
  doc.setFillColor(10, 31, 68) // navy
  doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(212, 175, 55) // gold accent bar
  doc.rect(0, 0, W, 4, 'F')

  if (mascota.foto_url) {
    try {
      const img = await loadImageBase64(mascota.foto_url)
      doc.addImage(img, 'JPEG', 4, 8, 24, 24, undefined, 'FAST')
    } catch { /* si falla la foto, seguimos sin ella */ }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(mascota.nombre, 31, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`${mascota.tipo} · ${mascota.raza || 'N/D'}`, 31, 18)
  doc.text(`Color: ${mascota.color || 'N/D'}`, 31, 23)
  doc.setFontSize(6)
  const desc = doc.splitTextToSize(mascota.descripcion || '', 50)
  doc.text(desc.slice(0, 3), 31, 28)

  doc.setFontSize(6)
  doc.setTextColor(212, 175, 55)
  doc.text('FiruLink · Carnet Digital de Mascota', 4, H - 4)

  // ---- REVERSO ----
  doc.addPage([W, H], 'landscape')
  doc.setFillColor(248, 247, 242) // cream
  doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(10, 31, 68)
  doc.rect(0, 0, W, 4, 'F')

  doc.addImage(qrDataUrl, 'PNG', W / 2 - 15, 7, 30, 30)
  doc.setTextColor(10, 31, 68)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('Escanea si me encontraste', W / 2, 40, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.text('firulink.app', W / 2, 44, { align: 'center' })

  doc.save(`carnet-${mascota.nombre}.pdf`)
}

function loadImageBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('no ctx')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg'))
    }
    img.onerror = reject
    img.src = url
  })
}
