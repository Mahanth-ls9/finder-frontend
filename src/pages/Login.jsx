import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../motionvariants";
import { AuthAPI } from "../api";
import blogBlob from "../assets/blog.svg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AuthAPI.login(form);
      window.location.href = "/";
    } catch {
      alert("Login failed");
    }
  };

  return (
    <main className="hero text-center">
      <div className="hero-blobs">
        <img src={blogBlob} alt="" className="blob-left floaty" />
        <img src={blogBlob} alt="" className="blob-right floaty" />
      </div>

      <motion.div className="container" variants={fadeUp} initial="hidden" animate="visible">
        <div className="card" style={{ maxWidth: "420px", margin: "0 auto" }}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ marginTop: "1rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ marginTop: "1.5rem", width: "100%" }}>
              Sign In
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
