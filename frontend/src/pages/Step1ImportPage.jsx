import { validateOrdersFile } from "../services/routeApiService"
import { useState } from "react"

function Step1ImportPage({ setOrders, next }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    async function handleUpload(event) {
        const file = event.target.files[0];
        if(file === undefined){
            return
        }
        setIsLoading(true)
        try{
            const result = await validateOrdersFile(file)
            setOrders(result.orders)
            next()
        }catch(error){
            setError(error.message)
        }finally{
            setIsLoading(false)
        }
    }
    return(
        <div>
            <p className="intro">Lade eine Excel-Datei mit allen Bestellungen hoch. Die erste Zeile muss exakt die folgenden Spaltentitel enthalten: Vorname, Nachname, Strasse, PLZ, Ort, Anzahl 300g, Anzahl 500g, Anzahl 700g, Bemerkung. Die Adressdaten müssen in den darunterliegenden Zeilen enthalten sein.</p>
            {error && <p className="error">{error}</p>}
            {isLoading && <p className="status">Datei wird verarbeitet...</p>}
            <input type="file" accept=".xlsx" onChange={handleUpload} disabled={isLoading} />
        </div>
    )
}

export default Step1ImportPage