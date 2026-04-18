import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import ReservationClient from "./ReservationClient";
import Light from "@/components/ui/Light";

export default async function ReservationPage() {
console.log("inner")

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

    const h = await headers();
    const reservationsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/reservations`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
    });
    if(!reservationsRes.ok) {
      console.log("www")
        notFound();
    }
    const reservationsData = await reservationsRes.json();
    const reservations = reservationsData.data;
    
    return (
        <div className="w-full min-h-dvh flex flex-col px-4 sm:px-12">
            <div className="fixed inset-0 -z-10">
            <img
              src="/images/BG2.png"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <img
              src="/images/BG.png"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
            
            <div
              className="absolute inset-0 w-full h-full z-20 bottom-0"
              style={{  
                background: `linear-gradient(to top, #cebba89a, #ffffff00)`
              }}
            />
          </div>
        
            <Light/>
            <ReservationClient initReservation={reservations}/>
        </div>
    )
}