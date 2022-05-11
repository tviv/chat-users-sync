import {IChatManager, CmUser, CmInfo} from "./IChatManager";

export default class MessengerService {
    private actor: IChatManager;

    constructor(chatActor: IChatManager) {
        this.actor = chatActor
    }

    isActive(): boolean {
        return this.actor.isActive()
    }

    async getInfo(): Promise<CmInfo> {
        return await this.actor.getInfo()
    }

    async addUser(user: CmUser): Promise<CmUser> {
        const result = await this.actor.addUser(user)
        if (!result) throw "Result unknown"
        return result
    }

    async deleteUser(phone: string): Promise<CmUser> {
        return await this.actor.deleteUser(phone)
    }

    async getUsers(): Promise<CmUser[]> {
        return await this.actor.getUsers()
    }

    async syncUsers(users: CmUser[]): Promise<boolean> {
        let result = true;
        const chatUsers = await this.actor.getUsers()

        const usersToAdd = users.filter(x=>!chatUsers.find(y=>y.phone === x.phone))
        const usersToDelete = chatUsers.filter(x=>!users.find(y=>y.phone === x.phone))

        for (const x of usersToDelete) {
            try {
                const res = await this.deleteUser(x.phone)
                if (!res) {
                    result = false
                    console.error('sync users delete error, for:', x.phone)
                }
            } catch (e) {
                result = false
                console.error('sync users delete error', e)
            }
        }

        for (const x of usersToAdd) {
            try {
                const res = await this.addUser(x)
                if (!res) {
                    result = false
                    console.error('sync users add error, for:', x.phone)
                }
            } catch (e) {
                result = false
                console.error('sync users add error', e)
            }
        }

        return result
    }
}


