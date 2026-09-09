import { useWizard } from "./hooks/useWizard.js"
import { useState } from "react"
import Step1ImportPage from "./pages/Step1ImportPage.jsx"
import Step2ValidationPage from "./pages/Step2ValidationPage.jsx"
import Step3ConfigurationPage from "./pages/Step3ConfigurationPage.jsx"

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
      {step === 2 && <Step2ValidationPage orders = {orders} setOrders={setOrders} next={next} />}
      {step === 3 && <Step3ConfigurationPage setConfig={setConfig} next={next} />}
      {step === 4 && <p>Hier kommt die Routenberechnung</p>}
      {step === 5 && <p>Hier kommt der Export</p>}
      <button onClick={back}>Zurück</button>
    </div>
  )
}

export default App;