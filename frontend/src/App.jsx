import { useWizard } from "./hooks/useWizard.js"
import { useState } from "react"
import Step1ImportPage from "./pages/Step1ImportPage.jsx"
import Step2ValidationPage from "./pages/Step2ValidationPage.jsx"
import Step3ConfigurationPage from "./pages/Step3ConfigurationPage.jsx"
import Step4CalculationPage from "./pages/Step4CalculationPage.jsx"
import Step5ExportPage from "./pages/Step5ExportPage.jsx"

const STEP_NAMES = ["Import", "Validierung", "Konfiguration", "Berechnung", "Export"]

function App() {
  const { step, next, back, goTo } = useWizard()
  const [orders, setOrders] = useState([])
  const [config, setConfig] = useState(null)
  const [routes, setRoutes] = useState(null)

  return(
    <div>
      <h1>ZoBaRoute</h1>
      <div className="steps">
        {STEP_NAMES.map(function (name, index) {
          let className = "step";
          if (index + 1 === step) {
            className = "step-active";
          }
          return <span key={index} className={className}>{name}</span>
        })}
      </div>
      {step === 1 && <Step1ImportPage setOrders={setOrders} next={next} />}
      {step === 2 && <Step2ValidationPage orders = {orders} setOrders={setOrders} next={next} />}
      {step === 3 && <Step3ConfigurationPage setConfig={setConfig} next={next} />}
      {step === 4 && <Step4CalculationPage config={config} setRoutes={setRoutes} routes={routes} next={next} />}
      {step === 5 && <Step5ExportPage routes={routes} goTo={goTo} setOrders={setOrders} setConfig={setConfig} setRoutes={setRoutes} />}
      {step > 1 && step < 5 && <button onClick={back}>Zurück</button>}
    </div>
  )
}

export default App;