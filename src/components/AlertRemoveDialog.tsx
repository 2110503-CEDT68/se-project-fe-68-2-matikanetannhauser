import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner";

type AlertRemoveParam = {
    id: string,
    removeReserve?: () => void,
}

export function AlertRemoveDialog({id, removeReserve}:AlertRemoveParam) {
    const handleRemove = async () => {
        try {
            const resp = await fetch(`/api/reservations/${id}`, {
                method: 'DELETE'
            });
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to delete reservation");
            }
            toast.success("Reservation deleted!", {position: 'top-center'})
            removeReserve?.();
        } catch(err) {
            console.log(err);
            toast.error("Failed to delete reservation.", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="relative group w-20 h-20 rounded-full overflow-hidden p-0">

          <div className="absolute inset-0 bg-linear-to-br from-[#E4E4E4] to-[#949494]" />
          <div className="absolute inset-0 bg-linear-to-br from-[#FFA1A1] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <Trash2 className=" relative z-10 h-9! w-8! text-red-500 opacity-0 group-hover:opacity-100  transition-opacity duration-300  pointer-events-none " />

          </Button>
        </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">Remove Reservation</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            reservation data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={handleRemove}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
