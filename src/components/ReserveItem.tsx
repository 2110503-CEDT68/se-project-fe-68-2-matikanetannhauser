import { cn } from "@/lib/utils"

const ReserveItemContainer = ({children, className, ...props}:React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn(className, "w-full px-4 py-2 pr-10 rounded-xl shadow gap-30 transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_20px_20px_rgba(0,0,0,0.6)] " ) }
        style={{ background: `linear-gradient(to top right, #DEDEDE, #FFFFFF)`,}} {...props}>
            {children}
        </div>
    )
}

const ReserveItemHeader = ({children, className}:React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <h1 className={cn(className, "text-xs sm:text-lg md:text-2xl font-bold [text-shadow:0_4px_20px_rgba(0,0,0,1)]")}>{children}</h1>
    )
}
const ReserveItemContent = ({children, className}:React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <p className={cn(className, "text-xs sm:text-lg md:text-2xl font-semi-bold [text-shadow:0_4px_20px_rgba(0,0,0,1)]")}>{children}</p>
    )
}

export {ReserveItemContainer, ReserveItemHeader, ReserveItemContent};