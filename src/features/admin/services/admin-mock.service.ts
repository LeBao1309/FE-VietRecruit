import type { AdminCompany, AdminUser, GlobalTransaction } from '../types/admin.dto'

// Mock Data
const companies: AdminCompany[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Tech Corp', domain: 'techcorp.com', createdAt: new Date().toISOString(), status: 'Active' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Startup Inc', domain: 'startup.io', createdAt: new Date().toISOString(), status: 'Suspended' }
]

const users: AdminUser[] = [
  { id: '33333333-3333-3333-3333-333333333333', email: 'admin@system.com', fullName: 'Super Admin', role: 'SYSTEM_ADMIN', isBanned: false },
  { id: '44444444-4444-4444-4444-444444444444', email: 'hr@techcorp.com', fullName: 'HR Rep', role: 'HR', isBanned: false },
  { id: '55555555-5555-5555-5555-555555555555', email: 'badguy@scam.com', fullName: 'Spammer', role: 'COMPANY_ADMIN', isBanned: true }
]

const transactions: GlobalTransaction[] = [
  { id: 'PAYOS-123', companyId: '11111111-1111-1111-1111-111111111111', amount: 5000000, currency: 'VND', status: 'SUCCESS', timestamp: new Date().toISOString() },
  { id: 'PAYOS-124', companyId: '22222222-2222-2222-2222-222222222222', amount: 3000000, currency: 'VND', status: 'PENDING', timestamp: new Date().toISOString() }
]

export const adminMockService = {
  getCompanies: async (): Promise<AdminCompany[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...companies]), 500))
  },
  
  getUsers: async (): Promise<AdminUser[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...users]), 500))
  },
  
  toggleUserBan: async (userId: string, isBanned: boolean): Promise<AdminUser> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      const user = users.find(u => u.id === userId)
      if (!user) return reject(new Error('User not found'))
      user.isBanned = isBanned
      resolve({ ...user })
    }, 400))
  },
  
  getTransactions: async (): Promise<GlobalTransaction[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...transactions]), 500))
  }
}
