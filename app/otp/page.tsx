import React from "react";
import OtpForm from "./OtpForm";
import LoginCarousel from "../login/LoginCarousel";

export const metadata = {
  title: "Verify Code | TechHub",
  description: "Enter your verification code to complete sign-in or payment confirmation.",
};

const OtpPage = () => {
  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Column: Visual Showcase Carousel (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12">
        <LoginCarousel />
      </div>

      {/* Right Column: OTP Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-4 sm:p-8 bg-white">
        <OtpForm />
      </div>
    </div>
  );
};

export default OtpPage;

