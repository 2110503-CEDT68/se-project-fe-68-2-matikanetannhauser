'use client'

import { useState } from "react";
import type { RestaurantType } from "@/types/types"
import { AddReserveCard } from "@/components/AddReserveCard";
import { Box, TextField } from "@mui/material";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditsrestaurantClient({restaurants}:{restaurants:RestaurantType}) {
    const [showCard, setShowCard] = useState(false);
    const session = useSession();
    const pathname = usePathname();
    console.log(session);
    const role = session.data?.user?.role;
    const router = useRouter();

    const [name, setName] = useState(restaurants.name);
    const [address, setAddress] = useState(restaurants.address);
    const [tel, setTel] = useState(restaurants.tel);
    const [openTime, setOpenTime] = useState(restaurants.openTime);
    const [closeTime, setCloseTime] = useState(restaurants.closeTime);
    const [imgsrc, setImageURL] = useState(restaurants.imgsrc);

    const id = restaurants._id;

      const handleSave = async () => {
  try {
    const payload = {
      name,
      address,
      tel,
      openTime,
      closeTime,
      imgsrc,
    };

    const resp = await fetch(`/api/restaurants/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (data.success) {
      toast.success("Update success");
      router.push(`/restaurants/${id}`);
      router.refresh();
    } else {
      toast.error("Update failed");
    }

  } catch (error) {
    console.error(error);
    toast.error("Server error");
  }
};

    return (
        <main className="flex flex-col justify-center items-center w-full flex-1 mt-5">

          <div className="fixed inset-0 -z-10">
            <img
              src="/images/BG2.png"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <img
              src="/images/BG.png"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
            
            <div
              className="absolute inset-0 w-full h-full z-20 bottom-0"
              style={{  
                background: `linear-gradient(to top, #cebba89a, #ffffff00)`
              }}
            />
        </div>

            <div className="relative p-7 flex flex-col text-[2rem] h-150 w-375 rounded-3xl bg-white shadow-[0_0px_40px_rgba(0,0,0,0.7)]">


              <h1 className="absolute top-[-80px] left-[16px] z-10 text-[2.5rem] font-bold">Restaurant</h1>
              
              <div className="flex flex-col gap-3 p-7 border-2 border-black h-full rounded-2xl">

                
                <h1>Name <TextField
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                /> </h1>
                <h1>Status </h1>

                <h1>Address <TextField
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                /> </h1>

                <h1>Tel <TextField
                  id="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                /> </h1>

                <h1>Opening Hours <TextField
                  id="openTime"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                /> - <TextField
                  id="closeTime"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                /> </h1>

                <h1>Change Photo(url) <TextField
                  id="imageURL"
                  label="image URL"
                  value={imgsrc}
                  onChange={(e) => setImageURL(e.target.value)}
                /> </h1>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 5,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      mt: 'auto',
                    }}
                  >

                <Link href={`/restaurants/${restaurants._id}`}
                className="w-40 h-[60px] text-white bg-black text-[30px] rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
                style={{ background: `linear-gradient(to right, #676767 , #BFBFBF )`,}} >
                  
                  CANCLE
                </Link>

                <button 
                type="button"
                onClick={handleSave}
                className="w-40 h-15 text-white bg-black text-[30px] rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl">
                  SAVE
                </button>
                
                </Box>
                
              </div>

            </div>
            {showCard && (
              <AddReserveCard restaurant={restaurants} closeCard={() => setShowCard(false)}/>
            )}
        </main>
    )
}