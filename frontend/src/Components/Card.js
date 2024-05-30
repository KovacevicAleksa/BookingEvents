/* eslint-disable jsx-a11y/anchor-has-content */
function Card(props) {
  return (
    <div class="rounded overflow-hidden shadow-lg flex flex-col ">
      <a href="/src"></a>
      <div class="relative">
        <a href="/api">
          <img
            class="w-full"
            src="https://images.pexels.com/photos/61180/pexels-photo-61180.jpeg?auto=compress&amp;cs=tinysrgb&amp;dpr=1&amp;w=500"
            alt="Sunset in the mountains"
          ></img>
          <div class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
        </a>
        <a href="#!">
          <div class="text-xs absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            Cooking
          </div>
        </a>
      </div>
      <div class="px-6 py-4 mb-auto">
        <a
          href="/api"
          class="font-medium text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out mb-2"
        >
          Simplest Salad Recipe ever
        </a>
        <li>
          <input type="checkbox" value={30} />
          <span>
            {30 + " "}
            {"Deskripcija"}
          </span>
          <button>❌</button>
        </li>
      </div>
      <div class="px-6 py-3 flex flex-row items-center justify-between bg-gray-100">
        <span
          href="#"
          class="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center"
        >
          <span class="ml-1">Belgrade,Serbia</span>
        </span>
      </div>
    </div>
  );
}
export default Card;
