import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
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

        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reservations`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        const data = await resp.json().catch(() => null);

        return NextResponse.json(data,
            { status: resp.status }
        )
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