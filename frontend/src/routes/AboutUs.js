import React from "react";

function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-800 text-white">
      {/* Header Section */}
      <div className="relative h-[60vh]">
        <img
          className="w-full h-full object-cover rounded-b-3xl shadow-lg"
          src="https://github.com/user-attachments/assets/f59f4fde-c4c6-4118-bf26-755064981064"
          alt="Our Team"
        />
        <div className="absolute inset-0 bg-gray-900 opacity-60 rounded-b-3xl"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <h1 className="text-4xl font-extrabold mb-4 tracking-wide">About Us</h1>
          <p className="max-w-2xl text-lg text-gray-200 leading-relaxed">
            We are a passionate team dedicated to making the world a better place through technology and innovation.
          </p>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="flex-1 grid md:grid-cols-2 gap-8 px-8 py-12">
        <div className="bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-2xl font-semibold text-green-400 mb-3">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vulputate ligula non nisi auctor, quis sagittis elit aliquet.
          </p>
        </div>
        <div className="bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-2xl font-semibold text-green-400 mb-3">Our Vision</h2>
          <p className="text-gray-300 leading-relaxed">
            Fusce interdum elit et velit commodo, non fermentum massa eleifend. Aenean vel felis nec lorem fermentum consequat ut at lacus.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 bg-gray-700 text-center rounded-t-2xl">
        <span className="text-sm text-gray-400">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default AboutUs;