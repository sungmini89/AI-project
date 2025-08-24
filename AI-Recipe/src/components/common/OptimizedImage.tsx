import React, { useState, useRef, useEffect } from 'react'
import { ImageOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: string
  lazy?: boolean
  blur?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  fallback,
  lazy = true,
  blur = true,
  onLoad,
  onError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const currentPlaceholder = placeholderRef.current
    if (currentPlaceholder) {
      observer.observe(currentPlaceholder)
    }

    return () => {
      observer.disconnect()
    }
  }, [lazy, isVisible])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // 이미지 최적화 URL 생성 (Unsplash의 경우)
  const optimizeImageUrl = (url: string, width?: number, height?: number) => {
    if (url.includes('unsplash.com')) {
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      params.set('fit', 'crop')
      params.set('auto', 'format')
      params.set('q', '80')
      
      return `${url}&${params.toString()}`
    }
    return url
  }

  const ErrorPlaceholder = () => (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
      <div className="text-center text-gray-400">
        <ImageOff className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{t('common.imageLoadError')}</p>
      </div>
    </div>
  )

  const LoadingPlaceholder = () => (
    <div 
      ref={placeholderRef}
      className={`
        animate-pulse bg-gray-200 dark:bg-gray-700 
        ${blur ? 'backdrop-blur-sm' : ''}
        ${className}
      `}
    >
      {blur && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      )}
    </div>
  )

  if (hasError) {
    if (fallback) {
      return (
        <img
          src={fallback}
          alt={alt}
          className={className}
          onError={handleError}
          {...props}
        />
      )
    } else {
      return <ErrorPlaceholder />
    }
  }

  if (!isVisible) {
    return <LoadingPlaceholder />
  }

  return (
    <div className="relative">
      {isLoading && <LoadingPlaceholder />}
      <img
        ref={imgRef}
        src={optimizeImageUrl(src)}
        alt={alt}
        className={`
          transition-opacity duration-300 
          ${isLoading ? 'opacity-0 absolute inset-0' : 'opacity-100'} 
          ${className}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
    </div>
  )
}