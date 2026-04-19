"use client";

import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const whiteTextField = {
  input: { color: "white" },
  label: { color: "gray" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "gray" },
    "&:hover fieldset": { borderColor: "white" },
    "&.Mui-focused fieldset": { borderColor: "white" },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
    opacity: 0,
  },
  "& .MuiInputLabel-root.MuiFormLabel-filled": {
    opacity: 0,
  },
  "& legend": {
    display: "none",
  },
};

export default function RestaurantsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    telephone: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [redirect, router]);

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.name || !form.email || !form.password || !form.telephone) {
      toast.error("Please fill all fields");
      return;
    }

    if (!form.email.includes("@")) {
      toast.error("Invalid email");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password too short");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Register failed");
        return;
      }

      toast.success("Welcome! Redirecting...");

      setForm({
        name: "",
        email: "",
        password: "",
        telephone: "",
      });

      setRedirect(true);

    } catch (err) {
      toast.error("Network error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center h-screen bg-[#161b22]">
      <div className="flex flex-col rounded-3xl w-175 bg-[#0d1117] p-10 gap-10">
        <div className="grid grid-cols-2 gap-6">
          <CreateBar
            txt="Email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
          />
          <CreateBar
            txt="Name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
          />
          <CreateBar
            txt="Tel"
            value={form.telephone}
            onChange={(v) => handleChange("telephone", v)}
          />
          <CreateBar
            txt="Password"
            value={form.password}
            onChange={(v) => handleChange("password", v)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="h-16 text-white font-bold border border-gray-800 rounded-lg 
          hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Create New User"}
        </button>
      </div>
    </main>
  );
}

export function CreateBar({
  txt,
  value,
  onChange,
}: {
  txt: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h1 className="text-white font-bold">{txt}</h1>
      <TextField
        placeholder={txt}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        type={
          txt === "Password"
            ? "password"
            : txt === "Email"
            ? "email"
            : txt === "Tel"
            ? "tel"
            : "text"
        }
        sx={whiteTextField}
      />
    </div>
  );
}