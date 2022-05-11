import MessengerService from "./Messenger.service";
import {CmUser} from "./IChatManager";
import * as fs from "fs";
import * as csvParser from "csv-parser";

const importService = {
    loadCsv(filePath: string): Promise<any[]> {
        const result = []
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', function(data){
                    try {
                        result.push(data)
                    }
                    catch(err) {
                        reject(err)
                    }
                })
                .on('end',function(){
                    resolve(result)
                });
        })
    },

    removeFile(filePath) {
        fs.unlinkSync(filePath)
    },

    async importMessengerUsersFromCsv(messengerService: MessengerService, filePath: string, deleteFileAfter = false): Promise<boolean> {
        let result:boolean = true
        try {
            const fileData: CmUser[] = await importService.loadCsv(filePath)

            result = await messengerService.syncUsers(fileData)

            if (result && deleteFileAfter) importService.removeFile(filePath)

        } catch (e) {
            result = false
            console.error('import users error', e)
        }

        return result
    }
}

export default importService
