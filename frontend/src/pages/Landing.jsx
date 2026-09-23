import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TeamShowcase from '../components/ui/TeamShowcase'
import FacultyShowcase from '../components/ui/FacultyShowcase'
import { MorphingCardStack } from '../components/ui/morphing-card-stack'
import { AvailabilityCard } from '../components/ui/AvailabilityCard'
import { AmountSlider, AmountReadout } from '../components/ui/amount-slider'
import RulesSection from '../components/ui/RulesSection'
import { Map, ShoppingCart, Leaf, ShieldAlert, Navigation, MonitorPlay, Dna, FlaskConical, Shield, Boxes } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

/* ─────────────────────────────────────────────────────────────────────────────
   SVG Icons — replacing all emojis with clean SVG icons (matching reference)
───────────────────────────────────────────────────────────────────────────── */

// Dot-grid arrow icon exactly as seen in the reference track cards
const DotArrowIcon = ({ color = '#0b1120', bg = '#e8b840', size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" fill={bg} />
    {/* dot grid */}
    {[8,14,20,26].map(x => [8,14,20,26].map(y => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill={color} opacity={0.6} />
    )))}
    {/* arrow */}
    <path d="M13 23 L23 13 M17 13 H23 V19" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─────────────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Overview',           href: '#overview', color: '#4b6cf7', textColor: '#ffffff' },
  { label: 'Why join us?',       href: '#why',      color: '#e8b840', textColor: '#0b1120' },
  { label: 'Problem Statements', href: '#tracks',   color: '#e8631a', textColor: '#ffffff' },
  { label: 'Prizes',             href: '#prizes',   color: '#e2bfff', textColor: '#0b1120' },
  { label: 'Rules',              href: '#rules',    color: '#bbf7d0', textColor: '#0b1120' },
  { label: 'Team',               href: '#team',     color: '#fca5a5', textColor: '#0b1120' },
  { label: 'FAQ',                href: '#faq',      color: '#6366f1', textColor: '#ffffff' },
]

