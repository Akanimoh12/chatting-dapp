import { create } from 'zustand'

export interface User {
  address?: string
  isRegistered: boolean
  username: string
  displayName: string
  bio: string
  profileImageHash: string
}

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  updateRegistrationStatus: (isRegistered: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) =>
    set(() => ({
      user,
    })),

  clearUser: () =>
    set(() => ({
      user: null,
    })),

  updateRegistrationStatus: (isRegistered) =>
    set((state) => ({
      user: state.user ? { ...state.user, isRegistered } : null,
    })),
}))