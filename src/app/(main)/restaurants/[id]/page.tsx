import { notFound } from "next/navigation";

import Light from "@/components/ui/Light"
import EachRestaurantClient from "../../../../clientServer/Restaurants/EachRestaurantClient";
import Comment from "@/models/comment";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { cookies } from "next/headers";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {

    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    const user = await getUser();
    const { restaurants , avgStar } = await FetchData(id,`${process.env.NEXTAUTH_URL}/api/restaurants/${id}`)

    return (
        <>
            <Light/>
            <EachRestaurantClient token={token} restaurants={restaurants} rating={avgStar} user={user}/>

        </>
    )
}

async function FetchData(id:string,link:string) {

    await connectDB();
    const restaurantsRes = await fetch(link, {
        cache: 'no-store',
    });
    
    if(!restaurantsRes.ok) {
        notFound();
    }
    const restaurantsData = await restaurantsRes.json();
    console.log("EachrestaurantsData:", restaurantsData);
    const restaurants = restaurantsData.data.data;

    const result = await Comment.aggregate([
    {
        $match: {
        r_id: id,
        },
    },
    {
        $group: {
        _id: "$r_id",
        avgStar: { $avg: "$star" },
        count: { $sum: 1 },
        },
    },
    ]);

    const avgStar = result[0]?.avgStar || 0;

    return { restaurants , avgStar }

}