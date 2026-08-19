function delay(milliseconds){
    return new Promise(function(resolve){
        setTimeout(resolve, milliseconds)
    })
}

export async function processQueue(tasks, delayMs, onProgress){
    const results = []
    for(let i = 0; i < tasks.length; i++){
        let result
        try{
            result = await tasks[i]()
        }catch(error){
            result = { success: false, error: "Die Aufgabe konnte nicht ausgeführt werden" }
        }
        results.push(result)
        if(onProgress){
            onProgress(i + 1, tasks.length)
        }
        if(i < tasks.length - 1){
            await delay(delayMs)
        }
    }
    return results
}