import { useWizard } from "./hooks/useWizard.js"
import Step1ImportPage from "./pages/Step1ImportPage.jsx"
import { useState } from "react"

const STEP_NAMES = ["Import", "Validierung", "Konfiguration", "Berechnung", "Export"]

function App() {
  const { step, next, back } = useWizard()
  const [orders, setOrders] = useState([])
  const [config, setConfig] = useState(null)
  const [routes, setRoutes] = useState(null)

  return(
    <div>
      <h1>ZoBaRoute</h1>
      {STEP_NAMES.map(function (name, index) {
        let className = "step";
        if (index + 1 === step) {
          className = "step-active";
        }
        return <span key={index} className={className}>{name}</span>
      })}
      {step === 1 && <Step1ImportPage setOrders={setOrders} next={next} />}
      {step === 2 && <p>Hier kommt die Validierung und Bearbeitungsmodus</p>}
      {step === 3 && <p>Hier kommt die Konfiguration</p>}
      {step === 4 && <p>Hier kommt die Routenberechnung</p>}
      {step === 5 && <p>Hier kommt der Export</p>}
      <button onClick={back}>Zurück</button>
      <button onClick={next}>Vor</button>
    </div>
  )
}

export default App;