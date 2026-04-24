'use client'

import { useState } from "react";
import type { RestaurantType, UserType } from "@/types/types"
import { AddReserveCard } from "@/components/AddReserveCard";
import { Rating } from "@mui/material";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RestaurantAlertRemove } from "@/components/RestaurantAlertRemove";
import Link from "next/link";
import { ViewCommentPopPage } from "@/components/ViewCommentPopPage";

export default function EachRestaurantClient({restaurants,rating,user,token}:{restaurants:any , rating:number , user:UserType , token:any}) {
    const [showCard, setShowCard] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const role = user?.role;

    console.log("owner",restaurants.user)
    console.log("user",user)

    console.log("rating",rating)

    const handleDelete = async () => {
      try {

        console.log("restaurants._id",restaurants._id)
        
            const [restaurantResp] = await Promise.all([
              fetch(`/api/restaurants/${restaurants._id.toString()}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              }),
            ])
            
            const restaurantData  = await restaurantResp.json().catch(() => null);
            toast.success("Delete success!", {position: 'top-center'})
            router.push('/yourRestaurants');
        } catch(err) {
            console.log(err);
            toast.error("Cascade delete failed", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    return (
        <main className="flex flex-col justify-center items-center w-full flex-1 mt-5">
          <div className="fixed inset-0 -z-10">
            </div>

              <div className="relative flex flex-col w-375 rounded-3xl bg-white shadow-[0_0px_40px_rgba(0,0,0,0.7)]">

                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="10%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ffaa00" />
                    </linearGradient>
                  </defs>
                </svg>

                <Rating
                  value={rating}
                  readOnly
                  sx={{
                    position: "absolute",
                    top: -70,
                    left: 16,
                    zIndex: 2,
                    fontSize: "3rem",     
                    
                    "& .MuiRating-icon svg": {
                      strokeWidth: 0.4,
                    },

                    "& .MuiRating-iconFilled svg": {
                      fill: "url(#starGradient)",
                      stroke: "black",
                    },

                    "& .MuiRating-iconEmpty svg": {
                      fill: "transparent" ,
                      stroke: "#333",
                    },
                  }}
                  />

                <img src={restaurants.imgsrc} className=" rounded-3xl w-full h-96 object-cover border-2 border-white shadow-[0_20px_20px_rgba(0,0,0,0.6)]" />
                
                <div className="flex mt-10 justify-start items-center flex-1 gap-15 [text-shadow:0_4px_20px_rgba(0,0,0,1)]">
                    <h1 className=" ml-30 pr-6 text-[60px] pr-12 border-r border-black shrink-0">{restaurants.name}</h1>
                    <h1 className="text-[30px] w-[30%] h-[100px] overflow-y-auto [&::-webkit-scrollbar]:hidden">{restaurants.address} Tel: {restaurants.telephone} </h1>
                </div>

                <div className="justify-end flex items-end flex-row w-full p-4 gap-x-3">
                  {((role === 'owner' && restaurants.user === user._id)|| role === 'admin') ? (
                    <>
                      <Link
                        href={`${pathname}/edit`}
                        className="w-45 h-15 text-white bg-black text-[30px] rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
                      >
                        EDIT
                      </Link>

                      <RestaurantAlertRemove handleDelete={handleDelete} />
                    </>
                  ) : (
                    <>
                      <button
                        className="w-45 h-15 text-black bg-white text-[30px] rounded-lg border border-black [text-shadow:0_0_20px_white,0_0_60px_rgba(255,255,255,1),0_0_100px_rgba(255,255,255,0.8)] font-bold transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
                        onClick={() => setShowComment(true)}
                      >
                        REVIEWS
                      </button>

                      <button
                        className="w-45 h-15 text-white bg-black text-[30px] rounded-lg [text-shadow:0_0_20px_white,0_0_60px_rgba(255,255,255,1),0_0_100px_rgba(255,255,255,0.8)] font-bold transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
                        onClick={() => setShowCard(true)}
                      >
                        RESERVE
                      </button>
                    </>
                  )}
                </div>
                
            </div>
          {showCard && (
            <AddReserveCard user={user} restaurant={restaurants} closeCard={() => setShowCard(false)}/>
          )}
          {showComment && <ViewCommentPopPage restaurants={restaurants} closeCard={() => setShowComment(false)} user={user}/>}
        </main>
    )
}