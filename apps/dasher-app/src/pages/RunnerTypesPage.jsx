import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const runnerTypes = [
  {
    key: 'hand',
    title: 'Hand Carry Runner',
    capacity: '1–2 orders',
    description: 'Perfect if you want to deliver by hand and keep it simple.',
    image: '/type-1.png',
    highlights: ['No vehicle required', 'Quick drop-offs', 'Great to start and learn the flow'],
  },
  {
    key: 'twoWheeler',
    title: 'Two-Wheeler Runner',
    capacity: '2–5 orders',
    description: 'Faster coverage and more capacity using a bike or scooter.',
    image: '/type-2.png',
    highlights: ['Higher capacity than hand carry', 'Ideal for short-to-medium routes', 'Easy parking and agile delivery'],
  },
  {
    key: 'fourWheeler',
    title: 'Four-Wheeler Runner',
    capacity: '5–10 orders',
    description: 'Max capacity for bigger waves using a car/van and insulated storage.',
    image: '/type-3.png',
    highlights: ['Highest capacity per wave', 'Best for longer routes', 'More stable in different weather'],
  },
];

function RunnerTypesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-20">
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage: "url('/h1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Choose the right capacity for your wave
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                3 ways to be a GrubRunner
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed">
                Start with the delivery style that fits you today. Upgrade your capacity anytime as you get comfortable.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  to="/become-a-runner"
                  className="w-full sm:w-auto text-center bg-grub-red text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Apply Now
                </Link>
                <a
                  href="#types"
                  className="w-full sm:w-auto text-center bg-white/95 text-gray-900 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-white transition-colors"
                >
                  See the 3 types
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-3 text-white">
                  <div className="text-sm font-extrabold">Type 1</div>
                  <div className="text-sm text-white/90">1–2 orders</div>
                </div>
                <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-3 text-white">
                  <div className="text-sm font-extrabold">Type 2</div>
                  <div className="text-sm text-white/90">2–5 orders</div>
                </div>
                <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-3 text-white">
                  <div className="text-sm font-extrabold">Type 3</div>
                  <div className="text-sm text-white/90">5–10 orders</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="types" className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Pick your delivery type
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Each type is designed around a clear capacity. Choose what you can comfortably carry and deliver on time.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {runnerTypes.map((type, index) => (
                <div
                  key={type.key}
                  className="group rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <div className="aspect-[16/10]">
                      <img
                        src={type.image}
                        alt={type.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-white">
                          <div className="text-sm font-extrabold">Type {index + 1}</div>
                          <div className="text-xl font-extrabold leading-tight">{type.capacity}</div>
                        </div>
                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25">
                          Capacity
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-gray-900">{type.title}</h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">{type.description}</p>

                    <div className="mt-5 space-y-2">
                      {type.highlights.map((h) => (
                        <div key={h} className="flex items-start gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="text-sm font-semibold text-gray-800">{h}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div className="text-sm font-extrabold text-grub-red">{type.capacity}</div>
                      <Link
                        to={`/register?runnerType=${index + 1}`}
                        className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-black transition-colors"
                      >
                        Choose this
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-gray-200 bg-gradient-to-r from-white to-red-50 p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-2xl">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    Start small. Scale your capacity.
                  </h3>
                  <p className="mt-3 text-lg text-gray-600">
                    Many runners start with 1–2 orders, then move up as they get faster with pickups and drop-offs.
                  </p>
                </div>
                <Link
                  to="/become-a-runner"
                  className="w-full lg:w-auto text-center bg-grub-red text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Become a GrubRunner
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RunnerTypesPage;
