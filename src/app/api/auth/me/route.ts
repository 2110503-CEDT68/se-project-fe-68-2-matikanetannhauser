import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = (await cookies()).get('token')?.value;

        if(!token) {
            return Response.json({ success: false, data: null }, { status: 401 });
        }

        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        const data = await resp.json().catch(() => null);

        return Response.json(data, {status: resp.status});
    } catch {
        return Response.json(
            { success: false, data: null },
            { status: 500 }
        );
    }
}