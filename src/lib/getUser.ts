import { cookies } from "next/headers";

const getUser = async () => {
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/me`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data;
}

export {getUser};