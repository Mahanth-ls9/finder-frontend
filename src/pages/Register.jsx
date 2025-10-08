import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../motionvariants";
import { UsersAPI } from "../api";
import blogBlob from "../assets/blog.svg";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UsersAPI.register(form);
      window.location.href = "/login";
    } catch {
      alert("Registration failed");
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
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Username"
              className="form-control"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{ marginTop: "1rem" }}
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
              Register
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
