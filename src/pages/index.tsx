import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Redirect to dashboard if user is signed in
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is signed in by looking for Clerk session
      const signedIn = document.querySelector('[data-clerk-signed-in]');
      if (signedIn) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <>
      <Head>
        <title>Synapse - Design-Code Drift Detection</title>
        <meta
          name="description"
          content="Detect design-code drift between Figma and GitHub before shipping"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F28]">
        <div className="container mx-auto px-4 py-16">
          <SignedOut>
            <div className="flex min-h-screen flex-col items-center justify-center">
              <div className="mb-12 text-center">
                <h1 className="mb-4 text-6xl font-bold text-white">
                  Synapse
                </h1>
                <p className="text-xl text-gray-400">
                  Detect design-code drift between Figma and GitHub before shipping
                </p>
              </div>
              <SignIn routing="hash" afterSignInUrl="/dashboard" />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-between border-b border-gray-800 pb-6">
              <div>
                <h1 className="text-4xl font-bold text-white">Synapse</h1>
                <p className="mt-2 text-gray-400">
                  Design-Code Drift Detection Dashboard
                </p>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/intelligence"
                className="rounded-lg border-2 border-primary bg-[#1A1F28] p-6 transition-colors hover:bg-[#2D3748]"
              >
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-xl font-semibold text-white">
                    Intelligence Feed
                  </h3>
                </div>
                <p className="text-gray-400">
                  AI-powered insights and auto-detected relationships
                </p>
                <p className="mt-2 text-sm text-primary">← Start Here</p>
              </Link>

              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Dashboard
                </h3>
                <p className="text-gray-400">
                  View all drift watches and recent alerts
                </p>
              </Link>

              <Link
                href="/threads"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Threads
                </h3>
                <p className="text-gray-400">
                  Manage drift watches across Figma and GitHub
                </p>
              </Link>

              <Link
                href="/integrations"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Integrations
                </h3>
                <p className="text-gray-400">
                  Connect Figma, Linear, GitHub, and more
                </p>
              </Link>

              <Link
                href="/automations"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Automations
                </h3>
                <p className="text-gray-400">
                  Create workflows that run automatically
                </p>
              </Link>

              <Link
                href="/search"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Search
                </h3>
                <p className="text-gray-400">
                  AI-powered semantic search across all tools
                </p>
              </Link>

              <Link
                href="/settings"
                className="rounded-lg border border-gray-800 bg-[#1A1F28] p-6 transition-colors hover:border-primary hover:bg-[#2D3748]"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Settings
                </h3>
                <p className="text-gray-400">
                  Manage your organization and preferences
                </p>
              </Link>
            </div>
            {/* Redirecting to dashboard... */}
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Redirecting to dashboard...</h2>
              </div>
            </div>
          </SignedIn>
        </div>
      </main>
    </>
  );
}
