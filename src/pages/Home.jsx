// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRevealOnScroll from '../hooks/useRevealOnScroll';

export default function Home() {
  // enable reveal behavior for elements with .reveal
  useRevealOnScroll();

  useEffect(() => {
    // add pulse to CTA once when page loads
    const btn = document.querySelector('.btn-cta-primary');
    if (btn) {
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 1600);
    }
  }, []);

  return (
    <main className="home-hero container-max">
      {/* decorative floating blobs */}
      <div className="bg-blob blob-1" aria-hidden="true">
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path d="M120,-150C165,-120,208,-80,221,-27C234,26,217,91,174,127C130,163,60,171,6,154C-48,137-83,94-130,62C-177,30-237,10-245,-38C-253,-86-209,-152-151,-176C-94,-200,-47,-183,7,-185C61,-187,122,-200,120,-150Z" />
          </g>
        </svg>
      </div>

      <div className="bg-blob blob-2" aria-hidden="true">
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path d="M90,-110C118,-94,154,-76,166,-46C178,-16,166,22,140,45C114,68,74,75,34,89C-6,103,-44,125,-85,113C-126,101,-170,55,-183,4C-196,-47,-178,-104,-129,-129C-79,-154,-39,-147,0,-146C39,-145,78,-152,90,-110Z" />
          </g>
        </svg>
      </div>

      <div className="hero-card">
        <div className="hero-inner reveal reveal-stagger">
          <div className="hero-grid">
            <div className="hero-left">
              <h1 className="hero-title reveal">Finder UI Residence Listing App</h1>

              <p className="hero-sub reveal">
                Manage communities and apartments. Use the navigation above to browse or create resources. This frontend connects to your Spring Boot backend via the <code>/api</code> endpoints.
              </p>

              <ul className="hero-features reveal">
                <li><span className="dot" /> Manage communities &amp; apartments</li>
                <li><span className="dot" /> Admin tools — bulk upload, create users, reset passwords</li>
                <li><span className="dot" /> Secure JWT auth and role-based access</li>
              </ul>

              <div className="mt-3 reveal">
                <Link className="btn btn-cta-primary btn-lg me-2" to="/apartments">View Apartments</Link>
                <Link className="btn btn-cta-outline btn-lg" to="/communities">View Communities</Link>
              </div>

              <div className="hero-meta text-muted mt-3 reveal">
                Quick links: <Link to="/users">Users</Link> • <Link to="/administration">Administration</Link>
              </div>
            </div>

            <div className="hero-right">
              <div className="preview-card reveal">
                <div className="preview-header">Latest Apartments</div>
                <ul className="preview-list">
                  <li>
                    <svg className="tiny-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L3 7v7c0 5 4 9 9 9s9-4 9-9V7l-9-5z"/></svg>
                    <strong>#102</strong> Cozy 2BR — <span className="muted">Berlin</span>
                  </li>
                  <li>
                    <svg className="tiny-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L3 7v7c0 5 4 9 9 9s9-4 9-9V7l-9-5z"/></svg>
                    <strong>#207</strong> Modern studio — <span className="muted">Munich</span>
                  </li>
                  <li>
                    <svg className="tiny-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L3 7v7c0 5 4 9 9 9s9-4 9-9V7l-9-5z"/></svg>
                    <strong>#341</strong> 3BR family apt — <span className="muted">Hamburg</span>
                  </li>
                </ul>
                <div className="preview-footer text-muted small">Example data — open Apartments to see live listings.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="feature-strip mt-4 reveal reveal-stagger">
        <div className="feature">
          <div className="feature-title">Fast setup</div>
          <div className="feature-desc text-muted">Plug into your Spring Boot backend quickly.</div>
        </div>
        <div className="feature">
          <div className="feature-title">Bulk import</div>
          <div className="feature-desc text-muted">CSV-based apartment upload.</div>
        </div>
        <div className="feature">
          <div className="feature-title">Role-based</div>
          <div className="feature-desc text-muted">Admin & user flows kept separate.</div>
        </div>
      </div>
    </main>
  );
}
