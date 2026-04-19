import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Light from "@/components/ui/Light"
import EditsrestaurantClient from "@/app/(main)/restaurants/[id]/edit/EditsrestaurantClient";
import Comment from "@/models/comment";
import { connectDB } from "@/lib/db";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {

    const { id } = await params;

    const h = await headers();
    const restaurantsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/restaurants/${id}`, {
        cache: 'no-store',
        headers: {
            cookie: h.get("cookie") ?? "",
        }
    });

    
    if(!restaurantsRes.ok) {
        notFound();
    }
    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data;
    return (
        <>
            <Light/>
            <EditsrestaurantClient restaurants={restaurants}/>
        </>
    )
}