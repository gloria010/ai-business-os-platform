import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Building2,
  BarChart3,
  Users,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">

        {/* Hero Section */}

        <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 py-24">

          {/* Background Blur */}

          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left */}

              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >

                <span className="inline-flex items-center bg-blue-500/20 text-blue-100 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  AI-Powered Business Platform
                </span>

                <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">

                  Transforming

                  <span className="block text-cyan-300">
                    Businesses with AI
                  </span>

                </h1>

                <p className="text-blue-100 text-lg mt-8 leading-8 max-w-xl">

                  AI Business OS is an intelligent business operating
                  platform that helps organizations manage employees,
                  sales, customers, reports and AI-powered insights
                  from one unified workspace.

                </p>

                <div className="flex flex-wrap gap-4 mt-10">

                  <Link
                    to="/register"
                    className="bg-white text-blue-700 px-7 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    Get Started

                    <ArrowRight className="w-5 h-5" />

                  </Link>

                  <Link
                    to="/features"
                    className="border border-white text-white px-7 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-all"
                  >
                    Explore Features
                  </Link>

                </div>

              </motion.div>

              {/* Right */}

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >

                {/* Main Dashboard */}

                <div className="bg-white rounded-3xl shadow-2xl p-8">

                  <h3 className="font-bold text-slate-800 text-xl mb-6">
                    AI Business Dashboard
                  </h3>

                  <div className="grid grid-cols-2 gap-5">

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="bg-blue-50 rounded-2xl p-5"
                    >

                      <Brain className="w-8 h-8 text-blue-600 mb-3" />

                      <h4 className="font-semibold text-slate-800">
                        AI Analytics
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Smart business insights
                      </p>

                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="bg-green-50 rounded-2xl p-5"
                    >

                      <Users className="w-8 h-8 text-green-600 mb-3" />

                      <h4 className="font-semibold text-slate-800">
                        HR Management
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Employees & Recruitment
                      </p>

                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      className="bg-orange-50 rounded-2xl p-5"
                    >

                      <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />

                      <h4 className="font-semibold text-slate-800">
                        Sales
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        Reports & Revenue
                      </p>

                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      className="bg-purple-50 rounded-2xl p-5"
                    >

                      <Building2 className="w-8 h-8 text-purple-600 mb-3" />

                      <h4 className="font-semibold text-slate-800">
                        Business
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        One Unified Workspace
                      </p>

                    </motion.div>

                  </div>

                </div>

              </motion.div>

            </div>

          </div>

        </section>
                {/* About AI Business OS */}

        <section className="py-24 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                About Us
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">
                About AI Business OS
              </h2>

            </div>

            <div className="max-w-5xl mx-auto">

              <p className="text-lg leading-9 text-slate-600 text-center">

                AI Business OS is an AI-powered Business Operating System
                designed to simplify and modernize business management.
                It brings together businesses, employees, consumers, and
                administrators into one intelligent platform, allowing
                organizations to manage their daily operations efficiently.
                From Human Resources and Sales Management to AI Analytics,
                Business Communication, Reports, and Subscriptions,
                AI Business OS provides everything required to run and
                grow a business through a single unified workspace.

              </p>

            </div>

          </div>

        </section>

        {/* Objectives */}

        <section className="py-24 bg-slate-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                Our Objectives
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">

                What We Aim To Achieve

              </h2>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

              {[
                {
                  title: "Simplify Business Operations",
                  desc: "Provide one centralized platform to manage business activities efficiently.",
                },
                {
                  title: "AI-Powered Decision Making",
                  desc: "Enable businesses to make smarter decisions using AI-driven insights.",
                },
                {
                  title: "Unified Business Ecosystem",
                  desc: "Connect consumers, employees, businesses and administrators together.",
                },
                {
                  title: "Support Business Growth",
                  desc: "Help businesses improve productivity and scale through digital transformation.",
                },
              ].map((item, index) => (

                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100"
                >

                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">

                    <span className="text-blue-600 font-black text-xl">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="font-bold text-xl text-slate-800 mb-4">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 leading-7">
                    {item.desc}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>

        {/* Mission & Vision */}

        <section className="py-24 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid lg:grid-cols-2 gap-10">

              {/* Mission */}

              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl"
              >

                <h3 className="text-3xl font-black mb-6">

                  Our Mission

                </h3>

                <p className="leading-8 text-blue-100">

                  To empower businesses with intelligent AI-driven
                  solutions that simplify operations, automate workflows,
                  improve collaboration, and enable smarter business
                  decisions through one integrated digital platform.

                </p>

              </motion.div>

              {/* Vision */}

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white shadow-xl"
              >

                <h3 className="text-3xl font-black mb-6">

                  Our Vision

                </h3>

                <p className="leading-8 text-slate-300">

                  To become a leading AI-powered Business Operating
                  System that transforms the way businesses manage,
                  collaborate, innovate, and grow through intelligent
                  technology and digital excellence.

                </p>

              </motion.div>

            </div>

          </div>

        </section>
                {/* Why Choose AI Business OS */}

        <section className="py-24 bg-slate-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                Why Choose Us
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">
                Why Choose AI Business OS?
              </h2>

              <p className="text-slate-500 mt-5 max-w-3xl mx-auto">
                Everything your business needs in one intelligent platform.
                Simplify operations, improve productivity, and make better
                decisions with AI-powered business management.
              </p>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {[
                {
                  icon: Brain,
                  title: "AI-Powered Automation",
                  desc: "Automate repetitive business tasks and receive intelligent recommendations."
                },
                {
                  icon: Users,
                  title: "Employee Management",
                  desc: "Manage recruitment, employees, attendance and HR operations efficiently."
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Analytics",
                  desc: "Track sales, performance and business insights through interactive dashboards."
                },
                {
                  icon: Building2,
                  title: "Unified Workspace",
                  desc: "Access HR, Sales, Reports and AI tools from one centralized workspace."
                },
                {
                  icon: ArrowRight,
                  title: "Scalable Platform",
                  desc: "Designed to support startups, growing businesses and enterprises."
                },
                {
                  icon: Brain,
                  title: "Smarter Decisions",
                  desc: "Leverage AI insights to improve efficiency and accelerate business growth."
                }
              ].map((item, index) => (

                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    y: -8,
                    scale: 1.03
                  }}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all"
                >

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-6">

                    <item.icon className="w-8 h-8 text-white" />

                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 leading-7">
                    {item.desc}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>

        {/* Platform Features */}

        <section className="py-24 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                Features
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">
                Powerful Features For Every Business
              </h2>

              <p className="text-slate-500 mt-5 max-w-3xl mx-auto">
                Explore the intelligent modules that help businesses
                manage operations efficiently from one platform.
              </p>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {[
                "HR Management",
                "Employee Management",
                "Sales Management",
                "Business Communication",
                "AI Analytics",
                "Reports & Insights",
                "Smart Notifications",
                "Subscription Management",
                "Business Dashboard"
              ].map((feature, index) => (

                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{
                    scale: 1.05,
                    rotate: 1
                  }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 p-8 shadow-md hover:shadow-xl transition-all"
                >

                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl"></div>

                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 text-white font-bold text-xl">
                    {index + 1}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {feature}
                  </h3>

                  <p className="text-slate-600 leading-7">
                    Experience seamless management and intelligent
                    automation through the {feature.toLowerCase()}
                    module within AI Business OS.
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>
                {/* How AI Business OS Works */}

        <section className="py-24 bg-slate-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                Workflow
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">
                How AI Business OS Works
              </h2>

              <p className="text-slate-500 mt-5">
                A simple journey from registration to business growth.
              </p>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

              {[
                "Register",
                "Choose Subscription",
                "Create Workspace",
                "Grow Your Business",
              ].map((step, index) => (

                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl shadow-lg p-8 text-center"
                >

                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                    {index + 1}
                  </div>

                  <h3 className="font-bold text-xl text-slate-800 mb-3">
                    {step}
                  </h3>

                  <p className="text-slate-600 leading-7">
                    Complete this step to continue your journey with AI Business OS.
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>

        {/* Who Can Use AI Business OS */}

        <section className="py-24 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <span className="text-blue-600 font-semibold uppercase tracking-wider">
                Users
              </span>

              <h2 className="text-4xl font-black text-slate-900 mt-3">
                Who Can Use AI Business OS?
              </h2>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

              {[
                {
                  title: "Consumers",
                  desc: "Browse products, place orders, manage your profile and track purchases."
                },
                {
                  title: "Business Owners",
                  desc: "Manage HR, Sales, Employees, Reports, AI Analytics and daily operations."
                },
                {
                  title: "Employees",
                  desc: "Access workspaces, HR services, assigned tasks and company activities."
                },
                {
                  title: "Administrators",
                  desc: "Manage businesses, approve registrations and monitor platform activities."
                }
              ].map((user) => (

                <motion.div
                  key={user.title}
                  whileHover={{
                    y: -10,
                    scale: 1.03
                  }}
                  className="bg-slate-50 rounded-3xl p-8 shadow-md border border-slate-100 text-center"
                >

                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">

                    {user.title.charAt(0)}

                  </div>

                  <h3 className="font-bold text-xl text-slate-800 mb-4">
                    {user.title}
                  </h3>

                  <p className="text-slate-600 leading-7">
                    {user.desc}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>

        {/* Platform Statistics */}

        <section className="py-24 bg-gradient-to-r from-blue-700 to-indigo-700">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">

              {[
                ["10+", "Business Modules"],
                ["4", "User Roles"],
                ["AI", "Business Intelligence"],
                ["1", "Unified Platform"],
              ].map(([value, label]) => (

                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                >

                  <h2 className="text-5xl font-black text-white mb-3">
                    {value}
                  </h2>

                  <p className="text-blue-100 font-medium">
                    {label}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>

        {/* Call To Action */}

        <section className="py-24 bg-white">

          <div className="max-w-4xl mx-auto text-center px-4">

            <h2 className="text-5xl font-black text-slate-900 mb-6">
              Ready to Transform Your Business?
            </h2>

            <p className="text-slate-500 text-lg leading-8 mb-10">
              Join AI Business OS today and simplify business management
              with one intelligent platform built for the future.
            </p>

            <div className="flex flex-wrap justify-center gap-5">

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all"
              >
                Get Started
              </Link>

              <Link
                to="/contact"
                className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </section>

      </div>

      <Footer />

    </>
  );
}