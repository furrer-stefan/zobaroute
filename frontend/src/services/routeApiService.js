import { del, get, post, postFile } from "./api.js"

// POST /api/orders/validate
export function validateOrdersFile(file) {
    return postFile("/api/orders/validate", file)
}

// POST /api/orders
export function postOrders(orders) {
    return post("/api/orders", orders)
}

// GET /api/orders
export function getOrders() {
    return get("/api/orders")
}

// POST /api/geocode
export function startGeocoding() {
    return post("/api/geocode", {})
}

// GET /api/geocode/progress
export function getGeocodingProgress() {
    return get("/api/geocode/progress")
}

// POST /api/geocode/address
export function geocodeSingle(address) {
    return post("/api/geocode/address", address)
}

// POST /api/routes/calculate
export function startCalculation(teamCount, depot) {
    return post("/api/routes/calculate", { teamCount, depot })
}

// GET /api/routes
export function getRoutes() {
    return get("/api/routes")
}

// DELETE /api/session
export function deleteSession() {
    return del("/api/session")
}
