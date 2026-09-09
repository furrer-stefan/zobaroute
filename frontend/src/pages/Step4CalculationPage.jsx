import { useEffect } from "react"
import { useState } from "react"
import { getGeocodingProgress, startCalculation, startGeocoding } from "../services/routeApiService"

function getTotalsBySize(route) {
    const totals = { 300: 0, 500: 0, 700: 0 }
  
    for (const stop of route.stops) {
        for (const item of stop.items) {
            totals[item.size] = totals[item.size] + item.quantity
        }
    }

    return totals
}

function Step4CalculationPage({ config, setRoutes, routes, next }) {
    const [progress, setProgress] = useState(null)
    const [error, setError] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)
    useEffect(function () {
        startGeocoding()
        const timer = setInterval(async function () {
            try{
            const result = await getGeocodingProgress()
            setProgress(result)
            if(result.error){
                setError(result.error)
                clearInterval(timer)
                return
            }
            if(result.running === false){
                clearInterval(timer)
                setIsCalculating(true)
                const calcResult = await startCalculation(config.teamCount, config.depot)
                setRoutes(calcResult.routes)
                setIsCalculating(false)
            }
            }catch(error){
                setError(error.message)
                setIsCalculating(false)
                clearInterval(timer)
            }
        }, 2000)

        return function () {
            clearInterval(timer)
        }
    }, []) // [] only do once

    const rows = []
    if(routes){
        for(const route of routes){
            const totals = getTotalsBySize(route)
            rows.push(<tr key={route.teamNumber}>
                <td>{route.teamNumber}</td>
                <td>{route.stops.length}</td>
                <td>{totals[300]}</td>
                <td>{totals[500]}</td>
                <td>{totals[700]}</td>
            </tr>)

        }
    }
    return(
        <div>
            {progress && <p>{progress.done} von {progress.total} Adressen verarbeitet</p>}
            {isCalculating && <p>Optimale Routen werden berechnet...</p>}
            {error && <p className="error">{error}</p>}
            {routes && <table>
                <thead>
                    <tr>
                        <th>Teamnummer</th>
                        <th>Anzahl Stopps</th>
                        <th>Anzahl 300g</th>
                        <th>Anzahl 500g</th>
                        <th>Anzahl 700g</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>}
            {routes && <button onClick={next}>Weiter zum Export</button>}
        </div>
    )
}

export default Step4CalculationPage