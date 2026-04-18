import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {

    console.log("Login");

    try {
        const body = await req.json();
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        const data = await resp.json().catch(() => null);
        console.log("RESPONSE DATA:", data);

        if(!resp.ok) {
            return Response.json(
                { message: data?.msg || data?.message || 'Login failed' },
                { status: resp.status }
            );
        }
        
        const cookieStore = await cookies();
        cookieStore.set('token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 3,
        });
        return Response.json({ success: true }, {status: resp.status});
    } catch(err) {

        console.log("RESPONSE DATA:", err);
        
        return Response.json(
            { message: 'Login failed' },
            { status: 500 }
        );
    }
}