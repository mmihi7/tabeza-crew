'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface DemoContextValue {
  isDemo: boolean
  enterDemo: () => void
  exitDemo: () => void
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
})

const DEMO_KEY = 'tabeza-crew-demo'

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Restore demo mode across page refreshes
    setIsDemo(sessionStorage.getItem(DEMO_KEY) === 'true')
  }, [])

  function enterDemo() {
    sessionStorage.setItem(DEMO_KEY, 'true')
    setIsDemo(true)
  }

  function exitDemo() {
    sessionStorage.removeItem(DEMO_KEY)
    setIsDemo(false)
  }

  return (
    <DemoContext.Provider value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContext)
}
