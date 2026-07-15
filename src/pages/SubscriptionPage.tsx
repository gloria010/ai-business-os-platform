import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function SubscriptionPage() {
    const navigate = useNavigate();
  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: '/month',
      icon: <Check className="w-6 h-6 text-green-600" />,
      color: 'border-slate-200',
      button: 'Get Started',
      buttonStyle:
        'bg-slate-800 hover:bg-slate-900 text-white',
      features: [
        '1 Business Workspace',
        'Up to 5 Employees',
        'HR Dashboard',
        'Sales Dashboard',
        'Basic Reports',
        'Email Support',
      ],
    },

    {
      name: 'Professional',
      price: '₹999',
      period: '/month',
      popular: true,
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      color: 'border-blue-600',
      button: 'Upgrade Now',
      buttonStyle:
        'bg-blue-600 hover:bg-blue-700 text-white',
      features: [
        'Everything in Starter',
        'Up to 50 Employees',
        'Inventory Management',
        'Attendance',
        'Leave Management',
        'AI Analytics',
        'Advanced Reports',
        'Priority Support',
      ],
    },

    {
      name: 'Enterprise',
      price: '₹2999',
      period: '/month',
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-600',
      button: 'Choose Enterprise',
      buttonStyle:
        'bg-purple-600 hover:bg-purple-700 text-white',
      features: [
        'Everything in Professional',
        'Unlimited Employees',
        'Unlimited Products',
        'Payroll',
        'Finance Module',
        'AI Analytics',
        'Unlimited Storage',
        '24×7 Premium Support',
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-6"
          >
            Choose Your Perfect Plan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-lg max-w-3xl mx-auto"
          >
            Scale your business with AI-powered tools. Start for free,
            upgrade when you're ready, and unlock advanced business
            management features.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-3 gap-8">

            {plans.map((plan, index) => (

              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-3xl shadow-lg border-2 ${plan.color} p-8 hover:shadow-2xl transition-all`}
              >

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    {plan.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800">
                  {plan.name}
                </h2>

                <div className="text-center mt-4">
                  <span className="text-5xl font-black text-slate-900">
                    {plan.price}
                  </span>

                  <span className="text-slate-500">
                    {plan.period}
                  </span>
                </div>

                <div className="mt-8 space-y-4">

                  {plan.features.map((feature) => (

                    <div
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />

                      <span className="text-slate-600 text-sm">
                        {feature}
                      </span>
                    </div>

                  ))}

                </div>

                <button
  onClick={() =>
    navigate("/subscription/checkout", {
      state: {
        plan: plan.name,
        price: Number(plan.price.replace("₹", "")),
      },
    })
  }
  className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all ${plan.buttonStyle}`}
>
  {plan.button}
</button>

              </motion.div>

            ))}

          </div>

        </div>
      </section>      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900">
              Compare Plans
            </h2>

            <p className="text-slate-500 mt-3">
              Find the perfect plan for your business needs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-lg">

            <table className="min-w-full border-collapse">

              <thead className="bg-blue-600 text-white">

                <tr>
                  <th className="text-left px-6 py-4">Features</th>
                  <th className="px-6 py-4">Starter</th>
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Enterprise</th>
                </tr>

              </thead>

              <tbody className="bg-white">

                {[
                  ['Business Workspace', '1', '1', 'Unlimited'],
                  ['Employees', '5', '50', 'Unlimited'],
                  ['HR Module', '✓', '✓', '✓'],
                  ['Sales Module', '✓', '✓', '✓'],
                  ['Inventory Management', '—', '✓', '✓'],
                  ['Attendance', '—', '✓', '✓'],
                  ['Leave Management', '—', '✓', '✓'],
                  ['AI Analytics', 'Basic', 'Advanced', 'Premium'],
                  ['Reports', 'Basic', 'Advanced', 'Premium'],
                  ['Payroll', '—', '—', '✓'],
                  ['Finance Module', '—', '—', '✓'],
                  ['API Access', '—', '—', '✓'],
                  ['Support', 'Email', 'Priority', '24×7'],
                ].map((row, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-slate-50 transition-colors"
                  >

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {row[0]}
                    </td>

                    <td className="text-center px-6 py-4">
                      {row[1]}
                    </td>

                    <td className="text-center px-6 py-4">
                      {row[2]}
                    </td>

                    <td className="text-center px-6 py-4">
                      {row[3]}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      </section>      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>

            <p className="text-slate-500 mt-3">
              Everything you need to know before choosing a plan.
            </p>
          </div>

          <div className="space-y-6">

            {[
              {
                q: 'Can I upgrade my plan later?',
                a: 'Yes. You can upgrade from Starter to Professional or Enterprise anytime without losing your data.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Our Starter plan is completely free, allowing you to explore the platform before upgrading.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes. You can cancel your subscription at any time from your business settings.',
              },
              {
                q: 'Is my business data secure?',
                a: 'Absolutely. We use secure authentication and encrypted storage to protect your business information.',
              },
            ].map((faq, index) => (

              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h3 className="font-bold text-slate-800 text-lg">
                  {faq.q}
                </h3>

                <p className="text-slate-500 mt-2">
                  {faq.a}
                </p>
              </div>

            ))}

          </div>

        </div>
      </section>

      {/* Call To Action */}

      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">

          <h2 className="text-4xl font-black mb-6">
            Ready to Grow Your Business?
          </h2>

          <p className="text-blue-100 text-lg mb-10">
            Join thousands of businesses already using AI Business OS to
            manage operations, employees, sales, and analytics from one
            intelligent platform.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-all"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </Link>

        </div>
      </section>

      </div>

      <Footer />
    </>
  );
}