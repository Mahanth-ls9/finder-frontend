import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, container } from "../motionvariants";
import blogBlob from "../assets/blog.svg";
import { ApartmentsAPI } from "../api";
import { isAdmin } from "../api/auth";

export default function ApartmentsList() {
  const [apartments, setApartments] = useState([]);
  const admin = isAdmin();

  useEffect(() => {
    (async () => {
      try {
        const data = await ApartmentsAPI.list();
        setApartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <main className="hero">
      <div className="hero-blobs">
        <img src={blogBlob} alt="" className="blob-left floaty" />
        <img src={blogBlob} alt="" className="blob-right floaty" />
      </div>

      <motion.div className="container" variants={container} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp}>Apartments</motion.h1>
        <motion.p variants={fadeUp} className="text-muted">
          Browse available apartments. {admin && "Admins can edit and manage listings."}
        </motion.p>

        <motion.div variants={fadeUp} className="cards-grid">
          {apartments.map((a) => (
            <motion.div key={a.id} className="card apartment-card" variants={fadeUp} whileHover={{ scale: 1.03 }}>
              <h3>{a.title}</h3>
              <p className="text-muted">#{a.apartmentNumber || "—"} — Community {a.communityId}</p>
              <p className="apartment-meta">Price: {a.price ? `$${a.price}` : "N/A"}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
