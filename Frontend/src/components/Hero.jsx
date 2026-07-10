import Container from "./ui/Container";
import Button from "./ui/Button";
import heroImage from "../assets/needright.png";

const Hero = () => {
  return (
    <section className="bg-[#efe6e662]">
      <Container>
        <div className="grid min-h-[42vh] items-center gap-10 py-6 lg:grid-cols-2">
          {/* LEFT */}

          <div className="max-w-xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
              FREE • SIMPLE • COMMUNITY
            </p>

            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 lg:text-6xl">
              Give what you don't need.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Share useful items with people who need them—for free.
            </p>

            <div className="mt-10">
              <Button>Start Giving</Button>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex justify-center">
            <img
              src={heroImage}
              alt="Needful"
              className="w-full max-w-[460px] object-contain"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
