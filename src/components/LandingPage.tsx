import React, { useEffect, useState } from 'react'
import { sendToN8nWebhook, analyzeComparison } from '../config/webhooks'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'

interface LandingPageProps {
  onLogin: () => void
  onSignup: () => void
  onPricing: () => void
  isAuthenticated?: boolean
  onGoDashboard?: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onPricing, isAuthenticated = false, onGoDashboard }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoTab, setDemoTab] = useState<'ai' | 'comparison'>('ai')
  const [demoUrl, setDemoUrl] = useState('')
  const [demoCompetitorUrl, setDemoCompetitorUrl] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [demoUsedAI, setDemoUsedAI] = useState<boolean>(false)
  const [demoUsedCMP, setDemoUsedCMP] = useState<boolean>(false)
  const [demoAIResult, setDemoAIResult] = useState<any>(null)
  const [demoCMPResult, setDemoCMPResult] = useState<any>(null)
  const [localAuth, setLocalAuth] = useState<boolean>(!!isAuthenticated)

  // لم نعد نعتمد على Supabase Auth

  useEffect(() => { setLocalAuth(prev => prev || !!isAuthenticated) }, [isAuthenticated])

  // تحويل إجباري صامت من الهوم إلى الداشبورد إذا المستخدم مصدّق بالفعل
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rankora-auth-token')
      if (raw && window.location.pathname === '/' && localAuth) {
        window.location.replace('/dashboard')
      }
    } catch {}
  }, [localAuth])

  useEffect(() => {
    try {
      const ai = localStorage.getItem('rankora_guest_ai_trial_used') === '1'
      const cmp = localStorage.getItem('rankora_guest_cmp_trial_used') === '1'
      setDemoUsedAI(ai)
      setDemoUsedCMP(cmp)
    } catch {}
  }, [])

  // قفل تمرير الصفحة عند فتح المودال
  useEffect(() => {
    try {
      if (showDemo) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    } catch {}
    return () => {
      try { document.body.style.overflow = ''; } catch {}
    }
  }, [showDemo])

  const runGuestAI = async () => {
    if (demoUsedAI) {
      setDemoError('Your free demo analysis was used. Sign up to get 2 more each month.')
      return
    }
    if (!demoUrl.trim()) {
      setDemoError('Please enter a valid URL')
      return
    }
    setDemoLoading(true)
    setDemoError(null)
    setDemoAIResult(null)
    try {
      const res = await sendToN8nWebhook({ keyword: 'analysis', userUrl: demoUrl.trim() })
      if (!res?.success) throw new Error(res?.error || 'Analysis failed')
      const payload: any = res.data
      const raw = Array.isArray(payload) ? (payload[0] || {}) : (payload || {})
      const toNumber = (v: any) => {
        const n = typeof v === 'string' ? parseFloat(v) : Number(v)
        return Number.isFinite(n) ? n : 0
      }
      const finalResult = {
        readability: toNumber(raw.readability),
        factuality: toNumber(raw.factuality),
        structure: toNumber(raw.structure),
        qa_format: toNumber(raw.qa_format),
        structured_data: toNumber(raw.structured_data),
        authority: toNumber(raw.authority),
        suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : []
      }
      const hasScores = [finalResult.readability, finalResult.factuality, finalResult.structure, finalResult.qa_format, finalResult.structured_data, finalResult.authority].some(v => v > 0)
      if (!hasScores) throw new Error('No scores returned from webhook')
      setDemoAIResult(finalResult)
      try { localStorage.setItem('rankora_guest_ai_trial_used', '1'); setDemoUsedAI(true) } catch {}
    } catch (e: any) {
      setDemoError(e?.message || 'Failed to analyze')
    } finally {
      setDemoLoading(false)
    }
  }

  const runGuestComparison = async () => {
    if (demoUsedCMP) {
      setDemoError('Your free demo comparison was used. Sign up to get 2 more each month.')
      return
    }
    if (!demoUrl.trim() || !demoCompetitorUrl.trim()) {
      setDemoError('Please enter both URLs')
      return
    }
    setDemoLoading(true)
    setDemoError(null)
    setDemoCMPResult(null)
    try {
      const res = await analyzeComparison({ userUrl: demoUrl.trim(), competitorUrl: demoCompetitorUrl.trim() })
      if (!res?.success) throw new Error(res?.error || 'Comparison failed')
      let payload: any = res.data || {}
      if (payload?.data) payload = payload.data
      if (payload?.result) payload = payload.result
      if (payload?.response) payload = payload.response
      let user: any, competitor: any, suggestions: string[] = [], quickWins: string[] = []
      const pickNum = (v: any) => {
        const n = typeof v === 'string' ? parseFloat(v) : Number(v)
        return Number.isFinite(n) ? n : 0
      }
      const norm = (o: any) => ({
        readability: pickNum(o?.readability),
        factuality: pickNum(o?.factuality),
        structure: pickNum(o?.structure),
        qa_format: pickNum(o?.qa_format),
        structured_data: pickNum(o?.structured_data),
        authority: pickNum(o?.authority)
      })
      if (Array.isArray(payload) && payload[0]) {
        const first = payload[0]
        user = first['User Analysis'] || first.user_analysis || first.user
        competitor = first['Competitor Analysis'] || first.competitor_analysis || first.competitor
        suggestions = Array.isArray(first.competitive_suggestions) ? first.competitive_suggestions : []
        quickWins = Array.isArray(first.quick_wins) ? first.quick_wins : []
      } else if (payload?.user && payload?.competitor) {
        user = payload.user; competitor = payload.competitor
        suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : []
      }
      const userN = norm(user || {})
      const compN = norm(competitor || {})
      const valid = [userN.readability, userN.factuality, userN.structure, userN.qa_format, userN.structured_data, userN.authority].some(v => v > 0)
        && [compN.readability, compN.factuality, compN.structure, compN.qa_format, compN.structured_data, compN.authority].some(v => v > 0)
      if (!valid) throw new Error('Invalid comparison data')
      setDemoCMPResult({ user: userN, competitor: compN, suggestions, quickWins })
      try { localStorage.setItem('rankora_guest_cmp_trial_used', '1'); setDemoUsedCMP(true) } catch {}
    } catch (e: any) {
      setDemoError(e?.message || 'Failed to compare')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 relative">
      {/* Enhanced Star Field Background with Movement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Softer emerald auras */}
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="absolute bottom-[-8rem] right-[-8rem] w-[38rem] h-[38rem] bg-emerald-400/5 blur-3xl rounded-full" />
        {/* Subtle gradient grid overlay */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      </div>

      {/* Add floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.2; }
        }
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(16,185,129,0.04); }
        }
        @keyframes borderPan {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes barGrow {
          0% { width: 0%; }
          100% { width: var(--w, 100%); }
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-slate-900/70 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-8" src="/logo32.png" alt="Rankora" />
                <span className="ml-2 text-xl font-bold text-white">Rankora</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200 rounded-md hover:bg-white/5">
                Features
              </a>
              <button 
                onClick={onPricing}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200 rounded-md hover:bg-white/5"
              >
                Pricing
              </button>
              <a href="#faq" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200 rounded-md hover:bg-white/5">
                FAQ
              </a>
              {localAuth ? (
                <a
                  href="/dashboard"
                  onClick={onGoDashboard}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition duration-200 shadow-lg shadow-emerald-500/20"
                >
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                    Login
                  </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition duration-200 shadow-lg shadow-emerald-500/20">
                    Sign Up Free
                  </button>
                  </SignUpButton>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none transition duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-700/50 py-4">
              <div className="flex flex-col space-y-2">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                  Features
                </a>
                <button 
                  onClick={onPricing}
                  className="text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200"
                >
                  Pricing
                </button>
                <a href="#faq" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                  FAQ
                </a>
                {localAuth ? (
                  <a
                    href="/dashboard"
                    onClick={onGoDashboard}
                    className="text-left bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition duration-200 mx-3 shadow-lg shadow-emerald-500/20"
                  >
                    Go to Dashboard
                  </a>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                      Login
                    </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="text-left bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition duration-200 mx-3 shadow-lg shadow-emerald-500/20">
                      Sign Up Free
                    </button>
                    </SignUpButton>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Transform Your Ideas Into Ranked Success
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
              Rankora helps you rank, compare, and analyze anything with powerful AI-driven insights. 
              Make data-driven decisions with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {localAuth ? (
                <a
                  href="/dashboard"
                  onClick={onGoDashboard}
                  className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition duration-200"
                >
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition duration-200 shadow-lg shadow-emerald-500/20"
                    aria-label="Try a live demo without signup"
                    style={{animation: 'pulseSoft 9s ease-in-out infinite'}}
                  >
                    Try Live Demo (No Signup)
                  </button>
                  <SignUpButton mode="modal">
                    <button className="w-full sm:w-auto border border-white/15 text-gray-100 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 transition duration-200">
                    Start Ranking Free
                  </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="w-full sm:w-auto border border-white/10 text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 transition duration-200">
                    Sign In
                  </button>
                  </SignInButton>
                </>
              )}
            </div>

            {/* Demo value proposition under CTAs */}
            <p className="mt-4 text-sm text-emerald-200/90">
              Analyze a real article instantly and see live scores — no account needed.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-white/5 text-gray-300 border border-white/10">✨ No credit card required</span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-white/5 text-gray-300 border border-white/10">🚀 Get started in 30s</span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-white/5 text-gray-300 border border-white/10">🔒 100% secure</span>
            </div>
          </div>
          {/* Product preview card */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2 transition-all duration-300 hover:border-emerald-500/20 hover:-translate-y-0.5" style={{animation: 'floatSoft 18s ease-in-out infinite'}}>
              <div className="rounded-xl bg-slate-900/60 p-4">
                {/* faux window controls */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-400/70"/>
                  <span className="w-3 h-3 rounded-full bg-yellow-400/70"/>
                  <span className="w-3 h-3 rounded-full bg-green-400/70"/>
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-lg border border-white/10 bg-slate-950/40 p-4">
                    <div className="h-64 sm:h-80 w-full rounded-md bg-slate-950/60 flex items-center justify-center">
                      <div className="text-left max-w-md">
                        <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">AI Overview Analyzer</p>
                        <h3 className="text-white text-2xl sm:text-3xl font-bold mt-2">See instant scores and opportunities</h3>
                        <ul className="mt-4 space-y-2 text-gray-300 text-sm list-disc list-inside">
                          <li>6 core metrics with clear scoring</li>
                          <li>Actionable suggestions and quick wins</li>
                          <li>One-click save to projects</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-white font-semibold mb-2">Why Rankora?</p>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-start gap-2"><span className="text-emerald-400">✔</span> Battle‑tested workflows with strict CSP & security</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-400">✔</span> Reliable usage limits and project saving</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-400">✔</span> Beautiful, fast, and intuitive UI</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal - Responsive */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowDemo(false)} />
          <div className="relative w-full max-w-4xl lg:max-w-6xl rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-h-[95vh] sm:max-h-[88vh] overflow-hidden animate-scaleIn">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
              <h3 className="text-white text-base sm:text-lg font-semibold">Live Demo — Sample Analysis</h3>
              <button onClick={() => setShowDemo(false)} className="text-gray-300 hover:text-white text-lg" aria-label="Close demo">
                ✕
              </button>
            </div>
            <div className="p-3 sm:p-5 overflow-auto max-h-[calc(95vh-48px)] sm:max-h-[calc(88vh-56px)]">
              {/* Tabs */}
              <div className="mb-5 inline-flex rounded-xl border border-white/10 bg-slate-950/50 p-1 shadow-inner">
                <button onClick={() => setDemoTab('ai')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${demoTab==='ai'?'bg-emerald-500 text-white shadow':'text-gray-300 hover:text-white hover:bg-white/5'}`}>AI Analyzer</button>
                <button onClick={() => setDemoTab('comparison')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${demoTab==='comparison'?'bg-emerald-500 text-white shadow':'text-gray-300 hover:text-white hover:bg-white/5'}`}>Comparison</button>
              </div>

              {demoError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-sm">{demoError}</div>
              )}

              {demoTab === 'ai' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                  <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 shadow">
                    <div className="flex flex-col gap-2 sm:gap-2 mb-4">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="https://example.com/article" value={demoUrl} onChange={(e)=>setDemoUrl(e.target.value)} />
                      <button onClick={runGuestAI} disabled={demoLoading} className="px-4 sm:px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 shadow">{demoLoading?'Running...':'Run Demo'}</button>
                    </div>
                    {demoAIResult ? (
                      <>
                        {/* Overall score badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">AI Analyzer Result</p>
                            <h4 className="text-white text-lg font-bold mt-1">Live Scores</h4>
                          </div>
                          {(() => {
                            const avg = Math.round(((demoAIResult.readability||0)+(demoAIResult.factuality||0)+(demoAIResult.structure||0)+(demoAIResult.qa_format||0)+(demoAIResult.structured_data||0)+(demoAIResult.authority||0))/6);
                            return (
                              <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#10b981 ${avg*3.6}deg, rgba(255,255,255,0.08) 0deg)` }} />
                                <div className="absolute inset-[6px] rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">{avg}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {[
                            { label: 'Readability', score: demoAIResult.readability },
                            { label: 'Factuality', score: demoAIResult.factuality },
                            { label: 'Structure', score: demoAIResult.structure },
                            { label: 'Q&A Format', score: demoAIResult.qa_format },
                            { label: 'Structured Data', score: demoAIResult.structured_data },
                            { label: 'Authority', score: demoAIResult.authority }
                          ].map((m:any) => (
                            <div key={m.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-3 sm:p-4 hover:border-emerald-400/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-300 text-xs sm:text-sm">{m.label}</p>
                                <span className="text-white font-semibold text-sm sm:text-base">{m.score}</span>
                              </div>
                              <div className="h-2 sm:h-2.5 rounded bg-white/10 overflow-hidden">
                                <div className="h-2 sm:h-2.5 rounded bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${m.score}%`, ['--w' as any]: `${m.score}%`, animation: 'barGrow 900ms ease-out 100ms both' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {Array.isArray(demoAIResult.suggestions) && demoAIResult.suggestions.length>0 && (
                          <div className="mt-4 sm:mt-6">
                            <p className="text-white font-semibold mb-2 text-sm sm:text-base">Suggestions</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {demoAIResult.suggestions.slice(0,6).map((s:string, idx:number)=>(
                                <div key={idx} className="p-2 sm:p-3 rounded-lg border border-white/10 bg-slate-900/70 text-gray-300 text-xs sm:text-sm">
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm">Enter a URL and run the demo to see real results.</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 shadow">
                    <p className="text-white font-semibold mb-2 text-sm sm:text-base">No account needed</p>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">Try one full AI analysis now. To save results and get 2 more this month, sign up free.</p>
                    <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                      <SignUpButton mode="modal"><button className="w-full bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600">Sign up free</button></SignUpButton>
                      <SignInButton mode="modal"><button className="w-full border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/5">Sign in</button></SignInButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                  <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 shadow">
                    <div className="flex flex-col gap-2 mb-4">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="https://your-url.com" value={demoUrl} onChange={(e)=>setDemoUrl(e.target.value)} />
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="https://competitor.com" value={demoCompetitorUrl} onChange={(e)=>setDemoCompetitorUrl(e.target.value)} />
                      <button onClick={runGuestComparison} disabled={demoLoading} className="px-4 sm:px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 shadow">{demoLoading?'Running...':'Run Demo'}</button>
                    </div>
                    {demoCMPResult ? (
                      <>
                        {/* Top summary badges */}
                        {(() => {
                          const a = demoCMPResult.user; const b = demoCMPResult.competitor;
                          const avgA = Math.round(((a.readability||0)+(a.factuality||0)+(a.structure||0)+(a.qa_format||0)+(a.structured_data||0)+(a.authority||0))/6);
                          const avgB = Math.round(((b.readability||0)+(b.factuality||0)+(b.structure||0)+(b.qa_format||0)+(b.structured_data||0)+(b.authority||0))/6);
                          return (
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex items-center justify-between">
                                <div>
                                  <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Your Article</p>
                                  <p className="text-gray-300 text-sm">Overall Readiness</p>
                                </div>
                                <div className="relative w-16 h-16">
                                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#10b981 ${avgA*3.6}deg, rgba(255,255,255,0.08) 0deg)` }} />
                                  <div className="absolute inset-[6px] rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{avgA}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex items-center justify-between">
                                <div>
                                  <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Competitor</p>
                                  <p className="text-gray-300 text-sm">Overall Readiness</p>
                                </div>
                                <div className="relative w-16 h-16">
                                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#60a5fa ${avgB*3.6}deg, rgba(255,255,255,0.08) 0deg)` }} />
                                  <div className="absolute inset-[6px] rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{avgB}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {[
                            { label: 'Readability', yours: demoCMPResult.user.readability, comp: demoCMPResult.competitor.readability },
                            { label: 'Factuality', yours: demoCMPResult.user.factuality, comp: demoCMPResult.competitor.factuality },
                            { label: 'Structure', yours: demoCMPResult.user.structure, comp: demoCMPResult.competitor.structure },
                            { label: 'Q&A Format', yours: demoCMPResult.user.qa_format, comp: demoCMPResult.competitor.qa_format },
                            { label: 'Structured Data', yours: demoCMPResult.user.structured_data, comp: demoCMPResult.competitor.structured_data },
                            { label: 'Authority', yours: demoCMPResult.user.authority, comp: demoCMPResult.competitor.authority }
                          ].map((m:any) => (
                            <div key={m.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-3 sm:p-4 hover:border-emerald-400/30 transition">
                              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                                <p className="text-gray-300">{m.label}</p>
                                <span className="text-white font-semibold">{m.yours} vs {m.comp}</span>
                              </div>
                              <div className="h-2 sm:h-2.5 rounded bg-white/10 overflow-hidden">
                                <div className="h-2 sm:h-2.5 rounded bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${Math.min(100, m.yours)}%`, ['--w' as any]: `${Math.min(100, m.yours)}%`, animation: 'barGrow 900ms ease-out 100ms both' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {(Array.isArray(demoCMPResult.suggestions) && demoCMPResult.suggestions.length>0) && (
                          <div className="mt-4 sm:mt-6">
                            <p className="text-white font-semibold mb-2 text-sm sm:text-base">Suggestions</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {demoCMPResult.suggestions.slice(0,6).map((s:string, idx:number)=>(
                                <div key={idx} className="p-2 sm:p-3 rounded-lg border border-white/10 bg-slate-900/70 text-gray-300 text-xs sm:text-sm">
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm">Enter two URLs and run the demo to see real comparison.</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 shadow">
                    <p className="text-white font-semibold mb-2 text-sm sm:text-base">One free comparison</p>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">Try one URL vs competitor now. To save and unlock 2 more comparisons this month, sign up free.</p>
                    <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                      <SignUpButton mode="modal"><button className="w-full bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600">Sign up free</button></SignUpButton>
                      <SignInButton mode="modal"><button className="w-full border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/5">Sign in</button></SignInButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* subtle divider */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* How it works (no fake stats) */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 hover:border-emerald-500/30 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Step 1</p>
              <p className="text-white font-semibold mt-2">Paste your URL or keyword</p>
              <p className="text-gray-300 text-sm mt-2">We fetch, parse, and validate your content securely.</p>
            </div>
            <div className="rounded-2xl border border-white/10 hover:border-emerald-500/30 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Step 2</p>
              <p className="text-white font-semibold mt-2">AI analyzes what matters</p>
              <p className="text-gray-300 text-sm mt-2">Signals, gaps, entities, and opportunities.</p>
            </div>
            <div className="rounded-2xl border border-white/10 hover:border-emerald-500/30 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Step 3</p>
              <p className="text-white font-semibold mt-2">Save to projects</p>
              <p className="text-gray-300 text-sm mt-2">Track progress, compare, and share with your team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Removed testimonials to avoid fake content */}
      {/* Removed social proof with fake brand names */}

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features for Smart Ranking
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to rank, compare, and analyze with precision and intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Smart Ranking</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                AI-powered ranking algorithms that understand context and deliver meaningful results.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Deep insights and analytics to understand patterns and make informed decisions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Lightning Fast</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Get results in seconds, not minutes. Optimized for speed and performance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-emerald-400/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Custom Criteria</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Define your own ranking criteria and weights to match your specific needs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-emerald-400/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Team Collaboration</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Work together with your team to create and refine rankings collaboratively.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-red-400/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-400/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Enterprise Security</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Bank-level security with encryption, audit logs, and compliance standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about Rankora and AI Overviews optimization
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Do I need to sign up to try it?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                No, you can run a live demo instantly without an account. Sign up only if you want to save results or run full analyses.
              </p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                What is Rankora and how does it work?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Rankora is an AI-powered content analysis tool that helps optimize your content for Google's AI Overviews. It analyzes your articles across 6 key metrics: readability, factuality, structure, Q&A format, structured data, and authority.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                How accurate are the analysis results?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Our AI analysis has a 98% accuracy rate, trained on thousands of successful AI Overview snippets. We continuously update our algorithms based on Google's latest AI Overview patterns and ranking factors.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                What's included in the Free plan?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                The Free plan includes 2 content analyses per month, basic scoring across all 6 metrics, general improvement suggestions, and email support. Perfect for testing our platform.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                How does the competitor comparison feature work?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Our competitor comparison tool analyzes both your content and a competitor's content side-by-side across all metrics, providing detailed insights and AI-generated strategies.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Is my data secure and private?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Absolutely. We use enterprise-grade security measures to protect your data. We don't store your content permanently, and we never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500/80 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">
            Ready to Start Ranking?
          </h2>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 sm:mb-12">
            Join thousands of users who trust Rankora for their ranking and analysis needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition duration-200 shadow-lg">
              Get Started Free
            </button>
            </SignUpButton>
            <button
              onClick={onPricing}
              className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white hover:text-emerald-600 transition duration-200"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Responsive */}
      <footer className="bg-secondary border-t border-gray-700/50 text-white py-8 sm:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-3 sm:mb-4">
                <img className="h-6 w-6 sm:h-8 sm:w-8" src="/logo32.png" alt="Rankora" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Rankora</span>
              </div>
              <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                Transform your ideas into ranked success with AI-powered ranking and analysis tools.
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                <span>Contact:</span>
                <a href="mailto:contact@rankora.online" className="hover:text-emerald-400 transition duration-200">contact@rankora.online</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li><a href="#features" className="hover:text-emerald-400 transition duration-200">Features</a></li>
                <li><button onClick={onPricing} className="hover:text-emerald-400 transition duration-200">Pricing</button></li>
                <li><a href="#faq" className="hover:text-emerald-400 transition duration-200">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account</h3>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li><SignInButton mode="modal"><button className="hover:text-emerald-400 transition duration-200">Login</button></SignInButton></li>
                <li><SignUpButton mode="modal"><button className="hover:text-emerald-400 transition duration-200">Sign Up</button></SignUpButton></li>
                <li><a href="/terms" className="hover:text-emerald-400 transition duration-200">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-emerald-400 transition duration-200">Data Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; 2025 Rankora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
