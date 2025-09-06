import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-grub-red to-red-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            About GrubGate
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Connecting Montreal's finest restaurants with food lovers across the city, 
            one delicious meal at a time.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              Our Story
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Learn about our mission, vision, and the journey that brought us here.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="bg-grub-red text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto lg:mx-0 mb-6">
                M
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
              At GrubGate, our mission is to make quality meals accessible, effortless, and joyful for everyone. We are committed to bridging the gap between busy individuals and the vibrant local restaurants around them — delivering authentic flavors, one meal at a time.

We aim to empower people to spend their time doing what they love, while still enjoying nourishing, chef-prepared meals. Because we believe that great food should never be a compromise — it should be an everyday experience.
              </p>
            </div>

            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="bg-grub-red text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto lg:mx-0 mb-6">
                V
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Montreal's most trusted food delivery platform, fostering 
                a thriving ecosystem where local restaurants flourish and customers 
                enjoy exceptional culinary experiences. We envision a future where 
                food delivery is not just convenient, but delightful.
              </p>
            </div>

            {/* Story */}
            <div className="text-center lg:text-left">
              <div className="bg-grub-red text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto lg:mx-0 mb-6">
                S
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
              <p className="text-gray-600 leading-relaxed">
              At GrubGate, we understand a simple truth — not everyone can cook, and even when we do, it often doesn't taste the way it should. In the fast-paced lives of students and full-time professionals, spending hours in the kitchen just isn't practical.

That's why we created GrubGate — the first and only platform that connects individuals directly to local restaurants for their daily, ready-to-eat meals. We believe that everyone deserves delicious, chef-prepared food without sacrificing their time, energy, or lifestyle.

Whether you're studying for your future or hustling through a workday, GrubGate ensures that a great meal is always within reach — convenient, authentic, and crafted with care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              Meet Our Team
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind GrubGate, working tirelessly to bring 
              you the best food delivery experience in Montreal.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Chief Executive Officer' },
              { name: 'Michael Chen', role: 'Chief Technology Officer' },
              { name: 'Emily Rodriguez', role: 'Chief Operating Officer' },
              { name: 'David Thompson', role: 'Head of Marketing' },
              { name: 'Lisa Wang', role: 'Head of Customer Experience' },
              { name: 'James Wilson', role: 'Head of Operations' }
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full mx-auto bg-grub-red flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-grub-red font-semibold mb-4">
                  {member.role}
                </p>
                <div className="w-12 h-1 bg-grub-red mx-auto rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              Our Values
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at GrubGate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Partnership</h3>
              <p className="text-gray-600">
                We work closely with our restaurant partners to ensure mutual success and growth.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600">
                We never compromise on the quality of food or service we provide to our customers.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform and services through technology and creativity.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We're committed to supporting the local Montreal community and its culinary culture.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;