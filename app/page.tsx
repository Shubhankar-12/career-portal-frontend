import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Careers Builder</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-text-secondary hover:text-primary">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold">Build Beautiful Careers Pages</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Create stunning, branded careers pages in minutes. Attract top talent with a professional online presence.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register" className="btn-primary">
              Start Building
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="card">
            <h3 className="font-bold text-lg mb-3">Drag & Drop Builder</h3>
            <p className="text-text-secondary">
              Intuitive interface to create sections and customize layouts without coding.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold text-lg mb-3">Brand Customization</h3>
            <p className="text-text-secondary">Match your company colors and theme with our powerful color picker.</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-lg mb-3">Job Management</h3>
            <p className="text-text-secondary">Post, manage, and track open positions all in one place.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
