import mongoose from "mongoose";
import Restaurant from "@/models/Restaurant";
import Reservation from "@/models/Reservation";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const {id} = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}`,{
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
            return NextResponse.json(
                { success: false, message: "Backend error" },
                { status: res.status }
            );
        }

    const restaurant = await res.json();
    if (!restaurant) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restaurant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;

    console.log("url",`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}`)
    
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
    const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}`, {
        method: 'PUT',
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  

  try { 
    const token = (await cookies()).get('token')?.value;
    const {id} = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/restaurants/${id}`,{
      method: "DELETE",
      cache: "no-store",
      headers : {Authorization: `Bearer ${token}`}
    });

    if (!res.ok) {
            return NextResponse.json(
                { success: false, message: "Backend error" },
                { status: res.status }
            );
        }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}