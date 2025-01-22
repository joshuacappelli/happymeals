import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col  font-[family-name:var(--font-geist-sans)] text-coalblack">
      {/* Header Section */}
      <header className="px-20 w-full flex items-center justify-between">
        <div className="bg-offwhite flex flex-row items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Happy Meals</h1>
        </div>
        <div>
          <Link
            className="text-base sm:text-lg hover:text-crimson transition-colors duration-300"
            href="https://happymeals.com/discover"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discover
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-6 py-12 sm:px-12 sm:py-16 bg-gradient-to-br from-white via-offwhite to-white">
        <div className="max-w-2xl flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
            What You Want, When You Want It
          </h2>
          <p className="text-base sm:text-lg mb-6 leading-relaxed">
            Happy Meals is an innovative app that leverages AI technology to help users find and book the perfect restaurant tailored to their preferences. Whether you’re in the mood for a cozy café or a fine dining experience, Happy Meals makes dining out effortless and enjoyable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              className="rounded-full border border-transparent transition-all flex items-center justify-center bg-crimson text-offwhite gap-2 hover:bg-[#ffcccc] hover:scale-105 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5  hover:shadow-md"
              href="https://happymeals.com/download"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discover more
            </a>
            <a
              className="rounded-full border border-crimson transition-all flex items-center justify-center hover:bg-[#ffcccc] hover:scale-105 hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 shadow hover:shadow-md"
              href="https://happymeals.com/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the Docs
            </a>
          </div>

          <div className=" p-4 rounded-lg flex items-center gap-3 w-96">
          <input
            type="text"
            placeholder="Explore"
            className="flex-grow border border-gray-300 rounded-full px-4 py-2 hover:border-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <button className="bg-gray-300   text-white p-2 rounded-full hover:bg-gray-400 transition-colors duration-300 focus:ring-2 focus:ring-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-offwhite p-4 flex items-center justify-center">
        <a
          className="text-gray-600 hover:text-crimson transition-colors duration-300"
          href="#"
        >
          About Me
        </a>
      </footer>
    </div>
  );
}
