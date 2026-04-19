import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MySwiper from './mySwiper';
import Comment from "@/models/comment";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export default async function CardPanel() {

  await connectDB();

  const ratings = await Comment.aggregate([
    {
      $group: {
        _id: "$r_id",
        avgStar: { $avg: "$star" },
      },
    },
  ]);

  const ratingMap = Object.fromEntries(
    ratings.map(r => [r._id.toString(), r.avgStar])
  );

    const h = await headers();
      const restaurantsRes = await fetch(`${process.env.BACKEND_URL}/api/v1/restaurants`, {
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
      // console.log(reservationsRes);
      // console.log(reservations);

  return (
    <div className="fixed left-0 bottom-0 w-full">
      <MySwiper restaurants={restaurants} ratingMap={ratingMap}/>
    </div>

  );
}
