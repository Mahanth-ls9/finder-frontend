import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, container } from "../motionvariants";
import blogBlob from "../assets/blog.svg";
import { UsersAPI } from "../api";
import { isAdmin } from "../api/auth";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const admin = isAdmin();

  useEffect(() => {
    (async () => {
      try {
        const data = await UsersAPI.list();
        setUsers(Array.isArray(data) ? data : []);
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
        <motion.h1 variants={fadeUp}>Users</motion.h1>
        <motion.p variants={fadeUp} className="text-muted">
          {admin ? "Admin view — manage users and roles." : "User directory."}
        </motion.p>

        <motion.div variants={fadeUp} className="cards-grid">
          {users.map((u) => (
            <motion.div key={u.id} className="card user-card" variants={fadeUp} whileHover={{ scale: 1.03 }}>
              <h3>{u.username || "Unnamed User"}</h3>
              <p className="text-muted">{u.email}</p>
              <span className="role-badge">{(u.roles && [...u.roles].join(", ")) || "USER"}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
