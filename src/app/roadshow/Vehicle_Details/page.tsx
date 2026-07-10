/* eslint-disable */
// @ts-nocheck
// src/app/(client)/page.tsx
import React from 'react';
import './page.css';
import '../../../components/Client/HomePageSections/HomePageSection2.css';
import Image from 'next/image';

function HomePage() {
  return (
    <>
      {/* rdsw_VD - roadshow vehicle details section  */}
      <div className='rdsw_VD_OverallMain flex justify-between'>
        <div className='rdsw_VD_LeftMain align-center items-center text-center'>
          <h5 className='rdsw_VD_leftHeading'>19 Feet Single Side LED</h5>
{/* <Image
          src="/images/assets/HomeBanner_MainPageFinal.png"
          alt="Roadshow Logo"
          width={0}
          height={0}
          className=""
          style={{height:'300px', width:'auto'}}
        /> */}
          
     <div style={{border:'1px solid gray', background:'gray', borderRadius:'10px'}}>
         <img src="/images/assets/HomeBanner_MainPageFinal.png"  style={{height:'300px', width:'auto'}}></img>
     </div>
        </div>
        <div className='rdsw_VD_RightMain'>
          <div className='rdsw_VD_Price'>₹ 25,000 <span className='rdsw_VD_PricePerDay'>Per Day</span></div>
          <div className='rdsw_VD_SideHeading'>Product Details</div>
          <div className='rdsw_VD_Description'>Our Roadshow Vehicles are like a moving stage for your brand. With big LED screens, clear sound system, comfortable seating, and full branding options, they easily grab attention on the road or at any spot.</div>
          <div>
            <div className='flex justify-around'>
              <div>Visibility</div>
              <div>Visibility</div>
              <div>Visibility</div>
              <div>Visibility</div>

            </div>
            <div className='flex justify-around'>
              <div>Visibility</div>
              <div>Visibility</div>
              <div>Visibility</div>
              <div>Visibility</div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default HomePage;