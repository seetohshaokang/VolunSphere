// src/containers/Auth/Registration/index.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Registration() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-30 flex items-center gap-2 hover:bg-white/20 text-white"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      {/* Title - positioned in the exact center */}
      <div className="absolute top-16 left-5 right-0 z-20 flex justify-center">
        <div className="flex items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">VOLUN</h1>
          <h1 className="text-4xl md:text-6xl font-bold text-[#0066FF]">
            SPHERE
          </h1>
        </div>
      </div>

      {/* Left Section - For Organizers */}
      <div className="w-full md:w-1/2 bg-[#0066FF] text-white p-8 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center h-full mt-16 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold mt-16 md:mt-20">
            I want to find volunteers
          </h2>

          <button
            onClick={() => navigate("/registrationorganiser")}
            className="mt-8 md:mt-20 border-2 border-white bg-transparent text-white font-semibold text-xl py-3 px-6 md:py-4 md:px-8 rounded-lg hover:bg-white hover:text-[#0066FF] transition-colors"
          >
            SIGN UP AS ORGANISER
          </button>
        </div>
      </div>

      {/* Half circle cutout */}
      <div className="absolute right-0 top-1/2 h-full transform -translate-y-1/2 z-10 md:block hidden">
        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
          <div className="bg-white w-64 h-64 rounded-full"></div>
        </div>
      </div>

      {/* Center Image */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
        <div className="bg-white rounded-full w-56 h-56 flex items-center justify-center overflow-hidden shadow-lg">
          <img
            src="/src/assets/helping-hand.svg"
            alt="Helping Hand"
            className="w-40 h-40 object-contain"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(11%) sepia(82%) saturate(5268%) hue-rotate(239deg) brightness(70%) contrast(112%)",
            }}
          />
        </div>
      </div>

      {/* Right Section - For Volunteers */}
      <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center">
        {/* Mobile image - only shown on mobile */}
        {isMobile && (
          <div className="my-16">
            <div className="bg-[#0066FF] rounded-full w-32 h-32 flex items-center justify-center overflow-hidden">
              <img
                src="/src/assets/helping-hand.svg"
                alt="Helping Hand"
                className="w-24 h-24 object-contain filter invert"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center h-full mt-0 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold mt-4 md:mt-20 text-black">
            I want to help others
          </h2>

          <button
            onClick={() => navigate("/registrationvolunteer")}
            className="mt-8 md:mt-20 border-2 border-[#0066FF] bg-transparent text-[#0066FF] font-semibold text-xl py-3 px-6 md:py-4 md:px-8 rounded-lg hover:bg-[#0066FF] hover:text-white transition-colors"
          >
            SIGN UP AS VOLUNTEER
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registration;
