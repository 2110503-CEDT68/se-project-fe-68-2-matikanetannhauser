'use client'
import Container from "@/components/ui/container";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import mongoose from "mongoose";

type Reserve = {
    _id: mongoose.Types.ObjectId,
    startDateTime: string,
    endDateTime: string,
    user: mongoose.Types.ObjectId,
    restaurant: {
        _id: mongoose.Types.ObjectId,
        name: string,
        address: string,
        id: string,
        openTime: string,
        closeTime: string
    }
}

function formatDateInput(value: string) {
    const d = new Date(value);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatTimeInput(value: string) {
    const d = new Date(value);
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function toUTCISOString(date: string, time: string) {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    return new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0)
    ).toISOString();
}

export default function EditReserve({id, initReservation}:{id: string, initReservation:Reserve}) {
    const [reservation, setReservation] = useState(initReservation);
    const [startTime, setStartTime] = useState(formatTimeInput(initReservation.startDateTime));
    const [endTime, setEndTime] = useState(formatTimeInput(initReservation.endDateTime));
    const [date, setDate] = useState(formatDateInput(initReservation.startDateTime));
    console.log(reservation);
    const restaurant = reservation.restaurant;
    const handleSave = async () => {
        try {
            // console.log({ date, startTime, endTime })
            const payload = {
                startDateTime: toUTCISOString(date, startTime),
                endDateTime: toUTCISOString(date, endTime),
            }
            const resp = await fetch(`/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to save reservation");
            }
            toast.success("Reservation Saved!", {position: 'top-center'})
        } catch(err) {
            console.log(err);
            toast.error("Failed to save reservation.", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }
    
    return (
        <Container className="sm:col-span-2 bg-white ">
            <p>Restaurant Name: {restaurant.name ?? "Unknown"}</p>
            <p>Reserved Address: {restaurant.address ?? "Unknown"}</p>
            <p>Available Time: {restaurant.openTime ?? "Unknown"} - {restaurant.closeTime ?? "Unknown"}</p>
            <span className="space-x-2">
                <label htmlFor="reserve-date">Reserve Date: </label>
                <input id='reserve-date' type='date' className="border" value={date} onChange={(e) => setDate(e.target.value)}/>
            </span>
            <span className="space-x-2">
                <label htmlFor="reserve-start">Start:</label>
                <input id='reserve-start' type='time' className="border" value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
            </span>
            <span className="space-x-2">
                <label htmlFor="reserve-end">End:</label>
                <input id='reserve-end' type='time' className="border" value={endTime} onChange={(e) => setEndTime(e.target.value)}/>
            </span>
            <div className="flex justify-end">
                <Button onClick={() => {
                    handleSave()
                }}>Save</Button>
            </div>
        </Container>
    )
}