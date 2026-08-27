export async function fetchDistanceMatrix(points) {
    const apiKey = process.env.ORS_API_KEY
    if (!apiKey) {
        return { success: false, error: "Kein API-Schlüssel für OpenRouteService konfiguriert" }
    }
    const locations = []
    for(const point of points){
        locations.push([point.longitude, point.latitude])
    }

    const requestBody = {
        locations: locations,
        metrics: ["distance"],
        units: "m"
    }
    const requestURL = "https://api.openrouteservice.org/v2/matrix/driving-car"

    try{
        const response = await fetch(requestURL, {
            method: "POST",
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })

        if(!response.ok){
            throw new Error(`OpenRouteService antwortete mit Status ${response.status}`);
        }
        const result = await response.json()
        if(result.distances){
            return { success: true, matrix: result.distances }
        }else{
            return { success: false, error: "OpenRouteService lieferte keine Distanzmatrix" }
        }
    }catch(error){
        return { success: false, error: "Der Dienst OpenRouteService konnte nicht abgefragt werden", technicalFailure: true }
    }
}