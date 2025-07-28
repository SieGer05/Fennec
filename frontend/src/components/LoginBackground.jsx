import { IMAGES } from "../assets";

function LoginBackground() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-purple-100">
      <img
         src={IMAGES.Logo}
         alt="Background"
         className="absolute top-1/2 -translate-y-1/2 
                     w-full max-w-[700px] 
                     right-0 translate-x-[30%]
                     sm:translate-x-[35%] 
                     md:translate-x-[40%]
                     lg:w-[60%] lg:translate-x-[45%]
                     xl:w-[50%] xl:translate-x-[50%]
                     opacity-70"
      />

      <div className="absolute bottom-0 w-full bg-purple-700 text-white text-center py-3 sm:py-2 text-xs sm:text-sm">
         © {currentYear} All rights reserved.
      </div>
    </div>
  );
}

export default LoginBackground;