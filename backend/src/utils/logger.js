import "dotenv/config"

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }

let currentLevel
if(LEVELS[process.env.LOG_LEVEL] !== undefined){
    currentLevel = LEVELS[process.env.LOG_LEVEL]
}else{
    currentLevel = LEVELS.info
}

function shouldLog(level) {
    return LEVELS[level] <= currentLevel
}

function formatMessage(level, logText) {
    const timeStamp = new Date().toISOString()
    return `[${timeStamp}] [${level}] ${logText}`
}

export function logError(logText) {
    if(shouldLog("error")){
        console.error(formatMessage("ERROR", logText))
    }
}

export function logWarn(logText) {
    if(shouldLog("warn")){
        console.warn(formatMessage("WARN", logText))
    }
}

export function logInfo(logText) {
    if(shouldLog("info")){
        console.log(formatMessage("INFO", logText))
    }
}

export function logDebug(logText) {
    if(shouldLog("debug")){
        console.log(formatMessage("DEBUG", logText))
    }
}