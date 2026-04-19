import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import Light from "@/components/ui/Light"
import RestaurantClient from "./RestaurantClient";
import Comment from "@/models/comment";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/getUser";

export default async function RestaurantsPage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await getUser();

    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    const role = user.role || null;

    const h = await headers();
    const restaurantsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/restaurants/${id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
    });
    
    if(!restaurantsRes.ok) {
        notFound();
    }
    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data;

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
            <RestaurantClient restaurants={restaurants} rating={avgStar} role={role} user={user}/>
        </>
    )
}