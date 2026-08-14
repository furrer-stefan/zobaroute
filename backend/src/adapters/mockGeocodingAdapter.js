const KNOWN_ADDRESSES = {
    "leberenstrasse 25": { latitude: 47.537891, longitude: 8.734644 },
    "rundstrasse 42": { latitude: 47.528561, longitude: 8.713586 },
    "begonienstrasse 23": { latitude: 47.534191, longitude: 8.734803 },
    "randbühlstrasse 5": { latitude: 47.528717, longitude: 8.752035 },
    "wiesendangerstrasse 197": { latitude: 47.533123, longitude: 8.752645 },
    "stadlerstrasse 22": { latitude: 47.534702, longitude: 8.738559 },
    "gladiolenstrasse 11": { latitude: 47.533875, longitude: 8.744570 },
    "forrenbergstrasse 37": { latitude: 47.528763, longitude: 8.730822 },
    "bachtobelstrasse 10": { latitude: 47.537354, longitude: 8.736776 },
    "winterthurerstrasse 25": { latitude: 47.533634, longitude: 8.729673 },
    "kirchhügelstr. 7b": { latitude: 47.534775, longitude: 8.727251 },
    "im räbhag 2": { latitude: 47.539967, longitude: 8.731194 },
}

export async function geocodeAddress({ street, postalCode, city }) {
    
    await new Promise(resolve => setTimeout(resolve, 50))

    const coordinates = KNOWN_ADDRESSES[street.trim().toLowerCase()]

    if (coordinates) {
        return { success: true, latitude: coordinates.latitude, longitude: coordinates.longitude }
    } else {
        return { success: false, error: "Adresse konnte nicht gefunden werden" }
    }
}
