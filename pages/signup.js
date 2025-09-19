import { useState } from "react";

export default function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const text = await res.text();   // <-- log raw response
            console.log("Raw response:", text);

            // try parsing if it is JSON
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{ display: "block", marginBottom: 10, width: "100%" }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ display: "block", marginBottom: 10, width: "100%" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ display: "block", marginBottom: 10, width: "100%" }}
                />
                <button type="submit">Signup</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
