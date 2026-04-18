import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";
import { getUser } from "@/lib/getUser";

export async function GET(req: NextRequest) {
    try {
        // const session = await getServerSession(authOptions);
        const user = await getUser();
        // console.log(user);
        if(!user) {
            return NextResponse.json({
                success: false, 
                message: 'Not authorized',
            }, {
                status: 401
            });
        }
        
        // const user = session.user as UserType;
        console.log(user);
        console.log(user._id.toString());
        
        await connectDB();
        let query;
    
        if(user.role !== 'admin') {
            // query = Reservation.find({user: user.id}).populate({
            //     path: 'restaurant',
            //     select: 'name address tel'
            // })
            query = Reservation.aggregate([
                {$match: {
                    user: user._id
                }},
                {$lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurantData'
                }},
                {$unwind: '$restaurantData'},
                {$lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }},
                {$unwind: '$userData'},
                {$addFields: {
                    userName: '$userData.name',
                    restaurantName: '$restaurantData.name'
                }},
                {$unset: ['restaurantData', 'userData']}
            ]);
        } else {
            query = Reservation.aggregate([
                {$lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurantData'
                }},
                {$unwind: '$restaurantData'},
                {$lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }},
                {$unwind: '$userData'},
                {$addFields: {
                    userName: '$userData.name',
                    restaurantName: '$restaurantData.name'
                }},
                {$unset: ['restaurantData', 'userData']}
            ]);
        }
    
        const reservations = await query;

        return NextResponse.json({
            success: true,
            count: reservations.length,
            data: reservations
        }, {
            status: 200
        })
    } catch(err) {
        console.error(err);
        return NextResponse.json({
            success: false, 
            message: 'Internal Server Error',
        }, {
            status: 500
        })
    }
}