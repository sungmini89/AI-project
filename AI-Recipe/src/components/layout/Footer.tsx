import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by AI Recipe Generator</span>
          </div>
        </div>
      </div>
    </footer>
  )
}