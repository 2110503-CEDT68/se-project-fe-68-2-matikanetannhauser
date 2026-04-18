'use client'
import { ReserveItemContainer, ReserveItemHeader, ReserveItemContent } from "@/components/ReserveItem";
import Link from "next/link";
import type { ReservationType } from "@/types/types";
import { useState } from "react";
import { AlertRemoveDialog } from "@/components/AlertRemoveDialog";

export default function ReservationClient({initReservation}:{initReservation:ReservationType[]}){
    const [reservations, setReservations] = useState(initReservation);

    const removeReserve = (id:string) => {
        setReservations((pv) => pv.filter((it) => it._id.toString()!==id))
    }

    return (
        <div className="max-w-7xl mx-auto py-8 w-full space-y-4 ">
            <h1 className="text-2xl font-bold">My Reservations</h1>
            <div className="grid grid-cols-2 gap-10 w-full max-h-96 ">
                {reservations.map((it:any) => (
                    <ReserveItemContainer key={it._id} className="flex items-center justify-between" >
                        <Link href={`/reservations/${it._id}`} className="block w-full">
                            <div>
                                <ReserveItemHeader>{it.restaurantName}</ReserveItemHeader>
                                <ReserveItemContent>Reserved By: {it.user}</ReserveItemContent>
                                <ReserveItemContent>Reserved Time: {it.startDateTime.toString()} - {it.endDateTime.toString()}</ReserveItemContent>
                            </div>
                        </Link>
                        <AlertRemoveDialog id={it._id} removeReserve={() => removeReserve(it._id)}/>
                    </ReserveItemContainer>
                ))}
            </div>
        </div>
    )
}