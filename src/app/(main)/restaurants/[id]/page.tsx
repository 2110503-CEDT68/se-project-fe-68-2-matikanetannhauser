import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import Light from "@/components/ui/Light"
import RestaurantClient from "./RestaurantClient";
import Comment from "@/models/comment";
import { connectDB } from "@/lib/db";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    const role = data?.data?.role || null;

    const h = await headers();
    const restaurantsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/restaurants/${id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
    });

    
    if(!restaurantsRes.ok) {
        // console.log("restaurantsRes :",restaurantsRes)
        // console.log("Incoming ID:", id);
        // console.log("Type:", typeof id);
        notFound();
    }
    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data;
    // console.log(reservationsRes);
    // console.log(reservations);

    await connectDB();

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

    return (
        <>
            <Light/>
            <RestaurantClient restaurants={restaurants} rating={avgStar} role={role}/>
        </>
    )
}