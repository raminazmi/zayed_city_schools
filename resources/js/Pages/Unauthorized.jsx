import React from 'react';
import { Link } from '@inertiajs/react';

export default function Unauthorized() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '1rem' }}>403 - Unauthorized Action</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>You are not authorized to access this page.</p>
            <Link
                href="/"
                style={{
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: '#ffffff',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                }}
            >
                Go Back to Home
            </Link>
        </div>
    );
}
