import PublicNavbar from "../../../Components/Public/PublicNavbar";
import HeroSection from "./HeroSection";
import WhySection from "./WhySection";
import CtaSection from "./CtaSection";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none px-10 py-8">
        <PublicNavbar />
        <HeroSection />
        <WhySection />
        <CtaSection />
      </div>
    </div>
  );
};

export default Landing;
