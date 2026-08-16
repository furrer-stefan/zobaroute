import ExcelJS from 'exceljs'

const HEADERS = {
    "Vorname": "firstName",
    "Nachname": "lastName",
    "Strasse": "street",
    "PLZ": "postalCode",
    "Ort": "city",
    "Bemerkung": "comment"
}

const SIZE_HEADERS = {
    "Anzahl 300g": 300,
    "Anzahl 500g": 500,
    "Anzahl 700g": 700,
}

function toText(value) {
    if(value === null || value === undefined){
        return ""
    }
    return String(value).trim()
}

function toQuantity(value) {
    if(value === null || value === undefined || value === ""){
        return null
    }
    return value
}

export async function parseExcelBuffer(buffer) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.worksheets[0]
    if(!worksheet){
        throw new Error("Die Datei enthält kein Arbeitsblatt")
    }

    // HEADER CHECK
    const headers = worksheet.getRow(1)
    const columnIndexes = {}
    const sizeColumnIndexes = {}
    const missingColumns = []
    headers.eachCell(function(cell, colNumber) {
        const headerText = toText(cell.value)
        // check with HEADERS
        const fieldName = HEADERS[headerText]
        if(fieldName){
            columnIndexes[fieldName] = colNumber
            return
        }
        // check with SIZE_HEADERS
        const size = SIZE_HEADERS[headerText]
        if(size){
            sizeColumnIndexes[size] = colNumber
            return
        }
    })
    // check if all HEADERS and SIZE_HEADERS are found in excel
    for(const [header, field] of Object.entries(HEADERS)){
        if(!columnIndexes[field]){
            missingColumns.push(header)
        }
    }
    for(const [header, size] of Object.entries(SIZE_HEADERS)){
        if(!sizeColumnIndexes[size]){
            missingColumns.push(header)
        }
    }
    if (missingColumns.length > 0){
        throw new Error(`Folgende Spalten sind Pflicht und fehlen in der Datei: ${missingColumns.join(", ")}`)
    }

    // DATA PROCESSING
    const data = []
    worksheet.eachRow(function(row, rowNumber) {
        if(rowNumber === 1){ return }
        const firstName = toText(row.getCell(columnIndexes.firstName).value)
        const lastName = toText(row.getCell(columnIndexes.lastName).value)
        const street = toText(row.getCell(columnIndexes.street).value)
        const postalCode = toText(row.getCell(columnIndexes.postalCode).value)
        const city = toText(row.getCell(columnIndexes.city).value)
        const comment = toText(row.getCell(columnIndexes.comment).value)
        const items = []
        for(const [size, colNumber] of Object.entries(sizeColumnIndexes)){
            const cellValue = toQuantity(row.getCell(colNumber).value)
            if(cellValue !== null && cellValue !== 0){
                items.push({ size: Number(size), quantity: cellValue })
            }
        }
        data.push({
            rowNumber,
            firstName,
            lastName,
            street,
            postalCode,
            city,
            comment,
            items
        })
    })
    return data
}