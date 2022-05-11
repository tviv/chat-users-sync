import {CmUser} from './IChatManager'
import TelegramCommunicatorGram from './impl/TelegramCommunicatorGram'
import MessengerService from "./Messenger.service";
import config from "../config";
import importService from './import.service'

const chatManager = new TelegramCommunicatorGram({
    apiId: parseInt(config.tlApiId),
    apiHash: config.tlApiHash,
    chatTitle: config.chatTitle

})

const messengerService = new MessengerService(chatManager)

export {CmUser, messengerService, importService}
