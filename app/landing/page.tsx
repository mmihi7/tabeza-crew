'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Briefcase, Clock, DollarSign, MapPin, Smartphone, Star, ArrowRight, Menu, X, Calendar, Shield } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7f4' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(248,247,244,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
                <Briefcase size={24} style={{ color: '#1a1a2e' }} />
              </div>
              <span className="font-semibold text-lg" style={{ color: '#1a1a2e' }}>Tabeza Crew</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm" style={{ color: '#666' }}>How it works</a>
              <a href="#features" className="text-sm" style={{ color: '#666' }}>Features</a>
              <a href="#earnings" className="text-sm" style={{ color: '#666' }}>Earnings</a>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#f59e0b', color: '#1a1a2e' }}
              >
                Sign In
              </button>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} style={{ color: '#1a1a2e' }} /> : <Menu size={24} style={{ color: '#1a1a2e' }} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4" style={{ backgroundColor: 'rgba(248,247,244,0.98)' }}>
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-sm py-2" style={{ color: '#666' }}>How it works</a>
              <a href="#features" className="text-sm py-2" style={{ color: '#666' }}>Features</a>
              <a href="#earnings" className="text-sm py-2" style={{ color: '#666' }}>Earnings</a>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-center"
                style={{ backgroundColor: '#f59e0b', color: '#1a1a2e' }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6" style={{ color: '#1a1a2e', lineHeight: 1.1 }}>
                Find Shifts.
                <span style={{ color: '#f59e0b' }}> Get Paid.</span>
              </h1>
              <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: '#666', lineHeight: 1.6 }}>
                The marketplace for hospitality staff in Kenya. Find shifts at top venues, track your earnings, and build your professional profile — all from your phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-5 py-4 sm:px-6 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base sm:text-sm"
                  style={{ backgroundColor: '#f59e0b', color: '#1a1a2e', minHeight: '48px' }}
                >
                  Join as Staff <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-5 py-4 sm:px-6 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base sm:text-sm"
                  style={{ backgroundColor: '#ffffff', color: '#1a1a2e', border: '1px solid #e5e5e5', minHeight: '48px' }}
                >
                  Sign In
                </button>
              </div>
              <p className="text-sm mt-4" style={{ color: '#999' }}>
                Available at 200+ venues across Kenya
              </p>
            </div>
            <div className="order-first lg:order-last">
              <div className="relative flex gap-4 items-end justify-center">
                {/* Amber glow */}
                <div className="absolute inset-0" style={{ backgroundColor: '#f59e0b', opacity: 0.08, filter: 'blur(48px)', borderRadius: '2rem' }} />
                {/* Man image — slightly taller */}
                <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
                  <img
                    src="https://bkaigyrrzsqbfscyznzw.supabase.co/storage/v1/object/public/media/tabeza_crew_man.png"
                    alt="Tabeza crew waiter"
                    style={{
                      width: 'clamp(140px, 22vw, 240px)',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                {/* Woman image */}
                <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
                  <img
                    src="https://bkaigyrrzsqbfscyznzw.supabase.co/storage/v1/object/public/media/tabeza_crew_woman.png"
                    alt="Tabeza crew waitress"
                    style={{
                      width: 'clamp(130px, 20vw, 220px)',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#1a1a2e' }}>
              How Tabeza Crew works
            </h2>
            <p className="text-base sm:text-lg" style={{ color: '#666' }}>
              Start earning in 3 simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              step="1"
              icon={<Briefcase size={32} style={{ color: '#f59e0b' }} />}
              title="Create Your Profile"
              description="Sign up and build your professional profile. Add your skills, experience, and availability."
            />
            <StepCard
              step="2"
              icon={<MapPin size={32} style={{ color: '#f59e0b' }} />}
              title="Find Shifts"
              description="Browse open shifts at venues near you. Apply directly or wait for venue invitations."
            />
            <StepCard
              step="3"
              icon={<DollarSign size={32} style={{ color: '#f59e0b' }} />}
              title="Work & Get Paid"
              description="Clock in, work your shift, and get paid via M-Pesa. Track all your earnings in one place."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#1a1a2e' }}>
              Features built for staff
            </h2>
            <p className="text-base sm:text-lg" style={{ color: '#666' }}>
              Everything you need to manage your hospitality career
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<MapPin size={32} style={{ color: '#f59e0b' }} />}
              title="Job Marketplace"
              description="Browse open shifts at venues across Kenya. Filter by location, pay rate, and schedule."
            />
            <FeatureCard
              icon={<Calendar size={32} style={{ color: '#f59e0b' }} />}
              title="Availability Calendar"
              description="Set your weekly availability and get matched with shifts that fit your schedule."
            />
            <FeatureCard
              icon={<Clock size={32} style={{ color: '#f59e0b' }} />}
              title="Shift Tracking"
              description="Clock in and out with one tap. Track your hours and breaks automatically."
            />
            <FeatureCard
              icon={<DollarSign size={32} style={{ color: '#f59e0b' }} />}
              title="Earnings Dashboard"
              description="See your total earnings, tips, and payment history. Know exactly what you've made."
            />
            <FeatureCard
              icon={<Star size={32} style={{ color: '#f59e0b' }} />}
              title="Performance Ratings"
              description="Build your reputation with ratings from venue managers. Higher ratings = more opportunities."
            />
            <FeatureCard
              icon={<Shield size={32} style={{ color: '#f59e0b' }} />}
              title="Secure Payments"
              description="Get paid directly to your M-Pesa account. No delays, no hassles, guaranteed payments."
            />
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section id="earnings" className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#1a1a2e' }}>
              Maximize your earnings
            </h2>
            <p className="text-base sm:text-lg" style={{ color: '#666' }}>
              Top performers earn more with Tabeza
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <EarningsCard
              title="Competitive Pay"
              amount="KSh 1,500-3,000"
              description="Per shift depending on venue and role"
            />
            <EarningsCard
              title="Tips Included"
              amount="+ KSh 500-2,000"
              description="Average tips per shift"
            />
            <EarningsCard
              title="Weekly Payouts"
              amount="Every Friday"
              description="Direct to your M-Pesa"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#1a1a2e' }}>
            Ready to start earning?
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: '#666' }}>
            Join thousands of hospitality professionals already using Tabeza Crew. Create your profile and find your next shift today.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="px-6 sm:px-8 py-4 rounded-lg font-medium text-base sm:text-lg w-full sm:w-auto"
            style={{ backgroundColor: '#f59e0b', color: '#1a1a2e' }}
          >
            Create Your Profile
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#1a1a2e' }}>
              Frequently asked questions
            </h2>
            <p className="text-base" style={{ color: '#666' }}>
              Everything you need to know before joining Tabeza Crew.
            </p>
          </div>
          <FaqAccordion items={CREW_FAQS} />
          <p className="text-center text-sm mt-8" style={{ color: '#666' }}>
            Still have questions?{' '}
            <a href="mailto:support@tabeza.co.ke" style={{ color: '#f59e0b', fontWeight: 600 }}>
              support@tabeza.co.ke
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f7f4', borderTop: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
                  <Briefcase size={24} style={{ color: '#1a1a2e' }} />
                </div>
                <span className="font-semibold" style={{ color: '#1a1a2e' }}>Tabeza Crew</span>
              </div>
              <p className="text-sm" style={{ color: '#666' }}>
                The marketplace for hospitality staff in Kenya.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#1a1a2e' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666' }}>
                <li><a href="#how-it-works" className="hover:text-black transition-colors">How it works</a></li>
                <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#earnings" className="hover:text-black transition-colors">Earnings</a></li>
                <li><a href="https://tabeza.co.ke" className="hover:text-black transition-colors">For Venues</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#1a1a2e' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666' }}>
                <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                <li><a href="/waiter/me/privacy" className="hover:text-black transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#1a1a2e' }}>Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666' }}>
                <li><a href="mailto:hello@tabeza.co.ke" className="hover:text-black transition-colors">hello@tabeza.co.ke</a></li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-sm" style={{ color: '#999', borderTop: '1px solid #e5e5e5' }}>
            © 2024 Tabeza. All rights reserved. Built with ❤️ in Kenya.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Crew FAQ data ─────────────────────────────────────────────────────────────

const CREW_FAQS = [
  {
    q: 'What is Tabeza Crew?',
    a: 'Tabeza Crew is a shift marketplace for waiters and hospitality staff. Venues post shifts, you apply or get hired directly, and when your shift starts your phone becomes a live service terminal connected to the customers you\'re serving.',
  },
  {
    q: 'How does finding shifts work?',
    a: 'Browse available shifts near you, apply for the ones that suit you, or receive direct hire offers from venues. Once confirmed, the shift appears in your schedule.',
  },
  {
    q: 'What does my profile show?',
    a: 'Your profile includes your name, photo, preferred locations, and your verified shift history — ratings, tips, and performance from previous shifts. Venues see this when deciding who to hire. Customers do not see your profile.',
  },
  {
    q: 'Can I control what\'s on my profile?',
    a: 'Yes. You can edit your profile at any time — update your photo, availability, and location preferences. Your performance history is verified by the system and cannot be edited, which is what makes it credible to venues.',
  },
  {
    q: 'What happens during a shift?',
    a: 'Your assigned customer tabs appear on your phone. Orders come through in real time. You can see what\'s been ordered, what\'s pending, and communicate with customers on your tabs. Tips and likes are recorded automatically.',
  },
  {
    q: 'Does my performance record carry across venues?',
    a: 'Yes. Every shift you complete adds to your portable record. Whether you work at one venue or ten, your history builds in one place and is visible to any venue considering hiring you.',
  },
  {
    q: 'How much can I earn?',
    a: 'Pay is set per shift by the venue and shown upfront before you apply. Tips from customers are separate and go directly to you.',
  },
  {
    q: 'Is there a cost to join as a waiter?',
    a: 'No. Tabeza Crew is completely free to join and use.',
  },
];

// ── FAQ Accordion Component ───────────────────────────────────────────────────

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${open === i ? 'rgba(245,158,11,0.4)' : '#e5e5e5'}`,
            borderRadius: '0.75rem',
            backgroundColor: open === i ? 'rgba(245,158,11,0.05)' : '#ffffff',
            overflow: 'hidden',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4 }}>
              {item.q}
            </span>
            <span style={{
              flexShrink: 0,
              width: 22, height: 22,
              borderRadius: '50%',
              border: '1.5px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f59e0b',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'transform 0.2s',
              transform: open === i ? 'rotate(45deg)' : 'none',
            }}>
              +
            </span>
          </button>
          {open === i && (
            <div style={{ padding: '0 1.25rem 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.65 }}>
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a2e' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#666' }}>{description}</p>
    </div>
  );
}

function StepCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: '#f59e0b', color: '#1a1a2e' }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a2e' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#666' }}>{description}</p>
    </div>
  );
}

function EarningsCard({ title, amount, description }: { title: string; amount: string; description: string }) {
  return (
    <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}>
      <div className="text-3xl font-bold mb-2" style={{ color: '#f59e0b' }}>{amount}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a2e' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#666' }}>{description}</p>
    </div>
  );
}
