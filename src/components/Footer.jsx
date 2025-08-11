import React from "react";
import { FaTwitter, FaInstagram, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-200 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {/* Logo & Intro */}
        <div>
          <h2 className="text-2xl font-fredoka font-bold text-amber mb-3">
            LingoBud
          </h2>
          <p className="text-sm text-gray-400">
            Fun and engaging language learning for kids — starting with Yoruba!
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold text-amber mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {/* {["Home", "Pricing", "FAQ", "Login", "Sign Up"].map((link, i) => (
              <li key={i}>
                <Link
                  to={`/${link.toLowerCase().replace(" ", "")}`}
                  className="hover:text-amber hover:border-b hover:border-amber transition-all duration-200 pb-1 inline-block"
                >
                  {link}
                </Link>
              </li>
            ))} */}
            <li><a href="Home" className="text-white transition-colors duration-200 hover:text-amber">Home</a></li>
            <li><a href="about" className="text-white transition-colors duration-200 hover:text-amber">About</a></li>
            <li><a href="pricing" className="text-white transition-colors duration-200 hover:text-amber">Pricing</a></li>
            <li><a href="faq" className="text-white transition-colors duration-200 hover:text-amber">FAQ</a></li>
            <li><a href="login" className="text-white transition-colors duration-200 hover:text-amber">Login</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold text-amber mb-4">
            Connect with us
          </h3>
          <div className="flex space-x-5 text-xl text-gray-300">
            <a
              href="#Home"
              className="hover:text-amber hover:scale-110 transition duration-300"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="hover:text-amber hover:scale-110 transition duration-300"
            >
              <FaInstagram />
            </a>
            <a
              href="mailto:team@lingobud.com"
              className="hover:text-amber hover:scale-110 transition duration-300"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} LingoBud. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
