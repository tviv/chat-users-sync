
import { expect } from "chai";
import {CmInfo, CmUser, IChatManager} from "../src/services/IChatManager";
import MessengerService from "../src/services/Messenger.service";
import importService from '../src/services/import.service'

//helper class
class TestChatManager implements IChatManager {
    private users = [
        {phone: "1", firstName: "A1", lastName: "A2"},
        {phone: "2", firstName: "B1", lastName: "B2"},
        {phone: "4", firstName: "D1", lastName: "D2"},
        {phone: "5", firstName: "E1", lastName: "E2"},
        {phone: "6", firstName: "F1", lastName: "F2"},
    ]

    addUser(user: CmUser): Promise<CmUser> {
        const ind = this.users.findIndex(x=>x.phone === user.phone)
        if (ind >= 0) this.users.splice(ind, 1)
        this.users.push(user)
        return Promise.resolve(user);
    }

    deleteUser(phone: string): Promise<CmUser> {
        const ind = this.users.findIndex(x=>x.phone === phone)
        let user: CmUser
        if (ind >= 0) {
            user = this.users[ind]
            this.users.splice(ind, 1)
        }

        return Promise.resolve(user);
    }

    getInfo(): Promise<CmInfo> {
        return Promise.resolve(undefined);
    }

    getUsers(): Promise<CmUser[]> {
        return Promise.resolve(this.users);
    }
}

describe("Sync users", () => {

    it("add user", async () => {
        const service = new MessengerService(new TestChatManager())
        const newUser = {phone: '3', firstName: 'C1', lastName: 'C2'}
        await service.addUser(newUser)

        const users = await service.getUsers()
        expect(6).to.equal(users.length);
        expect(newUser).to.deep.equal(users.find(x=>x.phone === newUser.phone));
    });

    it("syncUsers", async () => {
        const service = new MessengerService(new TestChatManager())
        const newUsers = [
            {phone: '2', firstName: 'A1', lastName: 'A2'},
            {phone: '3', firstName: 'C1', lastName: 'C2'}
        ]
        await service.syncUsers(newUsers)

        const users = await service.getUsers()
        expect(2).to.equal(users.length);
    });
});

describe("Import users", () => {
    const service = new MessengerService(new TestChatManager())
    it("load from csv", async () => {
        const res = await importService.importMessengerUsersFromCsv(service, 'test/users.csv')

        expect(true).to.equal(res);

        const users = await service.getUsers()
        expect(3).to.equal(users.length);


    })
})


