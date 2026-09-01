import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useAuth } from "../App";
import Toast from "../components/Toast";

/* ── Particle Background ─────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const PARTICLE_COUNT = 50;
    const CONNECTION_DIST = 140;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ── Mini Particle Canvas (inside brand card) ────────────── */
function MiniParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const COUNT = 20;
    const DIST = 70;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 100;
    };
    resize();

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const a = (1 - d / DIST) * 0.2;
            ctx.strokeStyle = `rgba(6, 182, 212, ${a})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, 0.35)`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="mini-particle-canvas" />;
}

/* ── Floating Orbs ──────────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="floating-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

/* ── Animated Counter ───────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", decimals = 0, duration = 2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) return v.toFixed(decimals);
    return Math.round(v).toString();
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [target, duration, count, rounded]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

/* ── Feature Card ───────────────────────────────────────── */
const features = [
  {
    icon: "fa-solid fa-bolt",
    title: "Instant Transfers",
    desc: "Zero-fee peer-to-peer transfers in real time.",
    color: "#8b5cf6",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Bank-Grade Security",
    desc: "End-to-end encryption keeps your assets safe.",
    color: "#06b6d4",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Live Analytics",
    desc: "Track portfolio performance with real-time data.",
    color: "#10b981",
  },
  {
    icon: "fa-solid fa-globe",
    title: "Multi-Chain Support",
    desc: "Manage assets across multiple blockchains.",
    color: "#f59e0b",
  },
];

