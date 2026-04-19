import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";
import { getUser } from "@/lib/getUser";
import { cookies } from "next/headers";

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

export async function POST(req: NextRequest) {
    try {
        const token = (await cookies()).get('token')?.value;
        if(!token || token === 'null') {
            return NextResponse.json({
                    success: false,
                    message: 'Not authorized',
                },
                {
                    status: 401,
                }
            );
        }
        const body = await req.json();
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });
        const data = await resp.json().catch(() => null);

        return NextResponse.json(data, {
            status: resp.status
        });
    } catch(err) {
        console.log(err);
        return NextResponse.json({
            success: false,
            message: 'Cannot create Restaurant'
        }, {
            status: 500
        });
    }
}
