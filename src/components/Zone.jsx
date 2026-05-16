import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

const ENTER_RADIUS = 9
const EXIT_RADIUS = 12

function AboutBuilding() {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 5]} />
        <meshStandardMaterial color="#a5d6a7" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <coneGeometry args={[3.8, 2.2, 4]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.6} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.75, -2.51]}>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Windows */}
      <mesh position={[1.4, 1.7, -2.51]}>
        <boxGeometry args={[0.9, 0.9, 0.1]} />
        <meshStandardMaterial color="#90caf9" roughness={0.05} metalness={0.4} />
      </mesh>
      <mesh position={[-1.4, 1.7, -2.51]}>
        <boxGeometry args={[0.9, 0.9, 0.1]} />
        <meshStandardMaterial color="#90caf9" roughness={0.05} metalness={0.4} />
      </mesh>
    </group>
  )
}

function SkillsBuilding() {
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 2, 5]} />
        <meshStandardMaterial color="#1565c0" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[3.5, 3, 3.5]} />
        <meshStandardMaterial color="#1976d2" roughness={0.2} metalness={0.55} />
      </mesh>
      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#42a5f5" roughness={0.1} metalness={0.7} />
      </mesh>
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 2.5, 8]} />
        <meshStandardMaterial color="#bbdefb" metalness={0.9} roughness={0.05} />
      </mesh>
      <pointLight position={[0, 9.5, 0]} color="#42a5f5" intensity={3} distance={12} />
    </group>
  )
}

function ProjectsBuilding() {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 3, 5]} />
        <meshStandardMaterial color="#7b1fa2" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 3.02, 0]}>
        <boxGeometry args={[9, 0.08, 5]} />
        <meshStandardMaterial color="#e1bee7" roughness={0.0} metalness={0.1} transparent opacity={0.5} />
      </mesh>
      {[-3.5, -1.2, 1.2, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 2.51]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 3, 8]} />
          <meshStandardMaterial color="#9c27b0" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, -2.51]}>
        <boxGeometry args={[4, 0.9, 0.1]} />
        <meshStandardMaterial color="#ce93d8" emissive="#9c27b0" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 4, 0]} color="#ab47bc" intensity={2} distance={10} />
    </group>
  )
}

function ContactBuilding() {
  const torusRef = useRef()
  const innerRef = useRef()

  useFrame((_, delta) => {
    if (torusRef.current) torusRef.current.rotation.y += delta * 0.7
    if (innerRef.current) innerRef.current.rotation.z += delta * 1.2
  })

  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.8, 1, 8]} />
        <meshStandardMaterial color="#bf360c" roughness={0.6} />
      </mesh>
      <mesh ref={torusRef} position={[0, 3.5, 0]} castShadow>
        <torusGeometry args={[2.5, 0.35, 16, 48]} />
        <meshStandardMaterial color="#ff7043" roughness={0.15} metalness={0.5} emissive="#ff5722" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={innerRef} position={[0, 3.5, 0]}>
        <torusGeometry args={[1.5, 0.12, 8, 32]} />
        <meshStandardMaterial color="#ffccbc" emissive="#ff7043" emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <circleGeometry args={[2.1, 48]} />
        <meshStandardMaterial color="#ff7043" transparent opacity={0.15} side={THREE.DoubleSide} emissive="#ff5722" emissiveIntensity={0.2} />
      </mesh>
      <pointLight position={[0, 3.5, 0]} color="#ff7043" intensity={4} distance={16} />
    </group>
  )
}

const BUILDINGS = {
  about: AboutBuilding,
  skills: SkillsBuilding,
  projects: ProjectsBuilding,
  contact: ContactBuilding,
}

export default function Zone({ zone, onNearby, onFaraway }) {
  const { playerPos } = useGame()
  const isNearRef = useRef(false)
  const orbRef = useRef()

  useFrame((_, delta) => {
    const dx = playerPos.current.x - zone.position[0]
    const dz = playerPos.current.z - zone.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (!isNearRef.current && dist < ENTER_RADIUS) {
      isNearRef.current = true
      onNearby(zone)
    } else if (isNearRef.current && dist > EXIT_RADIUS) {
      isNearRef.current = false
      onFaraway(zone)
    }

    if (orbRef.current) {
      orbRef.current.position.y = 7.5 + Math.sin(Date.now() * 0.002) * 0.3
      orbRef.current.rotation.y += delta * 1.5
    }
  })

  const Building = BUILDINGS[zone.id]

  return (
    <group position={zone.position}>
      <Building />

      {/* Floating orb above building */}
      <group ref={orbRef} position={[0, 7.5, 0]}>
        <mesh>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={zone.color}
            emissive={zone.color}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Zone name label */}
      <Text
        position={[0, 9, 0]}
        fontSize={1.1}
        color={zone.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {zone.name}
      </Text>

      {/* Ground zone ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ENTER_RADIUS - 0.3, ENTER_RADIUS, 64]} />
        <meshStandardMaterial color={zone.color} transparent opacity={0.25} emissive={zone.color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}
