import 'dotenv/config'

export default {
    port: process.env.PORT || 3001,
    apiKey: process.env.API_KEY || 'vCxufgFBKBj9WyPaWSWEZpPM',
    tlApiId: process.env.TL_API_ID,
    tlApiHash:  process.env.TL_API_HASH,
    chatTitle: process.env.CHAT_TITLE,
    importFilePath: process.env.IMPORT_FILE_PATH,
    importIntervalSec: parseInt(process.env.IMPORT_INTERVAL_SEC) || 0,
    importDeleteFile: process.env.IMPORT_DELETE_FILE === 'true',
};
