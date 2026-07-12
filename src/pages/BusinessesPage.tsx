import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  X
} from "lucide-react";

import PublicLayout from "../components/layout/PublicLayout";

interface Company {
  id: number;
  name: string;
  logo: string;
  workspace: string;
}

const companies: Company[] = [
  {
    id: 1,
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    workspace: "infosys",
  },
  {
    id: 2,
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    workspace: "tcs",
  },
  {
    id: 3,
    name: "Reliance Retail",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Reliance_Retail_Logo.png",
    workspace: "reliance-retail",
  },
  {
    id: 4,
    name: "Decathlon India",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Decathlon_Logo.svg",
    workspace: "decathlon-india",
  },
  {
    id: 5,
    name: "Zomato",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    workspace: "zomato",
  },
];

export default function BusinessesPage() {
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] =
    useState<Company | null>(null);

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const openWorkspace = (company: Company) => {
    setSelectedCompany(company);
    setPassword("");
    setError("");
  };

  const closeModal = () => {
    setSelectedCompany(null);
    setPassword("");
    setError("");
  };

  const login = () => {
  if (!password.trim()) {
    setError("Please enter your password");
    return;
  }

  navigate(
    `/businesses/${selectedCompany?.workspace}/dashboard`,
    {
      state: {
        company: selectedCompany,
      },
    }
  );
};

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-950 text-white">

        {/* Header */}

        <div className="border-b border-slate-800">

          <div className="max-w-7xl mx-auto px-6 py-14">

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black"
            >
              Business Workspaces
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 mt-4 text-lg"
            >
              Choose a company and securely enter its AI workspace.
            </motion.p>

          </div>

        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Company List Starts Here */}
                    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">

            {companies.map((company, index) => (

              <motion.div
                key={company.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                }}
                className={`flex flex-col md:flex-row md:items-center md:justify-between px-6 py-6 transition-all ${
                  index !== companies.length - 1
                    ? "border-b border-slate-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-5">

                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div>

                    <h2 className="text-2xl font-semibold">
                      {company.name}
                    </h2>

                    <p className="text-slate-400 mt-1">
                      Secure AI Business Workspace
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => openWorkspace(company)}
                  className="mt-5 md:mt-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Open Workspace
                  <ArrowRight size={18} />
                </button>

              </motion.div>

            ))}

          </div>

        </div>

        {/* Login Modal */}

        <AnimatePresence>

          {selectedCompany && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5"
            >

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"
              >

                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

                  <h2 className="text-xl font-bold">
                    {selectedCompany.name}
                  </h2>

                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-white transition"
                  >
                    <X size={22} />
                  </button>

                </div>

                <div className="p-6">

                  <p className="text-slate-400 mb-6">
                    Enter your workspace password.
                  </p>
                                    <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Workspace Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          login();
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-white outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {error && (
                    <p className="text-red-400 text-sm mt-3">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={login}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
                  >
                    Open Workspace
                    <ArrowRight size={18} />
                  </button>

                </div>

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>
    </PublicLayout>
  );
}
