import { geocodeAddress } from "../adapters/geocodingAdapter.js"
import { processQueue } from "../adapters/rateLimiterQueue.js"

const GEOCODING_DELAY = 3000

export async function geocodeOrders(orders, onProgress) {
    const tasks = []
    for(const order of orders){
        tasks.push(function () { return geocodeAddress({ street: order.street, postalCode: order.postalCode, city: order.city }) })
    }

    const results = await processQueue(tasks, GEOCODING_DELAY, onProgress)

    const combinedResults = []
    for(let i = 0; i < orders.length; i++){
        const order = orders[i]
        const result = results[i]

        if(result.success === true){
            order.longitude = result.longitude
            order.latitude = result.latitude
            order.geocodingStatus = "successful"
        }else if(result.technicalFailure === true){
            order.geocodingStatus = "not_started"
        }else{
            order.geocodingStatus = "failed"
            order.geocodingError = result.error
        }
        combinedResults.push(order)
    }
    return combinedResults
}

export async function geocodeSingleAddress(address) {
    const missingFields = []
    const street = (address.street || "").trim() // if address.street is not valid, street will be set to ""
    const postalCode = (address.postalCode || "").trim()
    const city = (address.city || "").trim()
    if(street === ""){
        missingFields.push("Strasse")
    }
    if(postalCode === ""){
        missingFields.push("PLZ")
    }
    if(city === ""){
        missingFields.push("Ort")
    }
    if(missingFields.length > 0){
        return { success: false, error: `Folgende Angaben fehlen in der Adresse: ${missingFields.join(", ")}`}
    }
    return await geocodeAddress({ street: street, postalCode: postalCode, city: city })
}