function FeatureCards() {
  return (
    <div className="features-row">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="feature-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6 + i * 0.12,
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          whileHover={{
            y: -6,
            boxShadow: `0 10px 28px ${f.color}15`,
            transition: { type: "spring", stiffness: 400, damping: 20 },
          }}
        >
          <motion.div
            className="feature-icon"
            style={{ color: f.color, background: `${f.color}12` }}
            whileHover={{ scale: 1.12, rotate: -5 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <i className={f.icon} />
          </motion.div>
          <h4>{f.title}</h4>
          <p>{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Stats Bar ──────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    {
      label: "Active Users",
      target: 12,
      suffix: "K+",
      icon: "fa-solid fa-users",
      color: "#8b5cf6",
    },
    {
      label: "Transactions",
      target: 1.2,
      suffix: "M+",
      icon: "fa-solid fa-arrow-right-arrow-left",
      color: "#06b6d4",
      decimals: 1,
    },
    {
      label: "Uptime",
      target: 99.9,
      suffix: "%",
      icon: "fa-solid fa-server",
      color: "#10b981",
      decimals: 1,
    },
    {
      label: "Countries",
      target: 80,
      suffix: "+",
      icon: "fa-solid fa-earth-americas",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="stats-bar">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="stat-item"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.0 + i * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 24,
          }}
          whileHover={{ scale: 1.06, y: -2 }}
        >
          <div className="stat-icon-wrap" style={{ color: s.color }}>
            <i className={s.icon} />
          </div>
          <div>
            <span className="stat-value">
              <AnimatedCounter
                target={s.target}
                suffix={s.suffix}
                decimals={s.decimals || 0}
                duration={2}
              />
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Auth Form ──────────────────────────────────────────── */
const inputVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.12 + i * 0.07,
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  }),
};

function AuthForm({ tab = "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const isLogin = tab === "login";

  // Reset form on tab switch
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPw(false);
    setTimeout(() => emailRef.current?.focus(), 300);
  }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      setToast({
        message: isLogin ? "Welcome back!" : "Account created!",
        type: "success",
      });
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setToast({
        message: err.message || "Something went wrong",
        type: "error",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="landing-form" noValidate>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!isLogin && (
              <motion.div
                className="form-group"
                custom={0}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="landing-name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    id="landing-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    required
                  />
                  <i className="fa-regular fa-user" />
                </div>
              </motion.div>
            )}

            <motion.div
              className="form-group"
              custom={isLogin ? 0 : 1}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
            >
              <label htmlFor="landing-email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="landing-email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <i className="fa-regular fa-envelope" />
              </div>
            </motion.div>

            <motion.div
              className="form-group"
              custom={isLogin ? 1 : 2}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
            >
              <label htmlFor="landing-pw">Password</label>
              <div className="input-wrapper">
                <input
                  id="landing-pw"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter password" : "Min. 6 characters"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={6}
                />
                <i className="fa-solid fa-lock" />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <i
                    className={
                      showPw ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                    }
                  />
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="btn-primary landing-btn"
              disabled={submitting}
              custom={isLogin ? 2 : 3}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 8px 28px rgba(124, 58, 237, 0.45)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="btn-shine" />
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />{" "}
                  {isLogin ? "Signing in..." : "Creating..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}{" "}
                  <i className="fa-solid fa-arrow-right" />
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

/* ── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  return (
    <motion.nav
      className="landing-nav"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="nav-inner">
        <div className="nav-brand">
          <i className="fa-solid fa-wallet" />
          <span>CryptoWallet</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#stats">Stats</a>
          <a href="#auth" className="nav-signin">
            Sign In
          </a>
          <a href="#auth" className="nav-cta">
            Get Started
          </a>
        </div>
        <button className="nav-hamburger" aria-label="Menu">
          <i className="fa-solid fa-bars" />
        </button>
      </div>
    </motion.nav>
  );
}

/* ── Footer ─────────────────────────────────────────────── */
function LandingFooter() {
  return (
    <motion.footer
      className="landing-footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <div className="footer-inner">
        <div className="footer-brand">
          <i className="fa-solid fa-wallet" />
          <span>CryptoWallet</span>
        </div>
        <p className="footer-copy">
          &copy; 2026 CryptoWallet. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </div>
    </motion.footer>
  );
}

/* ── Main Landing Page ──────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <ParticleField />
      <FloatingOrbs />
      <Navbar />

      {/* ── Left Panel ── */}
      <div className="landing-left">
        <motion.div
          className="brand-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="brand-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileHover={{ scale: 1.015 }}
          >
            <div className="brand-card-shimmer" />
            <div className="brand-card-inner">
              <div className="brand-logo-wrap">
                <motion.div
                  className="brand-ring"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="brand-icon-inner"
                  animate={{
                    boxShadow: [
                      "0 0 24px rgba(139,92,246,0.2)",
                      "0 0 44px rgba(139,92,246,0.35)",
                      "0 0 24px rgba(139,92,246,0.2)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <i className="fa-brands fa-bitcoin" />
                </motion.div>
              </div>

              <MiniParticles />

              <h1 className="brand-title">
                Crypto <span className="gradient-text">Wallet</span>
              </h1>

              <p className="brand-subtitle">
                Manage your decentralized crypto assets, view transaction logs,
                and perform instant zero-fee transfers — all in one place.
              </p>

              <div className="trust-badges">
                {[
                  { icon: "fa-solid fa-lock", text: "Encrypted" },
                  { icon: "fa-solid fa-check-double", text: "Verified" },
                  { icon: "fa-solid fa-bolt", text: "Fast" },
                ].map((b, i) => (
                  <motion.div
                    key={b.text}
                    className="badge"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                    }}
                    whileHover={{ scale: 1.06, y: -2 }}
                  >
                    <i className={b.icon} /> {b.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right Panel ── */}
      <div className="landing-right" id="auth">
        <motion.div
          className="auth-card landing-auth-card"
          initial={{ opacity: 0, y: 50, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 20,
            delay: 0.3,
          }}
        >
          <div className="auth-card-inner">
            <div className="auth-header">
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 300 }}
              >
                Create Account
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.16 }}
              >
                Enter details below to create your wallet
              </motion.p>
            </div>

            <AuthForm tab="register" />

            <motion.div
              className="auth-switch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Already have an account?{" "}
              <motion.button
                type="button"
                onClick={() => navigate("/login")}
                className="switch-link"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Sign in
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}