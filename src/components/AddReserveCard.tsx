'use client'
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { SetStateAction, useState } from "react";
import { toast } from "sonner";
import { type Session } from "next-auth";
import type { RestaurantType, UserType } from "@/types/types";

type CustomUser = NonNullable<Session['user']> & {
    telephone: string,
    sub: string,
    name: string,
    role: string,
    email: string,
} | undefined;

const AddReserveCard = ({user, restaurant, closeCard}:{user: UserType, restaurant:RestaurantType, closeCard: () => void}) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState('');
    const handleCreate = async () => {
        try {
            // console.log({ date, startTime, endTime })
            const payload = {
                startDateTime: `${date}T${startTime}:00`,
                endDateTime: `${date}T${endTime}:00`,
            }
            const resp = await fetch(`/api/restaurants/${restaurant._id.toString()}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to reserve");
            }
            toast.success("Reserve success!", {position: 'top-center'})
            closeCard();
        } catch(err) {
            console.log(err);
            toast.error("Failed to reserve", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    return (
        <div className="z-50 fixed inset-0 bg-black/50 flex justify-center items-center h-dvh w-dvw">
            <div className="bg-white rounded-md p-4 shadow space-y-4 font-bold">
                <div className="flex justify-between">
                    <h1 className="text-lg ">Add Reservation</h1>
                    <Button variant={'destructive'} onClick={() => closeCard()}>X</Button>
                </div>
                <h1>Reserve User</h1>
                <div>
                    <p>User: {user?.name}</p>
                    <p>Tel: {user?.telephone}</p>
                </div>
                <h1>Reserve Data</h1>
                <div>
                    <p>Available Time: {restaurant.openTime ?? "Unknown"} - {restaurant.closeTime ?? "Unknown"}</p>
                    <span className="space-x-2">
                        <label htmlFor="reserve-date">Reserve Date: </label>
                        <input id='reserve-date' type='date' className="border" value={date} onChange={(e) => setDate(e.target.value)} required/>
                    </span>
                    <span className="space-x-2">
                        <label htmlFor="reserve-start">Start:</label>
                        <input id='reserve-start' type='time' className="border" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                    </span>
                    <span className="space-x-2">
                        <label htmlFor="reserve-end">End:</label>
                        <input id='reserve-end' type='time' className="border" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
                    </span>
                </div>
                <div>
                    <Button onClick={handleCreate} variant={'outline'} className="w-full bg-black text-white">Reserve</Button>
                </div>
            </div>
        </div>
    )
}

export {AddReserveCard};