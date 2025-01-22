import Link from "next/link";
import SearchBar from "@/components/form/searchbar";

export default function Home() {
  return (
    <div className=" flex flex-col  font-[family-name:var(--font-geist-sans)] text-coalblack">
      {/* Header Section */}
      <header className="px-20 w-full flex items-center justify-between">
        <div className="bg-offwhite flex flex-row items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Happy Meals</h1>
        </div>
        <div>
          <Link
            className="text-base sm:text-lg hover:text-crimson transition-colors duration-300"
            href="/discover"
          >
            Discover
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full h-full flex flex-col items-center justify-center px-6 py-12 sm:px-12 sm:py-16 bg-gradient-to-br from-white via-offwhite to-white">
        <div className="max-w-2xl flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            What You Want, When You Want It
          </h2>
          <p className="text-base sm:text-lg mb-8 leading-relaxed">
            Happy Meals is an innovative app that leverages AI technology to help users find and book the perfect restaurant tailored to their preferences. Whether you’re in the mood for a cozy café or a fine dining experience, Happy Meals makes dining out effortless and enjoyable.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center mb-8">
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

          <SearchBar />
        </div>
      </main>

      
    </div>
  );
}
