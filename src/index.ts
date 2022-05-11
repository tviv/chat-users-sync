import App from "./App";
import config from "./config";
import router from "./routes";
import {importService, messengerService} from "./services";

const port = process.env.PORT || config.port || 3000;
const app = new App(router).express;


const runScheduleOperation = async () => {
    let result
    if (config.importIntervalSec) {
        if (messengerService.isActive()) {
           result = await importService.importMessengerUsersFromCsv(messengerService, config.importFilePath, config.importDeleteFile)
        }

        setTimeout(() => {
            runScheduleOperation()
        }, (result ? config.importIntervalSec : 2 * 3600) * 1000 ) //if bad sync then 2 hour-delay
    }
}

setTimeout(() => runScheduleOperation(), 7000) //let it connect

app.listen(port, () => {
    console.log(`API is listening on http://localhost:${port}`);
});
