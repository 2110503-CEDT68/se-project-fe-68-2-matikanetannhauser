'use client'
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

export default function LogoutPage() {
    const router = useRouter();
    useEffect(() => {
        const logout = async () => {
            try {
                const resp = await fetch('/api/auth/logout', {
                    method: 'POST',
                });

                const data = await resp.json().catch(() => null);

                if (!resp.ok) {
                throw new Error(data?.message || "Logout failed");
                }

                toast.success('Logged out successfully');
                router.push('/');
                router.refresh();
            } catch (err) {
                console.log(err);
                toast.error(err instanceof Error ? err.message : "Logout failed");
            }
        };
        logout();
    }, [router]);
    return (
        <></>
    )
}