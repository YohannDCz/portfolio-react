
import { cn } from "@/lib/utils"

function Badge({ className = "", variant = "default", children, ...props }) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-white hover:bg-destructive/80",
    outline: "text-foreground border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
    gold: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
  }
  
  const classes = cn(baseClasses, variants[variant], className)
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export { Badge }
