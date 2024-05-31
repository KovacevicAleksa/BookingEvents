/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";

function Card(props) {
  const eventDate = new Date(props.date);
  const today = new Date();
  const isExpired = eventDate < today;

  const formattedDate = isExpired
    ? "Expired"
    : eventDate.toLocaleDateString("sr-Latn-RS", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="rounded overflow-hidden shadow-lg flex flex-col">
      <a href="/src"></a>
      <div className="relative">
        <a href="/api">
          <img
            className="w-full"
            src="https://images.pexels.com/photos/61180/pexels-photo-61180.jpeg?auto=compress&amp;cs=tinysrgb&amp;dpr=1&amp;w=500"
            alt="Sunset in the mountains"
          />
          <div className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
        </a>
        <a href="#!">
          <div className="text-l absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            {props.price}
          </div>
        </a>
      </div>
      <div className="px-6 py-4 mb-auto">
        <a
          href="/api"
          className="font-medium text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out mb-2"
        >
          {props.title}
        </a>
        <p>
          <span>{props.description}</span>
        </p>
      </div>
      <div className="px-6 py-3 flex flex-row items-center justify-between bg-gray-100">
        <span
          href="#"
          className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center"
        >
          <span className="ml-1">{props.location}</span>
        </span>
        <span className="mr-1">{formattedDate}</span>
      </div>
    </div>
  );
}

export default Card;
