import { useState } from "react"

const WIZARD_MIN_STEP = 1
const WIZARD_MAX_STEP = 5

export function useWizard() {
    const [step, setStep] = useState(WIZARD_MIN_STEP)

    function next() {
        if(step < WIZARD_MAX_STEP){
            setStep(step + 1)
        }
    }

    function back() {
        if(step > WIZARD_MIN_STEP){
            setStep(step - 1)
        }
    }

    function goTo(targetStep) {
        if(targetStep >= WIZARD_MIN_STEP && targetStep <= WIZARD_MAX_STEP){
            setStep(targetStep)
        }
    }

    return { step, next, back, goTo }
}