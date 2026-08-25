// phase 1 - clustering
// all the coordination-points will be devided by the amount of teams, if they are spatially related and in the same areas
// procedure: k means clustering

// notes:
// a "centroid" is a center of a cluster
// datapoints will always belong to the cluster, that has the nearest centroid
// in a next step, there are areas created and a new middlepoint/centroid for these areas are defined by the mean:
// every x and y difference of datapoint and centroid is listed in a column and the mean average will be taken from it
// the calculation of the neares centroid per datapoint will be done one more time
// this will be repeated a few times, until it doesn't get more exact

const METERS_PER_DEGREE  = 111320
const MAX_ROUNDS = 100
const SIZE_TOLERANCE = 0.1

function calculateDistance(a, b) {
    // calculate delta from both latitudes
    const deltaLat = (b.latitude - a.latitude) * METERS_PER_DEGREE 

    // calculate delta from bot longitudes with also regarding the latitude
    const meanLat = (a.latitude + b.latitude) / 2
    const deltaLon = (b.longitude - a.longitude) * METERS_PER_DEGREE  * Math.cos(meanLat * Math.PI / 180)

    // calculate pythagoras
    return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon)
}

function calculateCentroid(stops) {
    if(stops.length === 0){
        return null
    }
    
    // calculate median averages for all latitudes and longitudes of all stops
    let sumLat = 0
    let sumLon = 0
    for (const stop of stops){
        sumLat += stop.latitude
        sumLon += stop.longitude
    }
    const meanLat = sumLat / stops.length
    const meanLon = sumLon / stops.length

    return { latitude: meanLat, longitude: meanLon }
}

function clusterStops(stops, teamCount) {
    // this function returns an array of arrays: per team a list of stops (so all centroid clusters)
    // definining centroids
    const centroids = []    
    for(let i = 0; i < teamCount; i++){
        const index = Math.floor(i * stops.length / teamCount) // Math.floor always rounds the result down, length of stops will be divided by amount of teams and multiplied with current index (for 200 stops it is: 0, 50, 100, 150)
        centroids.push({
            latitude: stops[index].latitude,
            longitude: stops[index].longitude
        })
    }
    let clusters = []
    for (let round = 0; round < MAX_ROUNDS; round++) {
        clusters = []
        for(let i = 0; i < teamCount; i++){
            clusters.push([])
        }
        let hasChanged = false
        for(const stop of stops){
            let nearestDistance = Infinity
            let nearestClusterIndex = -1
            for(let i = 0; i < centroids.length; i++){
                const distance = calculateDistance(stop, centroids[i])
                if(distance < nearestDistance){
                    nearestDistance = distance
                    nearestClusterIndex = i
                }
            }
            if(stop.clusterIndex !== nearestClusterIndex){
                hasChanged = true
            }
            clusters[nearestClusterIndex].push(stop)
            stop.clusterIndex = nearestClusterIndex
        }
        if(!hasChanged){
            break
        }
        for (let i = 0; i < clusters.length; i++) {
            const newCentroid = calculateCentroid(clusters[i])
            if(newCentroid){
                centroids[i] = newCentroid
            }
        }
    }
    return clusters
}

// phase 2 - balancing the different clusters, so that every cluster has more or less the same amount of stops
// step 1: caluclating the size of one route with a variable tolerance (e.g. 10%)
// step 2: as long as a cluster is to big, stops will be moved to another cluster
// step 3: stop the automation, as soon as all clusters are in the accepted tolerance

function balanceClusterDistribution(clusters, stops, teamCount){
    const targetSize = stops.length / teamCount
    const maxSize = Math.ceil(targetSize * (1 + SIZE_TOLERANCE)) // ceil rounds up

    const maxShifts = stops.length * 2
    for (let shift = 0; shift < maxShifts; shift++) {
        let biggestSize = 0
        let biggestIndex = -1;
        for(let i = 0; i < clusters.length; i++){
            if(clusters[i].length > biggestSize){
                biggestSize = clusters[i].length
                biggestIndex = i
            }
        }
        if(biggestSize <= maxSize){
            break
        }
        const biggestCluster = clusters[biggestIndex]
        
        const centroids = [] 
        for (let i = 0; i < clusters.length; i++) {
            const newCentroid = calculateCentroid(clusters[i])
            if(newCentroid){
                centroids[i] = newCentroid
            }
        }

        let shortestDistance = Infinity
        let bestStopIndex = null
        let bestTargetClusterIndex = null
        for(let i = 0; i < biggestCluster.length; i++){
            for(let j = 0; j < clusters.length; j++){
                if(j === biggestIndex || clusters[j].length >= maxSize){
                    continue
                }
                const newCentroid = centroids[j]
                const distance = calculateDistance(biggestCluster[i], newCentroid)
                if(distance < shortestDistance){
                    shortestDistance = distance
                    bestStopIndex = i
                    bestTargetClusterIndex = j
                }
            }
        }
        if (bestStopIndex === null) { // if all clusters are all maxSize
            break
        }
        const stopToShift = biggestCluster.splice(bestStopIndex, 1)[0] // splice command --> takes the stop at position i and removes 1 element there, [0] in order to not get the array, just the value
        clusters[bestTargetClusterIndex].push(stopToShift)
        stopToShift.clusterIndex = bestTargetClusterIndex
    }
    return clusters
}
