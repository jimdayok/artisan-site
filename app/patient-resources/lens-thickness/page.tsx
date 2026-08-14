import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PatientLensThicknessClient from "./PatientLensThicknessClient";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

export default function LensThicknessComparisonPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#172a28]">
      <Header />
      <section data-theme="dark" className="relative overflow-hidden bg-[#101820] px-6 pb-16 pt-32 text-white md:px-10 md:pb-22 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(212,192,154,0.24),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(105,182,170,0.18),transparent_28%),linear-gradient(135deg,#101820,#172a28)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4c09a]">Patient Resources</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">See How Lens Material Affects Thickness</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/75 md:text-xl">What difference can a thinner lens material make for your prescription? Choose an example, select a frame size, and compare calculated lenses at the same scale.</p>
        </div>
      </section>
      <PatientLensThicknessClient />
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
