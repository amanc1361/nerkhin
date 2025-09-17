"use client"; // This component needs to be a Client Component for the onClick event

import Image from 'next/image';
import React from 'react';

const SAMANDEHI_ID = "1-1-909343-65-0-2"


const SamandehiLogo: React.FC = () => {
  const logoUrl = `https://logo.samandehi.ir/logo.aspx?id=${SAMANDEHI_ID}&p=qftibsiyqftiodrfodrfnbpd`;
  const verifyUrl = `https://logo.samandehi.ir/Verify.aspx?id=${SAMANDEHI_ID}&p=xlaopfvlxlaouiwkuiwkrfth`;

  const handleLogoClick = () => {
    // Defines the properties of the popup window
    const popupOptions = 'toolbar=no,scrollbars=no,location=no,statusbar=no,menubar=no,resizable=0,width=450,height=630,top=30';
    window.open(verifyUrl, "Popup", popupOptions);
  };

  return (  
    <div style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
      <Image
        id='samandehi-logo'
        alt='logo-samandehi'
        src={logoUrl}
        width={125}  // Set appropriate dimensions
        height={150} // Set appropriate dimensions
        priority={false} // This image is likely not critical for the initial page load
      />
    </div>
  );
};

export default SamandehiLogo;