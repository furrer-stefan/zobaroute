import { useState } from "react"
import { deleteSession } from "../services/routeApiService.js"

function Step5ExportPage({ routes, goTo, setOrders, setConfig, setRoutes }) {
    const [error, setError] = useState(null)
    const rows = []
    async function handleDelete() {
        const confirmed = window.confirm("Alle Bestellungen und Routen werden gelöscht. Fortfahren?")
        if (!confirmed) {
            return
        }
        try{
            await deleteSession()
        }catch(error){
            setError(error.message)
        }
        setOrders([])
        setConfig(null)
        setRoutes(null)
        goTo(1)
    }
    if(routes){
        for(const route of routes){
            rows.push(<tr key={route.teamNumber}>
                <td>{route.teamNumber}</td>
                <td>{route.stops.length}</td>
                <td><a href={`/api/routes/${route.routeId}/pdf`}>PDF</a></td>
                <td><a href={`/api/routes/${route.routeId}/gpx`}>GPX</a></td>
            </tr>)
        }
    }
    return(
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Stopps</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            {error && <p className="error">{error}</p>}
            <button onClick={handleDelete}>Alle Daten löschen</button>
            <button onClick={function () { goTo(1) }}>Zurück zum Start</button>
        </div>
    )
}

export default Step5ExportPage