import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MySwiper from './mySwiper';
import Comment from "@/models/comment";

type Comment = {
  rating: number;
};

type Restaurant = {
  _id: string;
  comments?: Comment[];
};

export default async function CardPanel() {

    const h = await headers();
    const { restaurants, result } = await FetchData(`${process.env.NEXTAUTH_URL}/api/restaurants`);

    const ratingMapObj: Record<string, number> = {};

    result.forEach((item:any) => {
    ratingMapObj[item.restaurant] = item.rating;
    });

      const restaurantsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/restaurants`, {
          cache: 'no-store'
      });
      if(!restaurantsRes.ok) {
          notFound();
      }

  return (
    <div className="fixed left-0 bottom-0 w-full">
      <MySwiper restaurants={restaurants} ratingMap={ratingMapObj}/>
    </div>

  );
}

async function FetchData(link:string){

    console.log("",link)

    const h = await headers();
    const restaurantsRes = await fetch(link, {
        cache: 'no-store',
        headers: {
            cookie: h.get("cookie") ?? "",
        }
    });

    if (!restaurantsRes.ok) {
        if (restaurantsRes.status === 401) {
            throw new Error("Unauthorized");
        }
        if (restaurantsRes.status === 403) {
            throw new Error("Forbidden");
        }
        if (restaurantsRes.status === 404) {
            notFound();
        }

        const text = await restaurantsRes.text();
        
        console.error("STATUS:", restaurantsRes.status);
        console.error("RESPONSE:", text);

        throw new Error(`Fetch failed: ${restaurantsRes.status}`);
    }
    
    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data.data;
    console.log("restaurantsData:", restaurants);

    const result = restaurants?.map((r: Restaurant) => {
    const comments = r.comments ?? [];

    const avg =
        comments.length > 0
        ? comments.reduce((acc, c) => acc + c.rating, 0) / comments.length
        : 0;

    return {
        restaurant: r._id,
        rating: avg,
    };
    });

      return { restaurants, result };

}