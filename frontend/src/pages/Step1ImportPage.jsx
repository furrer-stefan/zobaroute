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
            <input type="file" accept=".xlsx" onChange={handleUpload} disabled={isLoading} />
            {isLoading && <p>Datei wird verarbeitet...</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default Step1ImportPage