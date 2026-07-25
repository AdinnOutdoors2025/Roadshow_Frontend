"use client";

import { useState } from "react";
import Image from "next/image";
import DatePicker from "@/components/calendar/calendar_reusable/calender";

type ProductFeature = {
  icon: string;
  title: string;
  desc: string;
  width?: number;
  height?: number;
};

const nineteenft3side: ProductFeature[] = [
  {
    icon: "/images/assets/full side LED edited (1)_NEW.png",
    title: "Visibility",
    desc: "Up to 200m",
  },
];

const productFeatures: ProductFeature[] = [
  { icon: "/images/assets/detail_page/Visibility.svg", title: "Visibility", desc: "Up to 200m", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Brightness.svg", title: "Brightness", desc: "Day & Night", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Display.svg", title: "Display", desc: "3-Side Coverage", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Audio.svg", title: "Audio", desc: "Clear Audio System", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Power.svg", title: "Power", desc: "Backup Available", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Setup.svg", title: "Setup", desc: "Quick Setup", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Coverage.svg", title: "Coverage", desc: "High Traffic Areas", width: 38, height: 38 },
  { icon: "/images/assets/detail_page/Mobility.svg", title: "Mobility", desc: "On-the-go Reach", width: 38, height: 38 },
];

export default function VehicleDetailsPage() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-[1420px] px-4 pb-14 pt-40 grid gap-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        
        {/* Left Sticky Vehicle Card */}
        <div className="lg:sticky lg:top-32 self-start">
          <h1 className="mb-5 text-[25px] font-semibold tracking-tight">
            Tata Ultra 19 Ft - 3 Sided LED
          </h1>

          <div className="relative flex min-h-[560px] items-center justify-center rounded-[34px] bg-[#f5f4f7] px-0 py-10 overflow-hidden">
            {nineteenft3side.map((item) => (
              <div
                key={item.title}
                className="relative w-full max-w-[750px] aspect-[3/2] flex items-center justify-center overflow-hidden"
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  fill
                  className="object-cover object-center"
                />
              </div>
            ))}

            {/* Carousel Buttons */}
            <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border-[0.5px] border-[#C5C4C6] px-3 py-2">
              <button className="flex items-center justify-center">
                <Image src="/images/assets/detail_page/left.svg" alt="left" width={40} height={40} className="object-contain" />
              </button>
              <button className="flex items-center justify-center">
                <Image src="/images/assets/detail_page/right.svg" alt="right" width={40} height={40} className="object-contain" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Scrollable Product Details */}
        <div>
          <h2 className="text-[30px] font-bold tracking-tight">
            ₹ 25,000 <span className="text-[14px] font-semibold">Per Day</span>
          </h2>

          <h3 className="mt-4 inline-block bg-gradient-to-r from-[#E52B2C] via-[#B12021] to-[#7F1818] bg-clip-text text-[24px] font-normal text-transparent">
            Product Details
          </h3>

          <p className="mt-2 max-w-[540px] text-[19px] leading-[1.45] text-black">
            Our Roadshow Vehicles are like a moving stage for your brand. With big LED screens, clear sound system, comfortable seating, and full branding options, they easily grab attention on the road or at any spot.
          </p>

          <div className="mt-9 grid grid-cols-4 gap-x-8 gap-y-8">
            {productFeatures.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-3 flex items-center justify-center" style={{ width: item.width, height: item.height }}>
                  <Image src={item.icon} alt={`${item.title} icon`} width={item.width} height={item.height} className="object-contain" />
                </div>
                <h4 className="text-[16px] font-medium leading-tight text-black">{item.title}</h4>
                <p className="mt-1 text-[13px] font-medium leading-tight text-[#666666]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Available Dates */}
          <div className="mt-9">
            <h3 className="text-[20px] font-bold text-[#d70000] mb-2">Available Dates</h3>
            <DatePicker checkIn={checkIn} checkOut={checkOut} setCheckIn={setCheckIn} setCheckOut={setCheckOut} />

            <button className="mt-6 rounded-full bg-black px-7 py-3 text-[13px] font-semibold text-white transition hover:bg-[#d70000]">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Product Detail Banner */}
      <section className="w-full m-0 p-0 mt-20 mb-20">
        <div className="relative w-full overflow-hidden">
          <Image
            src="/images/assets/detail_page/product_detail_page_banner.svg"
            alt="Product detail banner"
            width={1920}
            height={260}
            className="w-full h-auto object-contain"
          />
        </div>
      </section>
    </main>
  );
}