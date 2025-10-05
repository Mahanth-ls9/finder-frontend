import React from 'react';

export default function Home() {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h1 className="card-title display-6">Finder UI Residence Listing App</h1>
        <p className="card-text lead text-muted">
          Manage communities and apartments. Use the navigation above to browse or create resources. This frontend connects to your Spring Boot backend via the <code>/api</code> endpoints.
        </p>
        <div className="mt-3">
          <a className="btn btn-outline-primary me-2" href="/communities">View Communities</a>
          <a className="btn btn-primary" href="/apartments">View Apartments</a>
        </div>
      </div>
    </div>
  );
}
