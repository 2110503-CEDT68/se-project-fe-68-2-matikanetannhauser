"use client"

/*export default function InteractiveCard({children}:{children: React.ReactNode}) {

  return (
    <div 
      className="border-[2px] border-black shrink-0 w-[438px] h-[250px] bg-white overflow-y-auto rounded-3xl shadow-[0_20px_20px_rgba(0,0,0,0.5)] gap-2.5 transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-[0_20px_20px_rgba(0,0,0,0.6)] "
      // onClick={()=>onCardSelected()}
    >
      {children}
    </div>
  );


}*/
type Props = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement>
>;

export default function InteractiveCard({ children, ...props }: Props) {
  return (
    <div
      {...props}
      className="border-[2px] border-black shrink-0 w-[438px] h-[250px] bg-white overflow-y-auto rounded-3xl shadow-[0_20px_20px_rgba(0,0,0,0.5)] gap-2.5 transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_20px_20px_rgba(0,0,0,0.6)]"
    >
      {children}
    </div>
  );
}