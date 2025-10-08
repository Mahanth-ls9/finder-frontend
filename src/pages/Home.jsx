import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { container, fadeUp } from "../motionvariants";
import blogBlob from "../assets/blog.svg";

export default function Home() {
  return (
    <main className="hero">
      <div className="hero-blobs">
        <motion.img
          src={blogBlob}
          alt=""
          className="blob-left floaty"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
        />
        <motion.img
          src={blogBlob}
          alt=""
          className="blob-right floaty"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
        />
      </div>

      <motion.div variants={container} initial="hidden" animate="visible" className="container">
        <motion.h1 variants={fadeUp}>Finder UI Residence Listing App</motion.h1>
        <motion.p variants={fadeUp}>
          Manage communities and apartments. This frontend connects directly to your Spring Boot backend using clean / api endpoints.
        </motion.p>
        <motion.div variants={fadeUp} style={{ marginTop: "1.5rem" }}>
          <Link to="/apartments" className="btn btn-primary me-2">
            View Apartments
          </Link>
          <Link to="/users" className="btn btn-outline">
            Manage Users
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
