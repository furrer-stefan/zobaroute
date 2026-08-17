const HEADERS = [
    "firstName",
    "lastName",
    "street",
    "postalCode",
    "city",
    "comment"
]

const MANDATORY_FIELDS = [
    "firstName",
    "lastName",
    "street",
    "postalCode",
    "city"
]

function isEmptyRow(order) {
    for(const field of HEADERS){
        if(order[field] !== ""){
            return false
        }
    }
    return order.items.length === 0
}

function checkMandatoryFields(order) {
    const errors = []
    for(const field of MANDATORY_FIELDS){
        if(order[field] === ""){
            errors.push({ field: field, message: "Das Feld darf nicht leer sein" })
        }
    }
    return errors
}

function checkPostalCode(order) {
    const errors = []
    if(order.postalCode !== "" && !/^\d{4}$/.test(order.postalCode)){
        errors.push({ field: "postalCode", message: "Die PLZ muss aus vier Ziffern bestehen"})
    }
    return errors
}

function checkItems(order) {
    const errors = []
    const itemsCount = order.items.length
    if(itemsCount < 1){
        errors.push({ field: "items", message: "Mindestens eines der Anzahl Bestellungen Felder muss eine Menge beinhalten" })
    }
    for(const item of order.items){
        if(typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0){
            errors.push({ field: "items", size: item.size, message: `Die Menge für 'Anzahl ${item.size}g' ist keine gültige Zahl` })
        }
    }
    return errors
}

function buildComparisonKey(order){
    const generalValues = []
    for(const field of HEADERS){
        generalValues.push(order[field])
    }
    const itemValues = JSON.stringify(order.items)
    const comparisonKey = `${generalValues.join("|")}|${itemValues}`
    return comparisonKey
}

function checkDuplicates(orders) {
    const seen = new Set()
    for(const order of orders){
        if(order.errors.length > 0){continue} // if an error already exists, it will not be checke for duplicates
        const comparisonKey = buildComparisonKey(order)
        if(seen.has(comparisonKey)){
            order.errors.push({ field: null, message: "Diese Zeile ist ein Duplikat und kommt im Excel mehrmals vor"})
        }else{
            seen.add(comparisonKey)
        }
    }
}

export function validateOrders(orders) {
    for(const order of orders){
        order.errors = []
        if(isEmptyRow(order)){
            order.errors.push({ field: null, message: "Diese Zeile ist komplett leer" })
            order.isValid = false
            continue
        }
        order.errors.push(...checkMandatoryFields(order))
        order.errors.push(...checkPostalCode(order))
        order.errors.push(...checkItems(order))
    }
    checkDuplicates(orders)
    for(const order of orders){
        order.isValid = order.errors.length === 0
    }
    return orders
}