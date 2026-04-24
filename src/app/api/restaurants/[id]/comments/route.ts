import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, {params}:{params: Promise<{id: string}>}) {
    try {

        const {id} = await params;
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
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}/comments`, {
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
            message: 'Cannot create Comments'
        }, {
            status: 500
        });
    }
}