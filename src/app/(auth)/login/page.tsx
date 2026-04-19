'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Login() {
    const router = useRouter();
    const handleSubmit = async (formData: FormData) => {
        try {
            const email = formData.get("email")?.toString().trim();
            const password = formData.get("password")?.toString();
            // console.log(email, password);
            // console.log("backend url:", process.env.NEXT_PUBLIC_BACKEND_URL);
            const resp = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password})
            });
            const data = await resp.json().catch(() => null);
            if (!resp.ok) {
                throw new Error(data?.message || "Invalid email or password");
            }

            toast.success('Logged in successfully');
            
            router.push('/');
        } catch(err) {
            console.log(err);
            toast.error(err instanceof Error ? err.message : "Login failed");
        }
    }
    return (
        <form action={handleSubmit}>
            <div className="h-dvh w-dvw flex items-center justify-center flex-col">
                <div className="shadow p-8 rounded-md border flex flex-col gap-y-4">
                    <h1 className="text-xl font-bold">Login</h1>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input id='email' type='email' name='email' required
                            className="ml-1 border rounded-sm w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input id='password' type='password' name='password' required
                            className="ml-1 border rounded-sm w-full"
                        />
                    </div>
                    <Button type='submit'>Login</Button>
                </div>
            </div>
        </form>
    )
}