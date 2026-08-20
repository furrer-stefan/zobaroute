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
