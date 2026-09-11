import { useState } from "react"
import { deleteSession } from "../services/routeApiService.js"

function Step5ExportPage({ routes, goTo, setOrders, setConfig, setRoutes }) {
    const [error, setError] = useState(null)
    const rows = []
    async function handleDelete() {
        const confirmed = window.confirm("Alle Bestellungen und Routen werden gelöscht und der Vorgang wird beendet. Wurden alle benötigten Dateien heruntergeladen?")
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
                <td><a href={`/api/routes/${route.routeId}/pdf`}>⬇ PDF</a></td>
                <td><a href={`/api/routes/${route.routeId}/gpx`}>⬇ GPX</a></td>
            </tr>)
        }
    }
    return(
        <div>
            <p className="intro">Lade für jedes Verteil-Team die Stoppliste als PDF und die Route als GPX-Datei herunter. Danach kannst du die Daten wieder löschen oder eine neue Berechnung starten.</p>
            {error && <p className="error">{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Stopps</th>
                        <th>PDF</th>
                        <th>GPX</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <button onClick={handleDelete}>Vorgang abschliessen und Daten löschen</button>
        </div>
    )
}

export default Step5ExportPage