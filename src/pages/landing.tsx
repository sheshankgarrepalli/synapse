import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add actual waitlist API call
    setSubmitted(true);
  };

  return (
    <>
      <Head>
        <title>Synapse - AI-Powered Work Intelligence for Product Teams</title>
        <meta
          name="description"
          content="Automatically connect Figma, GitHub, Linear, and Slack. Detect design-code drift, identify bottlenecks, and get AI-powered insights—no manual work required."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A1F28] to-[#0F1419]">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-[#0F1419]/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <span className="text-2xl font-bold text-white">Synapse</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/demo">
                  <Button variant="outline" size="sm">
                    View Demo
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                The future of product workflow intelligence
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Stop Manually Tracking.
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Start Flowing.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Synapse automatically connects your Figma designs, GitHub code, Linear tasks, and Slack
              conversations—detecting drift, finding bottlenecks, and surfacing insights you never knew existed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/onboarding">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <PlayCircleIcon className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-transparent to-transparent z-10" />
            <div className="rounded-2xl border-2 border-gray-800 bg-[#1A1F28] p-2 shadow-2xl">
              <div className="bg-[#0F1419] rounded-xl border border-gray-800 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-3">
                    <div className="h-4 bg-primary/20 rounded w-3/4" />
                    <div className="h-16 bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-green-500/20 rounded w-3/4" />
                    <div className="h-16 bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-blue-500/20 rounded w-3/4" />
                    <div className="h-16 bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-500 mb-8">Trusted by product teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <div className="text-2xl font-bold text-gray-600">Company A</div>
            <div className="text-2xl font-bold text-gray-600">Company B</div>
            <div className="text-2xl font-bold text-gray-600">Company C</div>
            <div className="text-2xl font-bold text-gray-600">Company D</div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need, Automatically
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No manual linking. No context switching. Just pure, intelligent workflow automation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: SparklesIcon,
                title: 'AI-Powered Detection',
                description:
                  'Automatically detect relationships between designs, code, and tasks using advanced AI—no manual tagging required.',
                color: 'bg-purple-500',
              },
              {
                icon: BoltIcon,
                title: 'Design-Code Drift Alerts',
                description:
                  'Get instant notifications when your Figma designs drift from implementation, down to individual CSS properties.',
                color: 'bg-orange-500',
              },
              {
                icon: ChartBarIcon,
                title: 'Golden Threads',
                description:
                  'See the complete story: from initial design to final deployment, all connections automatically mapped.',
                color: 'bg-blue-500',
              },
              {
                icon: CheckCircleIcon,
                title: 'Bottleneck Detection',
                description:
                  'AI identifies stalled work, blocked PRs, and process inefficiencies before they become problems.',
                color: 'bg-green-500',
              },
              {
                icon: SparklesIcon,
                title: 'Semantic Search',
                description:
                  'Search across all your tools using natural language. Find that design, PR, or conversation instantly.',
                color: 'bg-yellow-500',
              },
              {
                icon: ChartBarIcon,
                title: 'Team Intelligence',
                description:
                  'Get AI-generated insights about velocity, collaboration patterns, and workflow health.',
                color: 'bg-pink-500',
              },
            ].map((feature, idx) => (
              <Card key={idx} hover className="border-gray-800">
                <CardContent className="pt-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                The Problem: Manual Workflow Hell
              </h2>
              <div className="space-y-4 text-gray-400">
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Manually cross-referencing Figma, GitHub, Linear, and Slack
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Design-code drift discovered weeks after implementation
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Hours wasted searching for context across tools
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Bottlenecks and blocked work invisible until standup
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Zero visibility into end-to-end feature lifecycle
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                The Solution: Automatic Intelligence
              </h2>
              <div className="space-y-4 text-gray-400">
                <p className="flex items-start">
                  <CheckCircleIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                  AI automatically links designs, code, tasks, and discussions
                </p>
                <p className="flex items-start">
                  <CheckCircleIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                  Real-time drift detection with visual comparisons
                </p>
                <p className="flex items-start">
                  <CheckCircleIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                  Instant semantic search across all your tools
                </p>
                <p className="flex items-start">
                  <CheckCircleIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                  Proactive alerts for stalled work and blockers
                </p>
                <p className="flex items-start">
                  <CheckCircleIcon className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                  Complete feature timeline from design to deployment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Works With Your Stack
            </h2>
            <p className="text-xl text-gray-400">
              2-click OAuth integration. Start seeing value in minutes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-5 max-w-4xl mx-auto">
            {[
              { name: 'Figma', icon: '🎨', desc: 'Designs' },
              { name: 'GitHub', icon: '💻', desc: 'Code' },
              { name: 'Linear', icon: '📋', desc: 'Issues' },
              { name: 'Slack', icon: '💬', desc: 'Chat' },
              { name: 'Zoom', icon: '🎥', desc: 'Meetings' },
            ].map((integration) => (
              <Card key={integration.name} hover className="border-gray-800">
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl mb-3">{integration.icon}</div>
                  <h3 className="font-semibold text-white">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-12 text-gray-500">
            More integrations coming soon: Notion, Jira, Confluence, Asana
          </p>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by Product Teams
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                quote:
                  'Synapse cut our design-to-dev handoff time in half. We catch drift before it ships now.',
                author: 'Sarah Chen',
                role: 'Product Designer',
                company: 'TechCo',
              },
              {
                quote:
                  'Finally, I can see the full picture without asking 5 people. This is a game-changer.',
                author: 'Mike Rodriguez',
                role: 'Engineering Manager',
                company: 'StartupXYZ',
              },
              {
                quote:
                  'The AI relationship detection is scary good. It finds connections I would have never noticed.',
                author: 'Emma Watson',
                role: 'Product Manager',
                company: 'SaaS Inc',
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-gray-300 mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Stop Manual Tracking?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join the waitlist to get early access and exclusive founding member pricing.
              </p>

              {!submitted ? (
                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your work email"
                      required
                      className="flex-1"
                    />
                    <Button type="submit" size="lg">
                      Join Waitlist
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    4,000+ teams already on the waitlist
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
                    <p className="text-gray-400">
                      We'll email you as soon as spots open up. Check your inbox for a confirmation.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                  <span className="text-xl font-bold text-white">Synapse</span>
                </div>
                <p className="text-sm text-gray-500">
                  AI-powered work intelligence for modern product teams.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Integrations</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Demo</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              © 2025 Synapse. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
