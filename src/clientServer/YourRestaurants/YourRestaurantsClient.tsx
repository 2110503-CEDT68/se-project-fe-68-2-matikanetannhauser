'use client'
import { AddRestaurantCard } from "@/components/AddRestaurantCard";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function RestaurantHomeClient() {
    const [showCard, setShowCard] = useState(false);
    return (
        <>
            <div className="fixed right-10 bottom-10 transition hover:scale-90 duration-150">
                <CirclePlus className="size-24 stroke-white fill-amber-400" data-testid="add-restaurant-btn"
                    onClick={() => setShowCard(true)}
                />
            </div>
            {showCard && <AddRestaurantCard closeCard={() => setShowCard(false)}/>}
        </>
    )
}