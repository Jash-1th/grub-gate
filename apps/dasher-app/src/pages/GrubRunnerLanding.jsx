import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CalendarIcon,
  TruckIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PackageIcon = ArchiveBoxIcon;

const whatIsFeatures = [
  {
    title: 'Pre-planned Meals',
    body: 'Pick up organized meal orders prepared in advance. Eliminate guesswork and ensure smoother handoffs.',
    icon: PackageIcon,
  },
  {
    title: 'Fixed Delivery Waves',
    body: 'Operate during scheduled time blocks. Enjoy clearer timing with fewer last-minute changes.',
    icon: ClockIcon,
  },
  {
    title: 'No Random Orders',
    body: 'Avoid endless notifications or chaotic routing. Execute a clear, pre-assigned plan calmly.',
    icon: MapPinIcon,
  },
];

const processSteps = [
  {
    title: 'Apply',
    body: 'Create your profile and submit a streamlined application.',
    icon: UserPlusIcon,
  },
  {
    title: 'Choose Waves',
    body: 'Select delivery blocks that align with your availability.',
    icon: CalendarIcon,
  },
  {
    title: 'Pick Up & Deliver',
    body: 'Collect orders and complete scheduled drop-offs using a fixed route.',
    icon: TruckIcon,
  },
  {
    title: 'Get Paid',
    body: 'Receive transparent earnings tied directly to the deliveries and waves you complete.',
    icon: CurrencyDollarIcon,
  },
];

const comparisonItems = [
  {
    feature: 'Routing & Planning',
    grub: 'Planned Routes',
    other: 'Random Orders',
  },
  {
    feature: 'Earnings Structure',
    grub: 'Predictable Earnings',
    other: 'Unpredictable Pay',
  },
  {
    feature: 'Work Environment',
    grub: 'Time-boxed Waves',
    other: 'High Pressure',
  },
];

const audienceCards = [
  {
    title: 'Students',
    body: 'Organize work around class schedules by selecting specific waves that fit your day.',
    icon: CalendarIcon,
  },
  {
    title: 'Part-time Workers',
    body: 'Select predictable delivery blocks that complement your primary employment.',
    icon: ClockIcon,
  },
  {
    title: 'Stability Seekers',
    body: 'Trade constant notifications for planned routes and clearer expectations.',
    icon: ShieldCheckIcon,
  },
];

const requirementCards = [
  {
    title: 'Valid ID',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Smartphone',
    icon: DevicePhoneMobileIcon,
  },
  {
    title: 'Reliable Vehicle (Bike / Car / Scooter)',
    icon: TruckIcon,
  },
  {
    title: 'Professionalism',
    icon: BriefcaseIcon,
  },
];

const faqs = [
  {
    question: 'What is a Delivery Wave?',
    answer:
      'A wave is a pre-scheduled block of time (typically lunch or dinner). Instead of waiting for random requests, you select a wave, collect a batch of orders, and deliver them in a single sequence.',
  },
  {
    question: 'Do I need a car to be a GrubRunner?',
    answer:
      'Not necessarily. In many campus and downtown zones, electric bikes and scooters are preferred. You simply need a reliable vehicle capable of carrying insulated bags.',
  },
  {
    question: 'How does payment work?',
    answer:
      'You earn a fixed fee per delivery plus a wave bonus. Payments are processed weekly, with options for instant transfer available for top-rated runners.',
  },
  {
    question: 'Is this different from other apps?',
    answer:
      'Yes. We do not utilize algorithms that penalize you for declining orders. You select your waves in advance, know your route, and earn predictably.',
  },
];

