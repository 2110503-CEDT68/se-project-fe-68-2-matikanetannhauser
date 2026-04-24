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

export function RestaurantAlertRemove({handleDelete}:{handleDelete: () => void}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-45 h-15 text-white bg-red-400 text-[30px] rounded-lg [text-shadow:0_0_20px_white,0_0_60px_rgba(255,255,255,1),0_0_100px_rgba(255,255,255,0.8)] font-bold
          transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
            onClick={(e) => {
              
            }}
          >
              DELETE
          </button>
        </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">Remove Restaurant</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            restaurant from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
