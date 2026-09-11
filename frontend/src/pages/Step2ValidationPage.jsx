import { postOrders } from "../services/routeApiService"
import { useState } from "react"

const FIELD_LABELS = {
    firstName: "Vorname",
    lastName: "Nachname",
    street: "Strasse",
    postalCode: "PLZ",
    city: "Ort",
    items: "Bestellmenge"
}

const SIZES = [300, 500, 700]

function getQuantityForSize(items, size){
    const item = items.find(function (i) { return i.size === size })
    if(!item){
        return ""
    }
    return String(item.quantity)
}

function modifyOrders(orders, rowNumber, field, newValue) {
    const newOrders = []
    for(const order of orders){
        if(order.rowNumber === rowNumber){
            newOrders.push({ ...order, [field]: newValue })
        }else{
            newOrders.push(order)
        }
    }
    return newOrders
}

function buildNewItems(oldItems, changedSize, newValue) {
    const newItems = []
    for (const size of SIZES) {
        let quantity
        if (size === changedSize) {
            quantity = Number(newValue)
        } else {
            quantity = Number(getQuantityForSize(oldItems, size))
        }
        if (quantity > 0) {
            newItems.push({ size: size, quantity: quantity })
        }
    }
    return newItems
}

function modifyOrderItems(orders, rowNumber, size, newValue) {
  const newOrders = []
  for(const order of orders){
    if(order.rowNumber === rowNumber){
        const newItems = buildNewItems(order.items, size, newValue)
        newOrders.push({ ...order, items: newItems })
    } else {
        newOrders.push(order)
    }
  }
  return newOrders
}

function deleteOrder(orders, rowNumber) {
    const newOrders = []
    for(const order of orders){
        if(order.rowNumber !== rowNumber){
            newOrders.push(order)
        }
    }
    return newOrders
}

function Step2ValidationPage({ orders, setOrders, next }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    function handleChange(rowNumber, field, newValue) {
        setOrders(modifyOrders(orders, rowNumber, field, newValue))
    }
    function handleItemChange(rowNumber, size, newValue) {
        setOrders(modifyOrderItems(orders, rowNumber, size, newValue))
    }
    function handleDelete(rowNumber) {
        setOrders(deleteOrder(orders, rowNumber))
    }
    async function handleValidation() {
        setIsLoading(true)
        try{
            await postOrders(orders)
            next()
        }catch(errorCatch){
            setError(errorCatch.message)
        }finally{
            setIsLoading(false)
        }
    }
    const rows = []
    for (const order of orders) {
        let rowClass = ""
        if (!order.isValid) {
            rowClass = "row-invalid"
        }
        const messages = []
        for (const err of order.errors) {
            const label = FIELD_LABELS[err.field]
            if(label){
                messages.push(`${label}: ${err.message}`)
            }else{
                messages.push(err.message)
            }
        }
        const error = messages.join(", ")
        rows.push(<tr key={order.rowNumber} className={rowClass}>
            <td>{order.rowNumber}</td>
            <td>
                <input
                    value={order.firstName}
                    onChange={function (event) { handleChange(order.rowNumber, "firstName", event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={order.lastName}
                    onChange={function (event) { handleChange(order.rowNumber, "lastName", event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={order.street}
                    onChange={function (event) { handleChange(order.rowNumber, "street", event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={order.postalCode}
                    onChange={function (event) { handleChange(order.rowNumber, "postalCode", event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={order.city}
                    onChange={function (event) { handleChange(order.rowNumber, "city", event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={getQuantityForSize(order.items, 300)}
                    onChange={function (event) { handleItemChange(order.rowNumber, 300, event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={getQuantityForSize(order.items, 500)}
                    onChange={function (event) { handleItemChange(order.rowNumber, 500, event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={getQuantityForSize(order.items, 700)}
                    onChange={function (event) { handleItemChange(order.rowNumber, 700, event.target.value) }}
                />
            </td>
            <td>
                <input
                    value={order.comment}
                    onChange={function (event) { handleChange(order.rowNumber, "comment", event.target.value) }}
                />
            </td>
            <td>{error}</td>
            <td>
                <button onClick={function () { handleDelete(order.rowNumber) }}>Löschen</button>
            </td>
        </tr>)
    }
    return(
        <div>
            <p className="intro">Prüfe die eingelesenen Bestellungen. Fehlerhafte Zeilen sind farblich markiert und in der Spalte «Fehler» beschrieben. Korrigieren zuerst die Angaben direkt in der Tabelle oder lösche einzelne Zeilen. Erst wenn keine Fehler mehr vorliegen, können die Bestellungen gespeichert werden.</p>
            <table>
                <thead>
                    <tr>
                        <th>Nr</th>
                        <th>Vorname</th>
                        <th>Nachname</th>
                        <th>Strasse</th>
                        <th>PLZ</th>
                        <th>Ort</th>
                        <th>Anzahl 300g</th>
                        <th>Anzahl 500g</th>
                        <th>Anzahl 700g</th>
                        <th>Bemerkung</th>
                        <th>Fehler</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <button onClick={handleValidation} disabled={isLoading}>Validieren</button>
            {isLoading && <p>Daten werden validiert...</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default Step2ValidationPage