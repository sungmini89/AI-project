"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ParticleOptions {
  count?: number
  speed?: number
  size?: { min: number; max: number }
  color?: string
  opacity?: { min: number; max: number }
  shape?: "circle" | "square" | "triangle"
  direction?: "up" | "down" | "left" | "right" | "random"
  lifetime?: { min: number; max: number }
  gravity?: number
  bounce?: boolean
  interactive?: boolean
}

export interface ParticlesProps {
  className?: string
  options?: ParticleOptions
  background?: boolean
  paused?: boolean
  density?: "low" | "medium" | "high"
  preset?: "default" | "snow" | "confetti" | "floating" | "rain" | "stars"
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  shape: "circle" | "square" | "triangle"
  lifetime: number
  maxLifetime: number
  rotation: number
  rotationSpeed: number
}

const Particles = React.forwardRef<HTMLDivElement, ParticlesProps>(
  (
    {
      className,
      options = {},
      background = true,
      paused = false,
      density = "medium",
      preset = "default",
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number>()
    const [particles, setParticles] = useState<Particle[]>([])
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const mouseRef = useRef({ x: 0, y: 0 })

    // Preset configurations
    const presets = {
      default: {
        count: 50,
        speed: 1,
        size: { min: 2, max: 4 },
        color: "rgba(59, 130, 246, 0.3)",
        opacity: { min: 0.1, max: 0.6 },
        shape: "circle" as const,
        direction: "random" as const,
        lifetime: { min: 5000, max: 10000 },
        gravity: 0,
        bounce: false,
        interactive: false
      },
      snow: {
        count: 100,
        speed: 0.5,
        size: { min: 2, max: 6 },
        color: "rgba(255, 255, 255, 0.8)",
        opacity: { min: 0.3, max: 0.9 },
        shape: "circle" as const,
        direction: "down" as const,
        lifetime: { min: 10000, max: 20000 },
        gravity: 0.1,
        bounce: false,
        interactive: true
      },
      confetti: {
        count: 150,
        speed: 3,
        size: { min: 3, max: 8 },
        color: "rainbow",
        opacity: { min: 0.7, max: 1 },
        shape: "square" as const,
        direction: "random" as const,
        lifetime: { min: 3000, max: 6000 },
        gravity: 0.3,
        bounce: true,
        interactive: false
      },
      floating: {
        count: 30,
        speed: 0.3,
        size: { min: 4, max: 12 },
        color: "rgba(139, 92, 246, 0.2)",
        opacity: { min: 0.1, max: 0.4 },
        shape: "circle" as const,
        direction: "up" as const,
        lifetime: { min: 15000, max: 30000 },
        gravity: -0.05,
        bounce: false,
        interactive: true
      },
      rain: {
        count: 80,
        speed: 4,
        size: { min: 1, max: 3 },
        color: "rgba(59, 130, 246, 0.6)",
        opacity: { min: 0.4, max: 0.8 },
        shape: "circle" as const,
        direction: "down" as const,
        lifetime: { min: 2000, max: 4000 },
        gravity: 0.2,
        bounce: false,
        interactive: false
      },
      stars: {
        count: 60,
        speed: 0.1,
        size: { min: 1, max: 3 },
        color: "rgba(255, 255, 255, 0.9)",
        opacity: { min: 0.3, max: 1 },
        shape: "circle" as const,
        direction: "random" as const,
        lifetime: { min: 20000, max: 40000 },
        gravity: 0,
        bounce: false,
        interactive: true
      }
    }

    const densityMultipliers = {
      low: 0.5,
      medium: 1,
      high: 2
    }

    // Merge preset with custom options
    const config = useMemo(() => {
      const presetConfig = presets[preset]
      const mergedConfig = { ...presetConfig, ...options }
      
      // Apply density multiplier
      mergedConfig.count = Math.round(mergedConfig.count * densityMultipliers[density])
      
      return mergedConfig
    }, [preset, options, density])

    // Initialize particles
    const createParticle = useCallback((id: number): Particle => {
      const { width, height } = dimensions
      const size = Math.random() * (config.size.max - config.size.min) + config.size.min
      const opacity = Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min
      const lifetime = Math.random() * (config.lifetime.max - config.lifetime.min) + config.lifetime.min

      let x, y, vx, vy

      // Position based on direction
      switch (config.direction) {
        case "up":
          x = Math.random() * width
          y = height + size
          vx = (Math.random() - 0.5) * config.speed
          vy = -Math.random() * config.speed - 0.5
          break
        case "down":
          x = Math.random() * width
          y = -size
          vx = (Math.random() - 0.5) * config.speed
          vy = Math.random() * config.speed + 0.5
          break
        case "left":
          x = width + size
          y = Math.random() * height
          vx = -Math.random() * config.speed - 0.5
          vy = (Math.random() - 0.5) * config.speed
          break
        case "right":
          x = -size
          y = Math.random() * height
          vx = Math.random() * config.speed + 0.5
          vy = (Math.random() - 0.5) * config.speed
          break
        default: // random
          x = Math.random() * width
          y = Math.random() * height
          vx = (Math.random() - 0.5) * config.speed * 2
          vy = (Math.random() - 0.5) * config.speed * 2
      }

      // Rainbow colors for confetti
      let color = config.color
      if (config.color === "rainbow") {
        const colors = [
          "rgba(255, 59, 59, 0.8)",   // Red
          "rgba(255, 165, 0, 0.8)",   // Orange  
          "rgba(255, 255, 59, 0.8)",  // Yellow
          "rgba(59, 255, 59, 0.8)",   // Green
          "rgba(59, 59, 255, 0.8)",   // Blue
          "rgba(255, 59, 255, 0.8)",  // Purple
        ]
        color = colors[Math.floor(Math.random() * colors.length)]
      }

      return {
        id,
        x,
        y,
        vx,
        vy,
        size,
        opacity,
        color,
        shape: config.shape,
        lifetime: 0,
        maxLifetime: lifetime,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4
      }
    }, [config, dimensions])

    // Update dimensions
    const updateDimensions = useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }, [])

    // Mouse move handler for interactivity
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (containerRef.current && config.interactive) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      }
    }, [config.interactive])

    // Animation loop
    const animate = useCallback(() => {
      if (paused) return

      setParticles(currentParticles => {
        const { width, height } = dimensions
        if (width === 0 || height === 0) return currentParticles

        return currentParticles
          .map(particle => {
            let { x, y, vx, vy, lifetime, opacity } = particle

            // Apply gravity
            vy += config.gravity

            // Interactive mouse repulsion/attraction
            if (config.interactive) {
              const dx = mouseRef.current.x - x
              const dy = mouseRef.current.y - y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const force = Math.min(100 / (distance + 1), 2)
              
              if (distance < 100) {
                vx -= (dx / distance) * force * 0.1
                vy -= (dy / distance) * force * 0.1
              }
            }

            // Update position
            x += vx
            y += vy

            // Bounce off edges if enabled
            if (config.bounce) {
              if (x <= 0 || x >= width) vx *= -0.8
              if (y <= 0 || y >= height) vy *= -0.8
            }

            // Update lifetime and opacity
            lifetime += 16 // ~60fps
            const lifeProgress = lifetime / particle.maxLifetime
            opacity = particle.opacity * (1 - lifeProgress)

            return {
              ...particle,
              x,
              y,
              vx,
              vy,
              lifetime,
              opacity: Math.max(0, opacity),
              rotation: particle.rotation + particle.rotationSpeed
            }
          })
          .filter(particle => {
            const { x, y, lifetime, maxLifetime } = particle
            const margin = particle.size * 2

            // Remove particles that are too old or off-screen
            if (lifetime >= maxLifetime) return false
            if (x < -margin || x > width + margin) return false
            if (y < -margin || y > height + margin) return false

            return true
          })
      })

      animationRef.current = requestAnimationFrame(animate)
    }, [config, dimensions, paused])

    // Initialize particles when dimensions change
    useEffect(() => {
      if (dimensions.width > 0 && dimensions.height > 0) {
        const newParticles = Array.from({ length: config.count }, (_, i) => 
          createParticle(i)
        )
        setParticles(newParticles)
      }
    }, [config.count, createParticle, dimensions])

    // Start animation
    useEffect(() => {
      if (!paused && dimensions.width > 0 && dimensions.height > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [animate, paused, dimensions])

    // Handle resize
    useEffect(() => {
      updateDimensions()
      
      const handleResize = () => updateDimensions()
      window.addEventListener('resize', handleResize)
      
      return () => window.removeEventListener('resize', handleResize)
    }, [updateDimensions])

    // Periodically add new particles
    useEffect(() => {
      if (paused) return

      const interval = setInterval(() => {
        setParticles(currentParticles => {
          if (currentParticles.length < config.count) {
            const newParticle = createParticle(Date.now())
            return [...currentParticles, newParticle]
          }
          return currentParticles
        })
      }, config.lifetime.min / config.count)

      return () => clearInterval(interval)
    }, [config, createParticle, paused])

    const renderParticle = (particle: Particle) => {
      const style: React.CSSProperties = {
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        opacity: particle.opacity,
        pointerEvents: 'none',
        transform: `rotate(${particle.rotation}deg)`,
      }

      switch (particle.shape) {
        case 'circle':
          style.borderRadius = '50%'
          break
        case 'square':
          style.borderRadius = '0'
          break
        case 'triangle':
          style.backgroundColor = 'transparent'
          style.borderLeft = `${particle.size / 2}px solid transparent`
          style.borderRight = `${particle.size / 2}px solid transparent`
          style.borderBottom = `${particle.size}px solid ${particle.color}`
          break
      }

      return (
        <motion.div
          key={particle.id}
          style={style}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: particle.opacity }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )
    }

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          "relative overflow-hidden",
          background && "absolute inset-0 pointer-events-none",
          className
        )}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {particles.map(renderParticle)}
      </div>
    )
  }
)

Particles.displayName = "Particles"

// OCR-specific particles for success states
export interface OCRParticlesProps extends Omit<ParticlesProps, 'preset'> {
  trigger?: boolean
  onComplete?: () => void
}

const OCRParticles = React.forwardRef<HTMLDivElement, OCRParticlesProps>(
  ({ trigger = false, onComplete, ...props }, ref) => {
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
      if (trigger) {
        setIsActive(true)
        const timer = setTimeout(() => {
          setIsActive(false)
          onComplete?.()
        }, 3000) // 3 seconds of confetti

        return () => clearTimeout(timer)
      }
    }, [trigger, onComplete])

    if (!isActive) return null

    return (
      <Particles
        ref={ref}
        preset="confetti"
        density="high"
        {...props}
      />
    )
  }
)

OCRParticles.displayName = "OCRParticles"

export { Particles, OCRParticles }