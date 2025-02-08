import React from "react";

function AboutUs() {
  return (
    <div className="h-screen flex flex-col bg-gray-800 text-white">
      {/* Header Image */}
      <div className="relative h-2/3">
        <img
          className="w-full h-full object-cover"
          src="https://github.com/user-attachments/assets/f59f4fde-c4c6-4118-bf26-755064981064"
          alt="Our Team"
        />
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-3xl font-bold">About Us</h1>
          <p className="mt-2 text-lg">
            We are a passionate team dedicated to making the world a better place through technology and innovation.
          </p>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="flex-1 px-6 py-4">
        <h2 className="font-medium text-2xl text-green-400 mb-4">Our Mission</h2>
        <p className="text-gray-300 mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          vulputate ligula non nisi auctor, quis sagittis elit aliquet.
        </p>

        <h2 className="font-medium text-2xl text-green-400 mb-4">Our Vision</h2>
        <p className="text-gray-300">
          Fusce interdum elit et velit commodo, non fermentum massa eleifend.
          Aenean vel felis nec lorem fermentum consequat ut at lacus.
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-700 flex justify-center items-center">
        <span className="text-sm text-gray-400">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </span>
      </div>
    </div>
  );
}

export default AboutUs;
