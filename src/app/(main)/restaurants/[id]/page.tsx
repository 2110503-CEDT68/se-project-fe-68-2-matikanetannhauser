import { notFound } from "next/navigation";

import Light from "@/components/ui/Light"
import EachRestaurantClient from "../../../../clientServer/Restaurants/EachRestaurantClient";
import { getUser } from "@/lib/getUser";
import { cookies } from "next/headers";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {

    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = await getUser();
    const { restaurant , rating } = await FetchData(id,`${process.env.NEXTAUTH_URL}/api/restaurants/${id}`)
    console.log(`${rating}`)

    return (
        <>
            <Light/>
            <EachRestaurantClient token={token} restaurants={restaurant} rating={rating} user={user}/>
        </>
    )
}

async function FetchData(id:string,link:string) {

    type Comment = {
      rating: number;
    };

    const restaurantRes = await fetch(link, {
        cache: 'no-store',
    });
    
    if(!restaurantRes.ok) {
        notFound();
    }
    const restaurantData = await restaurantRes.json();
    const restaurant = restaurantData.data.data;
    console.log("ThisRestaurantsData:", restaurant);

    const comments = restaurant?.comments ?? [];

    const rating =
    comments.length > 0
        ? comments.reduce((acc:any, c:any) => acc + c.rating, 0) / comments.length
        : 0;

    return { restaurant , rating }

}