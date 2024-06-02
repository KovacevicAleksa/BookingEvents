function Header() {
  return (
    <div>
      <nav className="font-sans flex flex-col sm:flex-row sm:justify-center items-center py-4 px-6 bg-white shadow w-full">
        <div className="mb-2 sm:mb-0">
          <p
            className="text-center text-2xl no-underline text-grey-darkest
            hover:text-blue-dark"
          >
            Rezervacija dogadjaja
          </p>
        </div>
      </nav>
    </div>
  );
}

export default Header;
