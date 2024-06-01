function Header() {
  return (
    <div>
      <nav className="font-sans flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 bg-white shadow sm:items-baseline w-full">
        <div className="mb-2 sm:mb-0">
          <a
            href="http://localhost:8081"
            className="text-2xl no-underline text-grey-darkest hover:text-blue-dark"
          >
            Rezervacija dogadjaja
          </a>
        </div>
        <div>
          <a
            href="http://localhost:8081/api"
            className="text-lg no-underline text-grey-darkest hover:text-sky-700 ml-2"
          >
            Prijava
          </a>

          <a
            href="/api"
            className="text-lg no-underline text-grey-darkest hover:text-sky-700 ml-2 "
          >
            Napravite nalog
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Header;