const TRACKS = [
  { name: 'Urban Mobility', keywords: 'Public transport, traffic, parking, ride-sharing, last-mile delivery, pedestrian safety, etc', color: '#4b6cf7', desc: 'Problem Statement: Enhancing Urban Commuting Efficiency and Non-Motorized Road User Safety\n\nRapid urbanization has intensified challenges in city transport systems, leading to severe bottlenecks in everyday mobility and rising safety concerns for non-motorized road users.\n\nCommuters in dense urban centers face major inefficiencies during daily travel, spending excess time and fuel navigating congested corridors and searching for available parking spaces. The lack of integrated, real-time mobility guidance prevents drivers from choosing optimal routes and parking solutions dynamically, worsening gridlock and increasing urban emissions.\n\nConcurrently, pedestrians and cyclists continue to experience high risks of conflict with vehicular traffic, particularly at unsignalled intersections, poorly illuminated stretches, and high-density crossing zones. Traditional static infrastructure often fails to provide timely warnings to drivers or vulnerable road users when safety hazards arise.' },
  { name: 'Smart Commerce', keywords: 'Retail, shopping, small businesses, payments, inventory, customer experience, local sellers, etc', color: '#e8b840', desc: 'Problem Statement: Empowering Small Retailers Through Digital Visibility and Automated Store Operations\n\nSmall and independent brick-and-mortar businesses face significant operational and competitive hurdles in an increasingly digitalized economy. While large enterprise retailers leverage automated systems and online ecosystems, local shop owners remain constrained by limited reach and manual, error-prone store management practices.\n\nNearby shoppers frequently lack real-time visibility into local product availability, leading them to rely on distant e-commerce platforms rather than supporting nearby merchants. This disconnect reduces foot traffic and revenue potential for neighbourhood stores. Simultaneously, inside the physical store, manual checkout processes slow down transaction times, lead to long wait times for customers, and expose retailers to inventory discrepancies and unrecorded shrinkage due to limited oversight.' },
  { name: 'Sustainable Resource Management', keywords: 'Water, energy, waste, forests, pollution, extreme weather, conservation, resource management, etc.', color: '#e8631a', desc: 'Problem Statement: Optimizing Local Resource Management for Environmental Sustainability through Continuous Monitoring and Behavioral Insights\n\nResidential spaces, educational campuses, and small enterprises often lack real-time visibility into their daily consumption of essential resources, particularly water, energy, and waste. Without centralized, actionable data, individuals and facility managers struggle to identify inefficiencies, understand consumption patterns, and implement targeted conservation measures.\n\nUnnoticed infrastructure failures, especially hidden water leaks across supply pipelines and distributed plumbing networks, can lead to significant and cumulative resource loss before they are detected manually. Traditional monitoring approaches often fail to identify abnormal consumption or flow patterns and provide timely alerts to stakeholders. As a result, leaks and other inefficiencies may continue unchecked, contributing to unnecessary resource wastage and environmental damage.\n\nThe proposed solution should leverage real-time monitoring, data analytics, and intelligent alerts to identify resource inefficiencies, encourage sustainable consumption practices, detect abnormal usage patterns, and support effective water, energy, and waste conservation.' },
  { name: 'Connected Communities', keywords: 'Neighborhoods, public services, local governance, emergency response, community engagement, accessibility, etc.', color: '#22c55e', desc: 'Problem Statement: Accelerating Emergency Response and Enhancing Safety Accessibility Across Communities\n\nDuring critical safety incidents and localized emergencies, residents in residential neighborhoods and public spaces face severe friction in initiating timely calls for help and obtaining actionable situational updates. Traditional reporting channels are often fragmented, causing delays in dispatching local authorities, coordinating nearby volunteers, and providing clear status updates to those affected.\n\nThe issue is further exacerbated for vulnerable demographics—such as children, senior citizens, and individuals with physical or cognitive disabilities—who may find navigating complex smartphone applications difficult or impossible during high-stress scenarios. When an emergency strikes, relying exclusively on app-based reporting excludes these groups from receiving rapid, accessible assistance.' },
  { name: 'Travel & Exploration', keywords: 'Tourism, navigation, hotels, cultural heritage, travel planning, local experiences, accessibility, safety, etc.', color: '#7c3aed', desc: 'Problem Statement: Enhancing Personalized Cultural Exploration and Belonging Security for Travelers\n\nTravelers visiting unfamiliar cities frequently struggle to curate cohesive, time-efficient itineraries that align with their specific personal interests. As a result, mainstream travel routes often overshadow lesser-known cultural, historical, and local heritage sites, leaving visitors with generic travel experiences and minimal contextual understanding of the destinations they explore.\n\nAt the same time, journey security remains a primary concern for both solo and group travelers. Mishandled luggage, misplaced personal belongings, and fear of property loss introduce significant stress and disruption to travel schedules. Relying on passive transit tracking or traditional manual checks leaves travelers vulnerable to property displacement without immediate awareness or dynamic location recovery options.' },
  { name: 'Entertainment & Creative World', keywords: 'Movies, music, gaming, content creation, sports entertainment, digital art, creators, events, etc.', color: '#3898ec', desc: 'Problem Statement: Streamlining Creator Workflows and Elevating In-Person Audience Engagement\n\nIndependent content creators across digital art, video, and audio domains are often overwhelmed by technical, administrative, and post-production tasks. Spending excessive effort on scripting, editing, and manual performance analysis diverts critical time and focus away from original artistic creation, limiting content output and potential growth.\n\nConcurrently, live entertainment venues—such as concerts, sports screenings, and university events—struggle to deliver dynamic, highly interactive experiences that fully engage modern audiences. Traditional event setups rely on static or centrally controlled environmental effects that fail to adapt responsively to real-time crowd energy, music variations, or physical participation, leaving live experiences feeling passive.' },
  { name: 'Bioinformatics', keywords: 'Genomics, proteomics, multi-omics, biomarker discovery, precision medicine, computational biology, drug discovery, biological networks, etc.', color: '#f59e0b', desc: 'Problem Statement: Accelerating Multi-Omics Data Integration and Predictive Biomarker Discovery for Precision Medicine\n\nModern biomedical research generates massive volumes of heterogeneous multi-omics data—including genomics, transcriptomics, proteomics, and metabolomics—across disparate repositories and formats. Researchers and clinical scientists struggle to effectively integrate these high-dimensional datasets to uncover meaningful biological insights due to high computational overhead, fragmented analysis pipelines, and a lack of unified, real-time visualization frameworks.\n\nConcurrently, identifying reliable disease-specific diagnostic or prognostic biomarkers remains a slow, error-prone manual process. Traditional computational models often suffer from overfitting and struggle to handle missing clinical or molecular variables, delaying the translation of raw sequencing data into actionable therapeutic targets or personalized treatment strategies.' },
  { name: 'Biotechnology', keywords: 'Bioprocessing, fermentation, metabolic engineering, bioreactors, synthetic biology, enzyme kinetics, bio-manufacturing, process optimization, etc.', color: '#84cc16', desc: 'Problem Statement: Optimizing Bioprocess Control and Real-Time Metabolic Monitoring for Sustainable Bio-Production\n\nIndustrial and laboratory-scale biomanufacturing processes—such as microbial fermentation, enzymatic synthesis, and cell culture growth—frequently suffer from suboptimal yield efficiency and batch-to-batch variability. Bio-engineers and operators lack intuitive, centralized systems for continuous, real-time monitoring of critical process parameters like dissolved oxygen, pH, nutrient consumption rates, and biomass accumulation.\n\nWithout dynamic feedback control loops and automated anomaly detection, unexpected metabolic shifts or environmental fluctuations can lead to complete batch failures, prolonged production cycles, and excessive resource waste. Traditional static sampling methods fail to provide timely alerts, leaving operators unable to execute corrective interventions before cellular productivity or product quality is severely compromised.' },
  { name: 'Cybersecurity', keywords: 'Threat intelligence, zero-trust architecture, encryption, intrusion detection, vulnerability assessment, incident response, network security, blockchain security, etc .', color: '#ef4444', desc: 'Problem Statement: Mitigating Advanced Digital Threats and Securing Distributed Infrastructure\n\nAs organizations, critical public utilities, and digital systems become increasingly interconnected, the attack surface for sophisticated cyber threats continues to expand exponentially. Enterprises and public sector entities struggle to maintain real-time visibility and defensive posture against advanced persistent threats (APTs), automated ransomware vectors, and complex supply chain vulnerabilities.\n\nTraditional reactive security frameworks often fail to detect novel attack patterns or respond swiftly enough to mitigate zero-day exploits before critical data or infrastructure is compromised. Furthermore, resource-constrained teams face significant friction in automating threat intelligence sharing, enforcing zero-trust access controls, and maintaining continuous compliance across distributed cloud and edge environments.' },
  { name: 'Open Innovation', keywords: 'Cross-functional collaboration, systems thinking, socio-technical systems, multi-departmental innovation, integrated design, institutional efficiency, complex systems, open innovation, etc.', color: '#06b6d4', desc: 'Problem Statement: Harnessing Cross-Disciplinary Synergies for Multi-Departmental Problem-Solving and Resource Harmonization\n\nComplex societal, industrial, and institutional challenges frequently span multiple operational boundaries—such as civil infrastructure, mechanical automation, business management, and socio-economic planning—requiring seamless integration across diverse academic and technical fields. However, teams working on cross-functional initiatives face severe friction in sharing domain-specific data, standardizing cross-departmental metrics, and synthesizing cohesive collaborative frameworks.\n\nThe lack of interoperable collaboration tools and unified evaluation environments leads to fragmented problem-solving, redundant efforts, and misaligned strategic outcomes when combining hardware, software, economic, and administrative insights. Without automated cross-domain correlation mechanisms, stakeholders struggle to evaluate systemic trade-offs or implement holistic, multi-faceted solutions effectively across diverse engineering and non-engineering departments.' },
]

