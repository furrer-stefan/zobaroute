import { useState } from "react"
import { geocodeSingle } from "../services/routeApiService"

function Step3ConfigurationPage({ setConfig, next }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [teamCount, setTeamCount] = useState(10)
    const [street, setStreet] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [city, setCity] = useState("")
    async function handleConfiguration() {
        const teamCountNumber = Number(teamCount)
        if(!Number.isInteger(teamCountNumber) || teamCountNumber < 1){
            setError(`Die Menge für Teamanzahl ist keine gültige Zahl: '${teamCount}'`)
            return
        }
        setIsLoading(true)
        try{
            const result = await geocodeSingle({street, postalCode, city})
            setConfig({
                teamCount: teamCountNumber,
                depot: { latitude: result.latitude, longitude: result.longitude }
            })
            next()
        }catch(error){
            setError(error.message)
        }finally{
            setIsLoading(false)
        }
    }
    return(
        <div>
            <label>Anzahl Verteil-Teams</label>
            <input
                type="number"
                value={teamCount}
                onChange={function (event) { setTeamCount(event.target.value) }}
            />
            <p>Verteil-Zentrale</p>
            <label>Strasse</label>
            <input
                value={street}
                onChange={function (event) { setStreet(event.target.value) }}
            />
            <label>PLZ</label>
            <input
                value={postalCode}
                onChange={function (event) { setPostalCode(event.target.value) }}
            />
            <label>Ort</label>
            <input
                value={city}
                onChange={function (event) { setCity(event.target.value) }}
            />
            <button onClick={handleConfiguration} disabled={isLoading}>Bestätigen</button>
            {isLoading && <p>Daten werden validiert...</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default Step3ConfigurationPage