import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

const SPEED = 8
const WORLD_BOUND = 47

const _dir = new THREE.Vector3()
const _camTarget = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()

export default function Player({ disabled }) {
  const { playerPos, playerAngle } = useGame()
  const { camera } = useThree()
  const groupRef = useRef()
  const bodyRef = useRef()
  const keys = useRef({})
  const bobTimer = useRef(0)

  useEffect(() => {
    const down = e => { keys.current[e.code] = true }
    const up = e => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    _dir.set(0, 0, 0)

    if (!disabled) {
      const k = keys.current
      if (k['KeyW'] || k['ArrowUp'])    _dir.z -= 1
      if (k['KeyS'] || k['ArrowDown'])  _dir.z += 1
      if (k['KeyA'] || k['ArrowLeft'])  _dir.x -= 1
      if (k['KeyD'] || k['ArrowRight']) _dir.x += 1
    }

    const moving = _dir.length() > 0

    if (moving) {
      _dir.normalize()
      playerPos.current.x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerPos.current.x + _dir.x * SPEED * delta))
      playerPos.current.z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerPos.current.z + _dir.z * SPEED * delta))
      playerAngle.current = Math.atan2(_dir.x, _dir.z)
      bobTimer.current += delta * 10
    }

    groupRef.current.position.set(playerPos.current.x, 0, playerPos.current.z)
    groupRef.current.rotation.y = playerAngle.current

    if (bodyRef.current) {
      bodyRef.current.position.y = moving ? 0.9 + Math.sin(bobTimer.current) * 0.06 : 0.9
    }

    if (!disabled) {
      const sinA = Math.sin(playerAngle.current)
      const cosA = Math.cos(playerAngle.current)
      _camTarget.set(
        playerPos.current.x + sinA * 9,
        4.5,
        playerPos.current.z + cosA * 9
      )
      _lookTarget.set(playerPos.current.x, 1.5, playerPos.current.z)
      camera.position.lerp(_camTarget, 0.08)
      camera.lookAt(_lookTarget)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4fc3f7" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#ffb74d" roughness={0.4} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.1, 1.88, -0.21]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-0.1, 1.88, -0.21]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Backpack (direction indicator) */}
      <mesh position={[0, 1, 0.28]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.15]} />
        <meshStandardMaterial color="#1565c0" roughness={0.6} />
      </mesh>
    </group>
  )
}
