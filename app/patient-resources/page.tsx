"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const practices = [
  {
    name: "Sample Eye Care",
    address: "123 Main St, Dallas, TX 75001",
    phone: "214-555-1234",
    state: "TX",
  },
  {
    name: "Vision Center Example",
    address: "456 Oak Ave, Denver, CO 80014",
    phone: "303-555-5678",
    state: "CO",
  },
];

export default function PatientResources() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const filtered = practices.filter((practice) => {
    const matchesSearch =
      practice.name.toLowerCase().includes(search.toLowerCase()) ||
      practice.address.toLowerCase().includes(search.toLowerCase());

    const matchesState = stateFilter === "" || practice.state === stateFilter;

    return matchesSearch && matchesState;
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero */}
      <section className="px-6 py-28 text-center">
        <h1 className="text-5xl font-semibold">
          Better Vision Starts with Better Choices
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70">
          Learn how independent eye care, premium lenses, and better technology
          come together to give you clearer, more comfortable vision.
        </p>
      </section>

      {/* Independent Doctor */}
      <section className="bg-[#f2eee7] px-6 py-24 text-black">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-semibold">
            Why Independent Eye Care Makes a Difference
          </h2>
          <p className="mt-4 text-lg text-black/70">
            Independent eye doctors have the freedom to recommend what&apos;s best
            for you, not what they are required to use. That means more choices,
            better materials, and solutions tailored to your life.
          </p>

          <ul className="mt-6 space-y-2">
            <li>- More personalized recommendations</li>
            <li>- Access to better lens options</li>
            <li>- Focus on long-term comfort and clarity</li>
          </ul>
        </div>
      </section>

      {/* Tokai Feature */}
      <section className="px-6 py-28 text-center">
        <h2 className="text-4xl font-semibold">
          Thinner, Lighter, Better Looking Lenses
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-white/70">
          Advanced materials like Tokai&apos;s ultra-thin lenses help reduce thickness,
          weight, and improve the look of your glasses, especially for stronger
          prescriptions.
        </p>
      </section>

      {/* Locator */}
      <section className="bg-[#f2eee7] px-6 py-24 text-black">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-semibold">Find an Artisan Partner Practice</h2>

          <div className="mt-6 flex flex-wrap gap-4">
            <input
              placeholder="Search by city, ZIP, or name"
              className="w-full rounded-lg border px-4 py-3 md:w-1/2"
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="rounded-lg border px-4 py-3"
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              <option value="TX">Texas</option>
              <option value="CO">Colorado</option>
            </select>
          </div>

          <div className="mt-8 grid gap-4">
            {filtered.map((practice) => (
              <div key={practice.name} className="rounded-xl border bg-white p-6">
                <div className="font-semibold">{practice.name}</div>
                <div className="text-sm">{practice.address}</div>
                <a href={`tel:${practice.phone}`} className="text-blue-600">
                  {practice.phone}
                </a>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 text-center">
              <p>Can&apos;t find a nearby practice?</p>
              <button className="mt-4 rounded-full bg-black px-6 py-3 text-white">
                Help Me Find a Provider
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Education */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-semibold">Understanding Your Lenses</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-6">
              <h3 className="font-semibold">What is a Progressive Lens?</h3>
              <p className="mt-2 text-white/70">
                Progressive lenses provide vision correction for multiple distances
                without visible lines. (All About Vision)
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <h3 className="font-semibold">What is Anti-Reflective Coating?</h3>
              <p className="mt-2 text-white/70">
                AR coatings reduce glare and improve clarity by allowing more light
                to pass through lenses. (All About Vision)
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <h3 className="font-semibold">Why Do Lens Materials Matter?</h3>
              <p className="mt-2 text-white/70">
                High-index materials bend light more efficiently, creating thinner
                and lighter lenses. (All About Vision)
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <h3 className="font-semibold">What is Pupillary Distance?</h3>
              <p className="mt-2 text-white/70">
                PD ensures your lenses are aligned correctly for clear and
                comfortable vision. (All About Vision)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Resources */}
      <section className="bg-[#f2eee7] px-6 py-24 text-center text-black">
        <h2 className="text-3xl font-semibold">Learn More About Eye Care</h2>

        <div className="mt-6 flex flex-col gap-3">
          <a href="https://www.aoa.org" target="_blank" rel="noreferrer">
            American Optometric Association
          </a>
          <a href="https://www.nei.nih.gov" target="_blank" rel="noreferrer">
            National Eye Institute
          </a>
          <a href="https://www.allaboutvision.com" target="_blank" rel="noreferrer">
            All About Vision
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 text-center">
        <h2 className="text-4xl font-semibold">Ready to See the Difference?</h2>
        <button className="mt-6 rounded-full bg-[#d4c09a] px-6 py-3 text-black">
          Find a Practice
        </button>
      </section>

      <Footer onContactClick={() => {}} signUpHref={SIGNUP_URL} />
    </main>
  );
}
