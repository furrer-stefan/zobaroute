async function handleResponse(response) {
    let data
    try{
        data = await response.json()
    }catch(error){
        throw new Error(`Server antwortete mit Status ${response.status}`)
    }

    if(!response.ok){
        throw new Error(data.message || "Unbekannter Fehler")
    }
    return data
}

export async function get(path) {
    const response = await fetch(path)
    return handleResponse(response)
}

export async function post(path, body) {
    const response = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    return handleResponse(response)
}

export async function postFile(path, file) {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch(path, {
        method: "POST",
        body: formData
    })
    return handleResponse(response)
}

export async function del(path) {
    const response = await fetch(path, {
        method: "DELETE"
    })
    return handleResponse(response)
}