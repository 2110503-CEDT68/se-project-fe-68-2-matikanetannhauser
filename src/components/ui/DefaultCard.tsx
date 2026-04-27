import { cn } from "@/lib/utils"

const Card = ({children, className, ...props}:React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn("p-6 flex flex-col gap-y-4 bg-white rounded-md overflow-y-auto max-h-[60vh] max-w-[min(36rem,80vw)] text-xs md:text-base", className)} {...props}>
            {children}
        </div>
    )
}

const CardHeader = ({children, className, ...props}:React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    )
}

const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col gap-y-3", className)} {...props}>
        {children}
    </div>
)

const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("", className)} {...props}>
        {children}
    </div>
)

export {Card, CardHeader, CardContent, CardFooter};