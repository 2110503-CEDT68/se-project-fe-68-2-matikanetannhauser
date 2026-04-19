import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, {params}:{params: Promise<{id: string}>}) {
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

        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}/reservations`, {
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
        console.log(err);
        return NextResponse.json({
            success: false, 
            message: 'Cannot find Reservation',
        }, {
            status: 500
        })
    }

}

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
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}/reservations`, {
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
            message: 'Cannot create Reservation'
        }, {
            status: 500
        });
    }
}

//test
export async function DELETE(req: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
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

    const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}/reservations`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    const data = await resp.json().catch(() => null);

    return NextResponse.json(data,
      { status: resp.status }
    )
  } catch (err) {
    console.log(err)

    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete reservation",
      },
      { status: 500 }
    )
  }
}