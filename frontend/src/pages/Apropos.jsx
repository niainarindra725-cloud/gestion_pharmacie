import React from 'react';

const APropos = () => {
    return (
        <div className="apropos-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="mcd-section">
                <h2>Modèle Physique des Données ou MPD</h2>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <img 
                        src="/MPD_Final.png" 
                        alt="Modèle Physique des Données - Pharmacie" 
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default APropos;