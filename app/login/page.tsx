import React from "react";
import LoginForm from "./LoginForm";
import LoginCarousel from "./LoginCarousel";
import { getCurrentUser } from "@/actions/getCurrentUser";

const Login = async () => {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Column: Visual Showcase Carousel (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12">
        <LoginCarousel />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-4 sm:p-8 bg-white">
        <LoginForm currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Login;
