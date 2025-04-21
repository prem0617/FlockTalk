"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFeatherAlt, FaSearch, FaBell, FaEnvelope } from "react-icons/fa";

function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="sticky top-0 left-0 z-50 bg-base-100 shadow-md border-b border-base-200">
      <div className="navbar container mx-auto px-4 py-2">
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">
              <span className="flex items-center gap-2">
                FlockTalk
                <FaFeatherAlt className="w-5 h-5" />
              </span>
            </h1>
          </Link>
        </div>

        <div className="navbar-center">
          <div
            className={`relative w-full max-w-md transition-all duration-300 ${
              searchFocused ? "scale-105" : ""
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search FlockTalk"
                className="input input-bordered w-full pr-10 pl-4 py-2 rounded-full focus:outline-none focus:border-primary  transition-all duration-300"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaSearch className="h-5 w-5 text-base-content/50" />
              </div>
            </div>

            {searchFocused && (
              <div className="absolute mt-2 w-full bg-base-100 rounded-xl shadow-xl border border-base-200 p-3 z-10">
                <div className="text-sm text-base-content/70 mb-2">
                  Try searching for people, topics, or keywords
                </div>
                <div className="divider my-1"></div>
                <div className="text-primary text-sm hover:underline cursor-pointer">
                  Advanced search
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <FaBell className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <FaEnvelope className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <button className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="/avatar-placeholder.png" alt="User" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
