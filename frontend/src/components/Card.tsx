import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Card({ 
  children, 
  className, 
  title, 
  subtitle, 
  onClick,
  onMouseEnter,
  onMouseLeave
}: CardProps) {
  return (
    <div 
      className={cn("bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {title || subtitle ? (
        <div className="p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
