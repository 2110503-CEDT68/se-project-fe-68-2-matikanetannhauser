import Container from "@/components/ui/container"
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import EditReserve from "./EditReserve";
import Light from "@/components/ui/Light"

export default async function ReservationPage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const h = await headers();
    const reservationRes = await fetch(`${process.env.NEXTAUTH_URL}/api/reservations/${id}`, {
            cache: 'no-store',
            headers: {
                cookie: h.get("cookie") ?? "",
            },
        }
    );
    // console.log(reservationRes);
    if(!reservationRes.ok) {
        notFound();
    }
    const reservationData = await reservationRes.json();
    const reservation = reservationData.data;
    console.log(reservation);    
    
    return (
        <div className="w-full flex flex-col px-4">
            <Light/>

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

            <div className="flex-1 py-8 max-w-350 mx-auto w-full">
                <h1 className="font-bold mb-3">Reservation</h1>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 text-xs sm:text-lg md:text-2xl">
                    <Container className="col-span-1 bg-white">
                        <h1>Reserved User: {reservation.user.name ?? "Unknown"}</h1>
                        <h1>User Email: {reservation.user.email ?? "Unknown"}</h1>
                        <h1>User Tel: {reservation.user.telephone ?? "Unknown"}</h1>
                    </Container>
                    <EditReserve id={id} initReservation={reservation}/>
                </div>
            </div>
        </div>
    )
}