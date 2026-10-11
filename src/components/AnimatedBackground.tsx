import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

function CinematicParticles() {
  const ref = useRef<THREE.Points>(null!)
  const mouse = useRef({ x: 0, y: 0 })

  const positions = useMemo(() => {
    const count = 800
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // توزيع بشكل كروي واسع
      const r = Math.pow(Math.random(), 0.7) * 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  // ألوان متدرجة لكل نقطة
  const colors = useMemo(() => {
    const count = 800
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = Math.random()
      // من أزرق فاتح لأزرق غامق
      arr[i * 3] = 0.4 + t * 0.4      // R
      arr[i * 3 + 1] = 0.6 + t * 0.3  // G
      arr[i * 3 + 2] = 1.0            // B
    }
    return arr
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
      // استجابة للماوس
      ref.current.rotation.x += (mouse.current.y * 0.15 - ref.current.rotation.x) * 0.02
      ref.current.rotation.z += (mouse.current.x * 0.15 - ref.current.rotation.z) * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.03
    camera.position.y += (mouse.current.y * 1.0 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 65 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#1E88E5" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#26A69A" />
        <CinematicParticles />
        <CameraRig />
      </Canvas>
    </div>
  )
}