function GrubRunnerLanding() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section
          className="w-full min-h-screen flex flex-col justify-center items-center pt-28 pb-20 px-6 relative overflow-hidden"
          style={{
            backgroundImage: "url('/herosection-landingpage.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 18%',
              backgroundPosition: 'center 60px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/25" />
          <div className="relative z-10 w-full">
            <style>{`
            @keyframes grHeroFloat {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
            .gr-hero-float {
              animation: grHeroFloat 5.5s ease-in-out infinite;
            }
          `}</style>

          <div className="max-w-7xl w-full">
            <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-5xl mx-auto lg:mx-0 lg:ml-20 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-extrabold tracking-tight text-white drop-shadow-sm">
                Deliver Smart. Earn Predictably. Become a GrubRunner.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mt-4 sm:mt-6 max-w-2xl drop-shadow-sm">
                Execute pre-planned delivery waves with fixed routes. No chaos. No algorithm pressure.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/become-a-runner"
                  className="w-full sm:w-auto text-center bg-grub-red text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Become a GrubRunner
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto text-center bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-semibold hover:bg-gray-50"
                >
                  How it Works
                </a>
              </div>

              <div className="mt-10 sm:mt-12 flex justify-center sm:justify-start">
                <div className="gr-hero-float w-full max-w-sm sm:w-auto rounded-2xl border border-white/30 bg-white/90 backdrop-blur px-5 sm:px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                      <CurrencyDollarIcon className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                      Weekly Earnings: $840.50
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                What is a GrubRunner?
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                GrubRunners facilitate pre-planned meal distributions during scheduled waves, allowing for a safe and consistent delivery experience.
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {whatIsFeatures.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="bg-red-50 text-grub-red p-4 rounded-2xl w-fit mb-6 mx-auto">
                    <item.icon className="h-12 w-12" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-lg text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full bg-gray-100 py-24 scroll-mt-28 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">How it Works</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                A streamlined workflow designed for clarity—deliver calmly and consistently.
              </p>
            </div>

            <div className="relative mt-12">
              <div className="hidden md:block absolute left-4 right-4 top-10 h-px bg-gray-100" aria-hidden="true" />
              <div className="grid gap-8 md:grid-cols-4 relative">
                {processSteps.map((step, idx) => (
                  <div
                    key={step.title}
                    className="relative overflow-hidden z-10 bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
                  >
                    <div className="bg-red-50 text-grub-red w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4">
                      {idx + 1}
                    </div>
                    <step.icon className="text-grub-red h-12 w-12 mb-6" aria-hidden="true" />
                    <div className="font-bold text-gray-900">{step.title}</div>
                    <div className="mt-3 text-lg leading-relaxed text-gray-600">{step.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Comparison</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                GrubRunners is engineered for calm, predictable delivery work.
              </p>
            </div>

            <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Desktop / Tablet */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-white px-6 py-5 text-sm md:text-base font-semibold">
                  <div className="text-gray-700 text-left">Feature</div>
                  <div className="text-grub-red font-extrabold text-center">GrubRunners</div>
                  <div className="text-gray-500 text-center">Others</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {comparisonItems.map((row, idx) => (
                    <div
                      key={row.feature}
                      className={`grid grid-cols-3 px-6 py-5 text-sm md:text-base transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50`}
                    >
                      <div className="font-semibold text-gray-900 text-left">{row.feature}</div>
                      <div className="flex items-center justify-center gap-3 font-semibold text-gray-900 text-center">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                        <span>{row.grub}</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-gray-600 text-center">
                        <XMarkIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                        <span>{row.other}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden p-4">
                <div className="space-y-4">
                  {comparisonItems.map((row) => (
                    <div key={row.feature} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50">
                        <div className="text-sm font-semibold text-gray-900">{row.feature}</div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-xs font-semibold text-grub-red">GrubRunners</div>
                          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-gray-900">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                            <span>{row.grub}</span>
                          </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-xs font-semibold text-gray-500">Others</div>
                          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                            <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            <span>{row.other}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-gray-100 py-24 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Earnings</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                <span className="text-grub-red font-bold">Paid per delivery + wave</span> — clear, predictable payouts.
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center">
                <div className="flex flex-col items-center justify-center gap-4 mb-6">
                  <CurrencyDollarIcon className="h-12 w-12 text-grub-red" aria-hidden="true" />
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-base font-semibold text-grub-red">
                    <ShieldCheckIcon className="h-6 w-6 text-grub-red" aria-hidden="true" />
                    No Pooled Payments
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">Transparent Payouts</h3>
                <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                  Compensation is calculated per delivery and per wave. You understand your earning potential before you begin.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center">
                <ClockIcon className="h-12 w-12 text-grub-red mb-6" aria-hidden="true" />
                <h3 className="mt-6 text-xl font-bold text-gray-900">Consistent Schedule</h3>
                <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                  Plan your finances around dependable work blocks rather than fluctuating demand.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Is this for you?</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                An ideal opportunity for those seeking structured, low-stress delivery work.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {audienceCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                  <div className="inline-flex rounded-2xl bg-grub-red/5 p-4 mb-6 mx-auto">
                    <card.icon className="h-10 w-10 text-grub-red" aria-hidden="true" />
                  </div>
                  <div className="font-semibold text-gray-900 text-xl">{card.title}</div>
                  <div className="mt-3 text-lg leading-relaxed text-gray-600">{card.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="w-full bg-white">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                FAQ
              </h2>
            </div>

            <div className="mt-12">
              {faqs.map((item, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={item.question}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="bg-white border border-gray-100 rounded-xl p-6 mb-4 cursor-pointer shadow-sm"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenFaqIndex(isOpen ? null : idx);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold text-gray-900">{item.question}</div>
                      {isOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                      )}
                    </div>
                    {isOpen ? (
                      <div className="text-gray-600 mt-4 leading-relaxed">{item.answer}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="w-full bg-gray-100 py-24 border-y border-gray-200">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Requirements</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">A short checklist to get started.</p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {requirementCards.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <item.icon className="h-12 w-12 text-grub-red mb-6" aria-hidden="true" />
                  <div className="font-semibold text-gray-900 text-xl">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-grub-red rounded-3xl p-12 text-center text-white relative overflow-hidden">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Ready to start earning?</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Apply once, then choose delivery waves that fit your schedule.
              </p>
              <Link
                to="/become-a-runner"
                className="bg-white text-grub-red px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center justify-center"
              >
                Apply to Become a GrubRunner
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default GrubRunnerLanding;
