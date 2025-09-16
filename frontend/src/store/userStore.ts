import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserState, User } from '../types'

interface UserStore extends UserState {
  // Actions
  setCurrentUser: (user: User | null) => void
  setAllUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (address: `0x${string}`, updates: Partial<User>) => void
  setRegistered: (isRegistered: boolean) => void
  setRegistrationStatus: (status: UserState['registrationStatus']) => void
  updateUserOnlineStatus: (address: `0x${string}`, isOnline: boolean) => void
  reset: () => void
}

const initialState: UserState = {
  currentUser: null,
  allUsers: [],
  isRegistered: false,
  registrationStatus: 'idle',
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setCurrentUser: (user) => 
        set({ currentUser: user }, false, 'setCurrentUser'),
      
      setAllUsers: (users) => 
        set({ allUsers: users }, false, 'setAllUsers'),
      
      addUser: (user) => 
        set(
          (state) => ({
            allUsers: [...state.allUsers.filter(u => u.address !== user.address), user]
          }),
          false,
          'addUser'
        ),
      
      updateUser: (address, updates) => 
        set(
          (state) => ({
            allUsers: state.allUsers.map(user => 
              user.address === address ? { ...user, ...updates } : user
            ),
            currentUser: state.currentUser?.address === address 
              ? { ...state.currentUser, ...updates } 
              : state.currentUser
          }),
          false,
          'updateUser'
        ),
      
      setRegistered: (isRegistered) => 
        set({ isRegistered }, false, 'setRegistered'),
      
      setRegistrationStatus: (registrationStatus) => 
        set({ registrationStatus }, false, 'setRegistrationStatus'),
      
      updateUserOnlineStatus: (address, isOnline) => {
        const { updateUser } = get()
        updateUser(address, { isOnline })
      },
      
      reset: () => 
        set(initialState, false, 'reset'),
    }),
    {
      name: 'user-store',
    }
  )
)