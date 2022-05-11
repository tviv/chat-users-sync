import {IChatManager, CmUser, CmInfo} from "../IChatManager";
import {Api, TelegramClient} from "telegram";
import {StoreSession} from "telegram/sessions";
import input from "input";
import {Dialog} from "telegram/tl/custom/dialog";
import TypeInputPeer = Api.TypeInputPeer;
import {generateRandomBytes, readBigIntFromBuffer} from "telegram/Helpers";
import InputPhoneContact = Api.InputPhoneContact;
import ChatBannedRights = Api.ChatBannedRights;

interface TelegramInitParams {
    apiId: number,
    apiHash: string,
    chatTitle: string

}

export default class TelegramCommunicatorGram implements IChatManager {
    private initParams: TelegramInitParams;
    private client: TelegramClient;
    private chat: Dialog

    constructor(params: TelegramInitParams) {
        this.initParams = params;

        this.init()
    }

    private async init() {
        await this.connect()

        if (this.client) {
            const dialogs = await this.client.getDialogs({limit: 100});

            const chat = dialogs.find(x => x.title === this.initParams.chatTitle)
            this.chat = chat
            if (!chat) {
                console.error(`chat not found ${this.initParams.chatTitle}`)
            }
        }
    }

    private async connect() {
        const session = new StoreSession(`.${this.initParams.apiId}_session`);

        console.log("Loading tl...");
        const client = new TelegramClient(session, this.initParams.apiId, this.initParams.apiHash, {
            connectionRetries: 5,
        });
        await client.start({
            phoneNumber: async () => await input.text("Please enter your number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () =>
                await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        });
        console.log("You should now be connected.");
        client.session.save();

        this.client = client
    }

    isActive = (): boolean => !!this.chat

    async getInfo(): Promise<CmInfo> {
        return Promise.resolve({
            status: this.isActive() ? 'active' : 'inactive',
            chatTitle: this.isActive() ? this.chat.title : undefined,
            chatParticipantCount: this.isActive() ? (await this.getUsers()).length : undefined

        });
    }

    async getUsers(): Promise<CmUser[]> {
        let result: CmUser[] = []
        if (this.isActive()) {

            const pts = await this.client.getParticipants(this.chat.inputEntity, {})
            result = pts.map(x => {
                const {phone, firstName, lastName} = x
                return {phone, firstName, lastName}
            })
        }
        return result
    }

    //it can be optimized
    async addUser(user:CmUser): Promise<CmUser> {
        this.assertActive()

        let userEntity: TypeInputPeer = undefined
        const {phone, firstName, lastName} = user

        try {
            userEntity = await this.client.getInputEntity(phone)
        } catch (e) {
            console.log('adding contact', phone)
            const contact = new InputPhoneContact({clientId: readBigIntFromBuffer(generateRandomBytes(8)), phone, firstName, lastName})
            const newContact = await this.client.invoke(
                new Api.contacts.ImportContacts({contacts: [contact]})
            )
            if (!newContact) {
                console.error('error adding new contact', phone)
                return undefined
            }
            userEntity = await this.client.getInputEntity(phone)
        }

        const result = await this.client.invoke(
            new Api.channels.InviteToChannel({
                channel: this.chat.inputEntity,
                users: [userEntity]
            })
        );

        await sleep(500) //just in case

        if (!result) throw `add user error, for: ${user.phone}`

        const chatUser = await this.client.getEntity(userEntity)
        return TelegramCommunicatorGram.convertChatUserToCmUser(chatUser)
    }

    async deleteUser(phone: string): Promise<CmUser> {
        this.assertActive()

        try {
            const userEntity = await this.client.getInputEntity(phone)
            const cmUser = TelegramCommunicatorGram.convertChatUserToCmUser(await this.client.getEntity(userEntity))

            const result = await this.client.invoke(
                new Api.channels.EditBanned({
                    channel: this.chat.inputEntity,
                    participant: userEntity,
                    bannedRights: new ChatBannedRights({viewMessages: true, untilDate: 0})
                })
            );

            await sleep(500) //just in case

            if (result) {
                return cmUser
            }
        } catch (e) {
            console.error('delete user error', e)
            throw e
        }

        return undefined
    }

    //helpers
    private assertActive() {
        if (!this.isActive()) {
            throw 'Connection is not active'
        }
    }

    private static convertChatUserToCmUser(chatUser: Api.User): CmUser {
        return {phone: `+${chatUser.phone}`, firstName: chatUser.firstName, lastName: chatUser.lastName}
    }
}

//helpers
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
