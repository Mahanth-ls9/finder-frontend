import React from "react";
import { motion } from "framer-motion";
import { fadeUp, container } from "../motionvariants";
import blogBlob from "../assets/blog.svg";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../api/auth";

export default function AdminDashboard() {
  const admin = isAdmin();
  if (!admin) return <Navigate to="/" replace />;

  return (
    <main className="hero">
      <div className="hero-blobs">
        <img src={blogBlob} alt="" className="blob-left floaty" />
        <img src={blogBlob} alt="" className="blob-right floaty" />
      </div>

      <motion.div className="container" variants={container} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp}>Admin Dashboard</motion.h1>
        <motion.p variants={fadeUp} className="text-muted">
          Create users, upload apartments, and manage your Finder data.
        </motion.p>

        <motion.div variants={fadeUp} className="grid">
          <div className="card"><h3>User Management</h3><p>Create and assign roles.</p></div>
          <div className="card"><h3>Bulk Upload</h3><p>Upload apartments via CSV files.</p></div>
          <div className="card"><h3>Audit Logs</h3><p>View activity and changes.</p></div>
        </motion.div>
      </motion.div>
    </main>
  );
}
