import InteractiveCard from "./InteractiveCard";
import Rating from "@mui/material/Rating";
import { Box } from "@mui/material";
import { RestaurantType } from "@/types/types";  


export default function Card({
  restaurant,ratingMap 
}: {
  restaurant: RestaurantType , ratingMap:Record<string, number>;
}) {

  const avgStar = ratingMap[restaurant._id.toString()] || 0;

  // console.log("This is restaurant card", restaurant);

  return (
    <InteractiveCard>
      <Box className="relative w-full h-full">
        <img
          src={restaurant.imgsrc}
          className="w-full h-full object-cover rounded-[20px]"
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "40%",
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 1), transparent)",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />

        <Rating
          value={avgStar}
          precision={0.5}
          readOnly
          sx={{
            position: "absolute",
            bottom: 12,
            left: 16,
            zIndex: 2,
            fontSize: "2rem",
          }}
        />

        <button
          className="font-bold h-8 w-35 absolute bg-white bottom-2 right-2 rounded-xl text-right p-2 flex items-center justify-end"
          style={{ zIndex: 3 }}
        >
          SEE MORE
        </button>
      </Box>
    </InteractiveCard>
  );
}