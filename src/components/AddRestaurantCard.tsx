'use client'
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Camera } from "lucide-react";

const AddRestaurantCard = ({closeCard}:{closeCard: () => void}) => {
    // const [date, setDate] = useState('');
    // const {data:session} = useSession();
    // console.log("User Session", session);
    // const user = session?.user as CustomUser;
    const handleCreate = async (formData: FormData) => {
        try {
            const payload = {
                name: formData.get("name"),
                address: formData.get("address"),
                imgsrc: formData.get("imgsrc"),
                tel: formData.get("tel"),
                openTime: formData.get("openTime"),
                closeTime: formData.get("closeTime"),
            }
            const resp = await fetch(`/api/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to create");
            }
            toast.success("Create success!", {position: 'top-center'})
            closeCard();
        } catch(err) {
            console.log(err);
            toast.error("Failed to create", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    return (
        <div className="z-50 fixed inset-0 bg-black/50 flex justify-center items-center h-dvh w-dvw">
            <form action={handleCreate}>
                <div className="bg-white rounded-md p-4 shadow space-y-4 font-bold">
                    <div className="flex justify-between">
                        <h1 className="text-lg ">Add Restaurant</h1>
                        <Button variant={'destructive'} onClick={closeCard}>X</Button>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-2">
                        <label htmlFor='name'>Name: </label>
                        <input id='name' placeholder="Input Name" required/>
                        <label htmlFor="address">Address: </label>
                        <input id='address' placeholder="Input Address" required/>
                        <label htmlFor='tel'>Tel: </label>
                        <input id='tel' placeholder="Input Tel" required/>
                        <label>Open Hours: </label>
                        <span className="space-x-3">
                            <input type='time' id='openTime'/>
                            <span>to</span>
                            <input type="time" id='closeTime'/>
                        </span>
                    </div>
                    <label htmlFor="imgsrc" className="block">
                        Add Photo
                        <div className="w-full h-32 flex justify-center items-center border-2 border-dashed border-muted-foreground/40 rounded-md transition duration-100 hover:bg-muted hover:text-foreground">
                            <Camera/>
                        </div>
                    </label>
                    <input
                        id='imgsrc'
                        name='imgsrc'
                        type='file'
                        accept="image/*"
                        className="hidden"
                    />
                    <div>
                        <Button variant={'outline'} className="w-full bg-black text-white" type='submit'>Submit</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export {AddRestaurantCard};