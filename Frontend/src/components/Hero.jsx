import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import heroImage from "../assets/hero2.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden bg-[#f7f7f7]">
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          items-center
          gap-8
          px-5
          py-10
          sm:px-8
          lg:h-[50vh]
          lg:min-h-[440px]
          lg:max-h-[540px]
          lg:grid-cols-2
          lg:px-10
          lg:py-8
        "
      >
        {/* Left content */}

        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary-600 sm:text-sm">
            Sharing made easy in Nigeria
          </p>

          <h1 className="text-3xl font-medium leading-[1.2] tracking-tight text-slate-900 sm:text-4xl lg:text-[46px]">
            Give useful items to{" "}
            <span className="text-primary-600">people who need them</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
            Needful connects people who have useful items to give away with
            people nearby who genuinely need them.
          </p>

          <button
            type="button"
            onClick={() => navigate("/create-item")}
            className="
              group
              mt-7
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-primary-600
              px-6
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-primary-700
              hover:shadow-md
            "
          >
            Give an item
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Right illustration */}

        <div className="relative flex h-full min-h-[280px] items-center justify-center lg:min-h-0">
          <img
            src={heroImage}
            alt="Two people sharing a useful item through Needful"
            className="
              h-auto
              max-h-[390px]
              w-full
              max-w-[590px]
              object-contain
              mix-blend-multiply
              lg:max-h-[420px]
            "
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
