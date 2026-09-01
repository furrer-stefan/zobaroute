function replaceSpecialCharacters(text) {
    if(!text){
        return ""
    }

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;")
}

function convertItemsToText(items) {
    if(!items || items.length === 0){
        return "Keine Angaben zu den Bestellungen vorhanden"
    }
    const stringValues = []
    for(const item of items){
        stringValues.push(`${item.quantity}x ${item.size}g`)
    }
    return stringValues.join(", ")
}

export function buildGpx(route) {
    const lines = []
    lines.push(`<?xml version="1.0" encoding="UTF-8"?>`)
    lines.push(`<gpx version="1.1" creator="ZoBaRoute" xmlns="http://www.topografix.com/GPX/1/1">`)

    for(const stop of route.stops){
        const name = `${stop.sequencePosition}. ${stop.lastName}`
        let description = `${stop.firstName} ${stop.lastName}, ${stop.street}, ${stop.postalCode} ${stop.city} — ${convertItemsToText(stop.items)}`
        if(stop.comment){
            description = description + ` — ${stop.comment}`
        }

        lines.push(`  <wpt lat="${stop.latitude}" lon="${stop.longitude}">`)
        lines.push(`    <name>${replaceSpecialCharacters(name)}</name>`)
        lines.push(`    <desc>${replaceSpecialCharacters(description)}</desc>`)
        lines.push(`  </wpt>`)
    }

    lines.push(`  <rte>`)
    lines.push(`    <name>Team ${route.teamNumber}</name>`)
    for(const stop of route.stops){
        const name = `${stop.sequencePosition}. ${stop.lastName}`
        lines.push(`    <rtept lat="${stop.latitude}" lon="${stop.longitude}"><name>${replaceSpecialCharacters(name)}</name></rtept>`)
    }
    lines.push(`  </rte>`)

    lines.push(`</gpx>`)
    return lines.join("\n")
}

