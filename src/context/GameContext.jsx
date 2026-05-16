import { createContext, useContext, useRef, useMemo } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const playerPos = useRef({ x: 0, y: 0, z: 0 })
  const playerAngle = useRef(0)

  const value = useMemo(() => ({ playerPos, playerAngle }), [])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  return useContext(GameContext)
}
