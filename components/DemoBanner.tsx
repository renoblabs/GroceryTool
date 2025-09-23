'use client';

import { useState, useEffect } from 'react';
import { isDemoMode } from '@/lib/demoMode';

export default function DemoBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demoMode = isDemoMode();
    setIsDemo(demoMode);
    setShowBanner(demoMode);
  }, []);

  if (!isDemo || !showBanner) {
    return null;
  }

  return (
    <div className="demo-banner">
      <div className="container">
        <div className="demo-content">
          <div className="demo-info">
            <span className="demo-badge">DEMO MODE</span>
            <span className="demo-text">
              You're viewing the demo version. Data is stored locally and price comparisons use sample data.
            </span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="demo-dismiss"
            aria-label="Dismiss demo banner"
          >
            ×
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .demo-banner {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .demo-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        
        .demo-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .demo-badge {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .demo-text {
          font-size: 0.875rem;
        }
        
        .demo-dismiss {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          line-height: 1;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        
        .demo-dismiss:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        @media (max-width: 768px) {
          .demo-content {
            flex-direction: column;
            text-align: center;
          }
          
          .demo-info {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .demo-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}