import PDFDocument from "pdfkit"

// x-positions of columns in pts from left side
const COLUMN_X     = [40, 70, 140, 230, 380, 425, 520, 565, 610, 660]
const COLUMN_WIDTH = [25, 65, 85, 145, 40, 90, 40, 40, 40, 140]
const ROW_HEIGHT = 18
const PAGE_BOTTOM = 520

function getTotalsBySize(route) {
    const totals = { 300: 0, 500: 0, 700: 0 }
  
    for (const stop of route.stops) {
        for (const item of stop.items) {
            totals[item.size] = totals[item.size] + item.quantity
        }
    }

    return `${totals[300]}x 300g, ${totals[500]}x 500g, ${totals[700]}x 700g`
}

function getQuantityForSize(items, size){
    const item = items.find(function (i) { return i.size === size })
    if(!item){
        return ""
    }
    return String(item.quantity)
}

function drawRow(doc, cells, y) {
    for(let i = 0; i < cells.length; i++){
        doc.text(cells[i], COLUMN_X[i], y, { width: COLUMN_WIDTH[i], ellipsis: true, lineBreak: false })
    }
}

function drawLine(doc, y) {
    doc.moveTo(40, y).lineTo(800, y).lineWidth(0.5).stroke()
}

export async function buildPdf(route) {
    const headerRow = ["Nr", "Vorname", "Nachname", "Strasse", "PLZ", "Ort", "300g", "500g", "700g", "Bemerkung"]

    const tableBody = []
    for (const stop of route.stops) {
        tableBody.push([
            String(stop.sequencePosition),
            stop.firstName,
            stop.lastName,
            stop.street,
            stop.postalCode,
            stop.city,
            getQuantityForSize(stop.items, 300),
            getQuantityForSize(stop.items, 500),
            getQuantityForSize(stop.items, 700),
            stop.comment || ""
        ])
    }

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 })
    
    // title space
    doc.fontSize(18).text(`Team ${route.teamNumber}`, 40, 40)
    doc.fontSize(10).text(`${route.stops.length} Stopps, ${getTotalsBySize(route)}`, 40, 65)

    // header space
    let y = 95 // initial spacing
    doc.fontSize(9)
    drawRow(doc, headerRow, y)
    y = y + ROW_HEIGHT
    drawLine(doc, y - 4)

    // data space
    for(const cells of tableBody){
        if(y > PAGE_BOTTOM){
            doc.addPage()
            y = 40
            drawRow(doc, headerRow, y)
            y = y + ROW_HEIGHT
            drawLine(doc, y - 4)
        }
        drawRow(doc, cells, y)
        y = y + ROW_HEIGHT
        drawLine(doc, y - 4)
    }

    return new Promise(function (resolve, reject) {
        const chunks = [] // create empty chunks array
        doc.on("data", function (chunk) { chunks.push(chunk) }) // "on" registers a callback and adds the data to the chunk array
        doc.on("end", function () { resolve(Buffer.concat(chunks)) }) // when it ends, all the elements from chunk array are concated to one
        doc.on("error", reject) // if theres an error, a reject will be returned
        doc.end()
    })
}