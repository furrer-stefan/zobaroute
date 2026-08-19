export async function geocodeAddress({ street, postalCode, city }) {
    const searchParams = new URLSearchParams({
        searchText: `${street.trim()} ${postalCode.trim()} ${city.trim()}`,
        type: "locations",
        origins: "address",
        sr: "4326",
        limit: "1"
    })
    const requestURL = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?${searchParams}`

    try{
        const response = await fetch(requestURL)
        if(!response.ok){
            throw new Error(`geo.admin.ch antwortete mit Status ${response.status}`);
        }
        const result = await response.json()
        if(result.results.length > 0){
            return { success: true, latitude: result.results[0].attrs.lat, longitude: result.results[0].attrs.lon }
        }else{
            return { success: false, error: "Adresse konnte nicht gefunden werden" }
        }
    }catch(error){
        return { success: false, error: "Der Dienst geo.admin.ch konnte nicht abgefragt werden", technicalFailure: true }
    }
}