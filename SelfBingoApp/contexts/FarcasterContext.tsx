'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  custodyAddress: string
  connectedAddress?: string
  bio?: string
  followerCount?: number
  followingCount?: number
}

interface FarcasterContextType {
  user: FarcasterUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined)

export function useFarcaster() {
  const context = useContext(FarcasterContext)
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider')
  }
  return context
}

interface FarcasterProviderProps {
  children: ReactNode
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Attempting to get Farcaster context...')

      // Get the context which contains user information
      const context: any = await sdk.context
      console.log('📱 SDK context:', context)

      if (!context?.user && !context?.client) {
        throw new Error('No user context available from SDK')
      }

      // Extract real user data from context
      const contextUser = context.user
      const farcasterUser: FarcasterUser = {
        fid: contextUser?.fid || context.client?.clientFid || 0,
        username: contextUser?.username || 'user',
        displayName: contextUser?.displayName || contextUser?.username || 'User',
        pfpUrl: contextUser?.pfpUrl || '/placeholder.svg',
        custodyAddress: contextUser?.custodyAddress || '0x0000000000000000000000000000000000000000',
        connectedAddress: contextUser?.verifications?.[0] || contextUser?.custodyAddress,
        bio: contextUser?.bio,
        followerCount: contextUser?.followerCount,
        followingCount: contextUser?.followingCount,
      }

      console.log('✅ Farcaster user created:', farcasterUser)
      setUser(farcasterUser)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      console.error('❌ Farcaster authentication error:', err)

      // In non-Farcaster environments, just mark as loaded without user
      console.log('📍 Not in Farcaster environment, no user data available')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setError(null)
  }

  useEffect(() => {
    // Check if running in Farcaster Mini App by checking if SDK context is available
    const checkEnvironment = async () => {
      try {
        // Try to access the SDK context
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
        ])

        if (context) {
          console.log('🎯 Running in Farcaster Mini App, attempting authentication...')
          signIn()
        } else {
          console.log('🌐 Running in browser, skipping Farcaster authentication')
          setLoading(false)
        }
      } catch (error) {
        console.log('🌐 Running in browser, skipping Farcaster authentication')
        setLoading(false)
      }
    }

    checkEnvironment()
  }, [])

  const isAuthenticated = !!user

  const value: FarcasterContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
  }

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  )
}
