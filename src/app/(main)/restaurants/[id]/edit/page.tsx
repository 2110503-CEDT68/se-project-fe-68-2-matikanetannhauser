import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Light from "@/components/ui/Light"
import EditsrestaurantClient from "@/clientServer/Restaurants/EditsrestaurantClient";
import { getUser } from "@/lib/getUser";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {

    const { id } = await params;
    const user = await getUser();

    console.log("url",`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}`)

    const h = await headers();
    const restaurantsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/restaurants/${id}`, {
        cache: 'no-store',
        headers: {
            cookie: h.get("cookie") ?? "",
        }
    });

    
    if(!restaurantsRes.ok) {
        notFound();
    }
    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data.data;

    return (
        <>
            <Light/>
            <EditsrestaurantClient user={user} restaurants={restaurants}/>
        </>
    )
}