interface CmUser {
    phone: string,
    firstName: string,
    lastName: string
}

interface CmInfo {
    status: 'active' | 'inactive'
    chatTitle?: string,
    chatUserCount?: number
}

interface IChatManager {
    isActive(): boolean
    getInfo(): Promise<CmInfo>
    getUsers(): Promise<CmUser[]>
    addUser(user: CmUser): Promise<CmUser>
    deleteUser(phone: string): Promise<CmUser>
}

export {IChatManager, CmUser, CmInfo}