const WHY_ITEMS = [
  { theme: 'blue',  text: 'A prestigious Microsoft-backed hackathon designed to elevate your resume and build real-world credibility.' },
  { theme: 'dark',  text: 'Get mentorship from industry leaders, senior engineers, and top-tier talent.' },
  { theme: 'dark',  text: 'Compete for a massive ₹75,000 cash prize and prove your skills on a real-world stage.' },
  { theme: 'white', text: 'All Round 2 participants receive e-certificates, while finalists receive official physical certificates for their achievement and recognition.' },
  { theme: 'white', text: 'Gain hands-on experience solving impactful, real-world problem statements.' },
  { theme: 'blue',  text: "Access exclusive developer tools and cloud credits from our partners, tailored to your project's scope, supporting development beyond the hackathon." }
]

const PRIZES = [
  {
    amount: '₹25,000',
    label: 'Grand Prize Winner',
    iconBg: '#ffd700',
    icon: (
      <svg fill="none" stroke="#7a5800" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M6 9a6 6 0 1012 0M6 9H4m14 0h2M9 21h6m-6 0v-3m6 3v-3m-6 3H7m8 0h2" />
      </svg>
    ),
  },
  {
    amount: '₹20,000',
    label: 'Runner Up',
    iconBg: '#c0c0c0',
    icon: (
      <svg fill="none" stroke="#4a4a4a" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    amount: '₹15,000',
    label: 'Second Runner Up',
    iconBg: '#cd7f32',
    icon: (
      <svg fill="none" stroke="#5c3000" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const FAQS = [
  { q: 'Who can participate?', a: 'Any currently enrolled student. Teams of 2–4 members from any institution. Inter-college teams are allowed.' },
  { q: 'How does the selection process work?', a: 'Round 1 is an idea screening round. Shortlisted teams will be notified and advance to the next rounds.' },
  { q: 'What is the registration fee?', a: 'A registration fee of ₹500 is collected ONLY from teams shortlisted for the Online round. You must enter a valid and correct UTR ID to confirm your payment.' },
  { q: 'Can I change my problem statement after registering?', a: 'No. Your problem statement is locked upon registration.' },
  { q: 'How will results be published?', a: 'Results will appear on your dashboard after review, and announcements will be made via email and Instagram.' },
  { q: 'Who do I contact for queries?', a: 'For any queries, please reach out to us through the official support email and phone numbers provided.' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Loading Animation — inspired by reference screenshot:
   Dark navy bg, grid overlay, "INITIALIZING..." text with progress bar
───────────────────────────────────────────────────────────────────────────── */
function LoadingOverlay({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Fill progress from 0 → 100 over ~1400ms
    const start = performance.now()
    const duration = 1400
    let raf

    const tick = (now) => {
      const elapsed = now - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        // Short pause then exit
        setTimeout(() => setDone(true), 200)
        setTimeout(() => onDone(), 700)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  const COLS = 20

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0b1120',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Grid background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(#1e2a3a 1px, transparent 1px), linear-gradient(90deg, #1e2a3a 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.5,
          }} />

          {/* Central loading widget */}
          <div style={{ position: 'relative', zIndex: 1, width: 'calc(100% - 48px)', maxWidth: 440 }}>
            {/* Progress text row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #2a3a50',
              background: '#eaedf0',
              marginBottom: 0,
            }}>
              {/* Icon block */}
              <div style={{
                width: 52, height: 52, background: '#4b6cf7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <DotArrowIcon bg="#4b6cf7" color="#fff" size={36} />
              </div>
              {/* Text */}
              <div style={{
                flex: 1, padding: '0 16px',
                fontFamily: 'ui-monospace, Courier New, monospace',
                fontSize: 13, color: '#0b1120', fontWeight: 700,
                letterSpacing: '0.05em',
              }}>
                INITIALIZING...
              </div>
              <div style={{
                padding: '0 16px',
                fontFamily: 'ui-monospace, Courier New, monospace',
                fontSize: 13, color: '#0b1120', fontWeight: 700,
              }}>
                {progress}%
              </div>
            </div>

            {/* Grid progress bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: 1,
              background: '#2a3a50',
              border: '1px solid #2a3a50',
              borderTop: 'none',
            }}>
              {Array.from({ length: COLS }).map((_, i) => {
                const filled = i < Math.round((progress / 100) * COLS)
                return (
                  <div
                    key={i}
                    style={{
                      height: 28,
                      background: filled ? '#4b6cf7' : '#0b1120',
                      transition: 'background 0.1s',
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Branding */}
          <div style={{
            position: 'absolute', top: 20, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            fontFamily: 'ui-monospace, Courier New, monospace',
            fontSize: 11, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            Zéphyr Hackathon 2026
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Top Header
───────────────────────────────────────────────────────────────────────────── */
function TopHeader() {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <img src="/logos/header_logo.png" alt="Zephyr Hackathon 2026" style={{ height: '56px', objectFit: 'contain' }} />
      </div>
      <div className="site-header__date">
        <span style={{ 
          color: '#ffffff', 
          fontWeight: 'bold', 
          fontSize: '18px',
          letterSpacing: '-0.01em'
        }}>
          Grand Finale : <span style={{ color: '#60a5fa' }}>&lt;date&gt;</span>October 21-2026<span style={{ color: '#60a5fa' }}>&lt;/date&gt;</span>
        </span>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sticky Bottom Nav
───────────────────────────────────────────────────────────────────────────── */
function BottomNav({ active }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (active && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-href="${active}"]`);
      if (activeEl) {
        // Use smooth scrolling to center the active element horizontally
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [active]);

  return (
    <nav className="bottom-nav" ref={scrollRef}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.href
        return (
          <a
            key={item.label}
            href={item.href}
            data-href={item.href}
            className="bottom-nav__item"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={isActive ? {
              background: item.color,
              color: item.textColor,
            } : {}}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = item.color
                e.currentTarget.style.color = item.textColor
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = ''
                e.currentTarget.style.color = ''
              }
            }}
          >
            {item.label}
          </a>
        )
      })}
      <Link to="/auth" className="bottom-nav__item bottom-nav__item--cta">
        Register Now
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 12L12 2M7 2H12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────────────────────────────────────── */
function HeroSection({ visible }) {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])

  return (
    <section id="overview" className="hero">
      <div className="hero__grid-bg" />

      {/* Left: Text */}
      <motion.div
        className="hero__content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 40 }}
        transition={{ duration: 0.75, ease: [0.25, 0, 0, 1], delay: 0.1 }}
      >
        {/* Logos row — Microsoft first, then PTU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48 }}>
          <img
            src="/logos/MS_logo.png"
            alt="Microsoft"
            style={{ height: 80, objectFit: 'contain' }}
          />
          <span style={{ color: 'var(--color-muted)', fontSize: 32, lineHeight: 1 }}>×</span>
          <img
            src="/logos/ptulogo2-DP1QNExA.png"
            alt="PTU"
            style={{ height: 76, objectFit: 'contain' }}
          />
        </div>

        {/* Big display heading */}
        <h1 className="display-heading display-lg" style={{ marginBottom: 24, maxWidth: 600 }}>
          Zéphyr<br />Hackathon
        </h1>

        <p style={{
          marginTop: 28, fontSize: 15, color: 'var(--color-muted)',
          letterSpacing: '-0.02em', lineHeight: 1.6, maxWidth: 400,
        }}>
          A Microsoft Community Event × PTU national-level hackathon. Build AI solutions across diverse domains for real prizes and recognition.
        </p>

        <p style={{
          marginTop: 16, fontSize: 15, color: 'var(--color-accent-blue)',
          letterSpacing: '-0.02em', lineHeight: 1.6, maxWidth: 400,
        }}>
          Gain industry mentorship, expert feedback, developer resources, and opportunities to turn ideas into real-world impact.
        </p>

        <div style={{ marginTop: 64 }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-muted)', marginBottom: '12px' }}>
            * Minimum 2 members and Maximum 4 required to Participate
          </p>
          <Link to="/auth" className="btn-split">
            <span className="btn-split__main">Register Your Team</span>
            <span className="btn-split__arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L13 3M8 3H13V8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Right: Spline 3D */}
      {isDesktop && (
        <motion.div
          className="hero__illustration hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          style={{ willChange: 'opacity', contain: 'layout paint' }}
        >
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid #4b6cf7', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          }>
            <Spline
              scene="https://prod.spline.design/QKjzhoN9XWLKyZQF/scene.splinecode"
              style={{ width: '100%', height: '100%', minHeight: 500 }}
            />
          </Suspense>
        </motion.div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Timeline Section
───────────────────────────────────────────────────────────────────────────── */
const TIMELINE = [
  { id: 1, day: 24, month: "Sept" },
  { id: 2, day: 4, month: "Oct" },
  { id: 3, day: 6, month: "Oct" },
  { id: 4, day: "??", month: "TBA" },
  { id: 5, day: 13, month: "Oct" },
  { id: 6, day: 21, month: "Oct" },
]

const TIMELINE_DETAILS = {
  1: { title: 'Registration Starts', desc: 'Registrations open for all eligible participants.' },
  2: { title: 'Registration Ends', desc: 'Deadline to submit your team applications (11 days).' },
  3: { title: 'Shortlist Announcement', desc: 'Selected teams advance to the next round.' },
  4: { title: 'Online Round', desc: 'To be Announced Soon.' },
  5: { title: 'Finalists Announcement', desc: 'Top teams selected for the Grand Finale.' },
  6: { title: 'Grand Finale', desc: 'Offline Grand Finale and prize distribution.' },
}

function TimelineSection() {
  const [selectedSlot, setSelectedSlot] = useState(1);
  const activeDetail = TIMELINE_DETAILS[selectedSlot];

  return (
    <section className="section border-y border-[#dbeafe]" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #e0e7ff 100%)', padding: '80px 0', position: 'relative' }}>
      {/* Dot Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>TIMELINE</span>
        <h2 className="display-heading display-md" style={{ color: 'var(--color-ink)', marginTop: 12 }}>
          Phases of <span className="text-highlight">Hackathon</span>
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-start relative z-10">
        <div className="w-full md:w-1/2">
          <AvailabilityCard
            title={activeDetail.title}
            slots={TIMELINE}
            selectedSlotId={selectedSlot}
            onSlotSelect={setSelectedSlot}
          />
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSlot}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{activeDetail.title}</h3>
              <p className="text-lg text-slate-500 leading-relaxed">{activeDetail.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 pt-4 md:mt-16 md:pt-16 relative z-10 flex flex-col items-center justify-center">
        <CountdownTimer />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Why Join Section
───────────────────────────────────────────────────────────────────────────── */
function WhySection() {
  return (
    <section id="why" className="section section--dark" style={{ position: 'relative' }}>
      {/* Background Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>WHY ZÉPHYR</span>
        <h2 className="display-heading display-lg" style={{ color: '#fff', marginTop: 12 }}>
          Why <span className="text-highlight">join us?</span>
        </h2>
        <p style={{ marginTop: 16, fontSize: 15, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em', lineHeight: 1.7, maxWidth: 560, margin: '16px auto 0' }}>
          A Microsoft-backed hackathon with real industry mentorship,
          competitive prizes, and meaningful recognition for student builders.
        </p>
      </div>
      <div className="bento-grid" style={{ position: 'relative', zIndex: 1 }}>
        {WHY_ITEMS.map((item, i) => (
          <div key={i} className={`bento-card bento-card--${item.theme}`}>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tracks Section (Using MorphingCardStack)
───────────────────────────────────────────────────────────────────────────── */

function getIconForTrack(name) {
  switch(name) {
    case 'Urban Mobility': return <Map className="w-6 h-6" />
    case 'Smart Commerce': return <ShoppingCart className="w-6 h-6" />
    case 'Climate & Natural Resources': return <Leaf className="w-6 h-6" />
    case 'Connected Communities': return <ShieldAlert className="w-6 h-6" />
    case 'Travel & Exploration': return <Navigation className="w-6 h-6" />
    case 'Entertainment & Creative': return <MonitorPlay className="w-6 h-6" />
    case 'Bioinformatics': return <Dna className="w-6 h-6" />
    case 'Biotechnology': return <FlaskConical className="w-6 h-6" />
    case 'Cybersecurity': return <Shield className="w-6 h-6" />
    case 'Open Innovation': return <Boxes className="w-6 h-6" />
    default: return <Boxes className="w-6 h-6" />
  }
}

function TracksSection() {
  const cardData = TRACKS.map((t, i) => ({
    id: String(i),
    title: t.name,
    description: t.desc,
    keywords: t.keywords,
    color: t.color,
    icon: getIconForTrack(t.name)
  }))

  return (
    <section id="tracks" className="section" style={{ background: '#0b1120', overflow: 'hidden', position: 'relative' }}>
      {/* Background Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>CHOOSE YOUR CHALLENGE</span>
        <h2 className="display-heading display-lg" style={{ color: '#fff', marginTop: 12 }}>
          Problem Statements
        </h2>
      </div>

      <div className="w-full mx-auto mt-12 flex justify-center" style={{ position: 'relative', zIndex: 1 }}>
        <MorphingCardStack cards={cardData} defaultLayout="grid" />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Prizes Section
───────────────────────────────────────────────────────────────────────────── */
const PRIZE_STOPS = [20000, 25000, 30000]

function PrizesSection() {
  const [amount, setAmount] = useState(30000)

  // Label based on amount
  const getPrizeLabel = (val) => {
    if (val === 25000) return "Grand Prize (1st)"
    if (val === 20000) return "Runner Up (2nd)"
    return "Second Runner Up (3rd)"
  }

  return (
    <section id="prizes" className="section" style={{ background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dot Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <h2 className="display-heading display-lg" style={{ color: '#0b1120', marginTop: 12 }}>
          Massive <span className="text-highlight">cash pool</span>
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 15, marginTop: 12 }}>Top teams win cash prizes, goodies, and fast-track interviews.</p>
      </div>

      <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-2xl bg-[#ffde00] shadow-xl relative z-10">
        <div className="flex w-full flex-col gap-6 md:gap-8">
          
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-[#0b1120]/70 uppercase tracking-widest">{getPrizeLabel(amount)}</span>
            <div className="flex items-start justify-center gap-1 md:gap-2">
              <AmountReadout value={amount} className="text-5xl md:text-7xl leading-none tracking-tighter text-[#0b1120]" />
              <span className="mt-1 md:mt-2 text-xs md:text-sm text-[#0b1120]/70 font-bold">/ team</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <AmountSlider
              min={20000}
              max={30000}
              step={5000}
              stops={PRIZE_STOPS}
              value={[amount]}
              onValueChange={([next]) => setAmount(next ?? 30000)}
            />
            <div className="flex justify-between text-xs font-bold text-[#0b1120]/70 tabular-nums">
              <span>₹20k</span>
              <span>₹25k</span>
              <span>₹30k</span>
            </div>
          </div>

          <button
            type="button"
            className="h-12 mt-6 w-full rounded-xl bg-[#0b1120] text-[15px] font-bold text-white transition-all duration-150 hover:bg-[#1a2535] hover:shadow-lg active:scale-[0.98]"
          >
            Register for Zéphyr
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAQ Section
───────────────────────────────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="section section--light">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="display-heading display-md">FAQ</h2>
      </motion.div>

      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <div key={i} className="faq-item">
            <div
              className="faq-item__header"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq-item__question">{faq.q}</div>
              <div className="faq-item__toggle">
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-block', lineHeight: 1 }}
                >
                  ···
                </motion.span>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="faq-item__answer">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-muted)', letterSpacing: '-0.01em' }}>
        Additional questions? Contact the organising team through the admin portal.
      </p>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sponsors Section
───────────────────────────────────────────────────────────────────────────── */
function SponsorsSection() {
  return (
    <section id="sponsors" className="section section--dark" style={{ background: '#f5f3ef', borderBottomColor: 'var(--color-hairline)' }}>
      <div>
        <h2 className="display-heading display-md" style={{ color: 'var(--color-ink)' }}>Sponsors</h2>
      </div>

      <div className="sponsors-grid" style={{ marginTop: 40, border: '1px solid var(--color-hairline)', background: 'var(--color-hairline)' }}>
        {/* Microsoft */}
        <div className="sponsor-card">
          <span className="sponsor-card__link">↗</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <img
              src="/logos/MS_logo.png"
              alt="Microsoft"
              style={{ height: 48, objectFit: 'contain', objectPosition: 'left' }}
            />
            <span className="sponsor-card__name">Microsoft</span>
          </div>
        </div>
        {/* PTU */}
        <div className="sponsor-card">
          <span className="sponsor-card__link">↗</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <img
              src="/logos/ptulogo2-DP1QNExA.png"
              alt="PTU"
              style={{ height: 64, objectFit: 'contain', objectPosition: 'left' }}
            />
            <span className="sponsor-card__name">PTU</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CTA / Footer
───────────────────────────────────────────────────────────────────────────── */

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date("October 4, 2026 23:59:59").getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm md:text-base font-bold text-[#0b1120]/70 uppercase tracking-widest mb-4">Registration closes Oct 4th</span>
      <div className="flex items-center gap-3 md:gap-6 bg-white/60 backdrop-blur-md px-8 py-5 md:px-10 md:py-6 rounded-3xl border border-black/10 shadow-xl shadow-black/5">
        <div className="flex flex-col items-center min-w-[72px] md:min-w-[80px]">
          <span className="text-4xl md:text-6xl font-black text-[#0b1120] tracking-tighter leading-none">{timeLeft.days}</span>
          <span className="text-xs md:text-sm uppercase font-bold text-gray-700 tracking-widest mt-2">Days</span>
        </div>
        <span className="text-2xl md:text-4xl font-black text-gray-300 pb-5">:</span>
        <div className="flex flex-col items-center min-w-[72px] md:min-w-[80px]">
          <span className="text-4xl md:text-6xl font-black text-[#0b1120] tracking-tighter leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs md:text-sm uppercase font-bold text-gray-700 tracking-widest mt-2">Hrs</span>
        </div>
        <span className="text-2xl md:text-4xl font-black text-gray-300 pb-5">:</span>
        <div className="flex flex-col items-center min-w-[72px] md:min-w-[80px]">
          <span className="text-4xl md:text-6xl font-black text-[#0b1120] tracking-tighter leading-none">{String(timeLeft.mins).padStart(2, '0')}</span>
          <span className="text-xs md:text-sm uppercase font-bold text-gray-700 tracking-widest mt-2">Mins</span>
        </div>
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <>
      <div className="cta-footer">
        <h2>Register your team<br />for Zéphyr Hackathon</h2>
      </div>
      <Link to="/auth" className="cta-footer__action">
        <span>Register Now</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 12L12 2M7 2H12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="section section--light" style={{ padding: '60px 0', borderTop: '1px solid var(--color-hairline)' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="display-heading display-sm" style={{ color: 'var(--color-ink)', marginBottom: 24 }}>
          Get in <span className="text-highlight">Touch</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--color-ink)' }}>
            <strong>Email:</strong> <a href="mailto:zephyr@ptuniv.edu.in" className="text-blue-600 hover:underline">zephyr@ptuniv.edu.in</a>
          </p>
          <div style={{ fontSize: '18px', color: 'var(--color-ink)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <strong>Phone:</strong> 
            <a href="tel:+919385910261" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              +91 93859 10261
            </a>
            <span className="text-slate-400">,</span>
            <a href="tel:+918300949377" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              +91 83009 49377
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Active Section Detection
───────────────────────────────────────────────────────────────────────────── */
function useActiveSection() {
  const [active, setActive] = useState('#overview')

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(n => n.href.replace('#', ''))
    
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + window.innerHeight / 2
          let current = '#overview'
          for (const id of sectionIds) {
            const el = document.getElementById(id)
            if (el && el.offsetTop <= scrollPos) {
              current = '#' + id
            }
          }
          setActive(current)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return active
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const [introComplete, setIntroComplete] = useState(false)
  const active = useActiveSection()

  return (
    <>
      <LoadingOverlay onDone={() => setIntroComplete(true)} />
      <TopHeader />
      <main style={{ 
        paddingTop: 0, 
        paddingBottom: 140, 
        opacity: introComplete ? 1 : 0, 
        transition: 'opacity 0.6s ease-out' 
      }}>
        <HeroSection visible={introComplete} />
        <TimelineSection />
        <WhySection />
        <TracksSection />
        <PrizesSection />
        <RulesSection />
        
        <section id="team" className="section section--light" style={{ padding: '100px 0', borderBottomColor: 'var(--color-hairline)', position: 'relative' }}>
          {/* Dot Grid Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }} />

          <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
            <h2 className="display-heading display-md">Faculty <span className="text-highlight">Coordinators</span></h2>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <FacultyShowcase />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 80, position: 'relative', zIndex: 1 }}>
            <h2 className="display-heading display-md">Meet the <span className="text-highlight">Team</span></h2>
            <p className="px-6 md:px-0 max-w-2xl mx-auto" style={{ color: 'var(--color-muted)', fontSize: 16, marginTop: 12 }}>
              The people working behind the scenes to make Zéphyr Hackathon a reality.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <TeamShowcase />
          </div>
        </section>
        <FAQSection />
        <CTASection />
        <ContactSection />
      </main>
      <BottomNav active={active} />
    </>
  )
}
