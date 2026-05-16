import { Sky } from '@react-three/drei'

const TREE_POSITIONS = [
  [-15, 0, -10], [-18, 0, 5], [-12, 0, 15],
  [15, 0, -12], [20, 0, 8], [12, 0, 18],
  [-20, 0, -20], [22, 0, -18], [-8, 0, -22],
  [8, 0, 22], [-22, 0, 15], [18, 0, -5],
  [-35, 0, 5], [35, 0, -5], [5, 0, -35], [-5, 0, 35],
  [-40, 0, -10], [40, 0, 10], [-10, 0, 40], [10, 0, -40],
  [-25, 0, -8], [25, 0, 12], [-8, 0, 25], [8, 0, -25],
]

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.18, 1, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.9, 2.8, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[1.1, 1.8, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Path({ from, to }) {
  const mx = (from[0] + to[0]) / 2
  const mz = (from[2] + to[2]) / 2
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const len = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dx, dz)

  return (
    <mesh position={[mx, 0.02, mz]} rotation={[0, angle, 0]} receiveShadow>
      <boxGeometry args={[2.5, 0.04, len]} />
      <meshStandardMaterial color="#795548" roughness={0.9} />
    </mesh>
  )
}

export default function World() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={160}
        shadow-camera-left={-65}
        shadow-camera-right={65}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
      />

      <Sky sunPosition={[100, 25, 100]} turbidity={6} rayleigh={0.4} mieCoefficient={0.005} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#388e3c" roughness={0.95} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[200, 80, '#2e7d32', '#2e7d32']} position={[0, 0.01, 0]} />

      {/* Central spawn platform */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 32]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.8} />
      </mesh>

      {/* Spawn ring glow */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.8, 5.5, 64]} />
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.4} />
      </mesh>

      {/* Paths to each zone */}
      <Path from={[0, 0, 0]} to={[0, 0, -30]} />
      <Path from={[0, 0, 0]} to={[30, 0, 0]} />
      <Path from={[0, 0, 0]} to={[0, 0, 30]} />
      <Path from={[0, 0, 0]} to={[-30, 0, 0]} />

      {TREE_POSITIONS.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}
    </>
  )
}
