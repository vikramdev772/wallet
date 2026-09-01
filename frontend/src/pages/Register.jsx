import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../App'
import Toast from '../components/Toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.05,
    },
  },
}

const glowVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: 'easeOut' },
  },
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await signup(name, email, password)
      setToast({ message: 'Account created!', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (err) {
      setToast({ message: err.message || 'Registration failed', type: 'error' })
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="ambient-glow"
        variants={glowVariants}
        initial="hidden"
        animate="visible"
      />

      <motion.div
        className="auth-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ borderColor: 'rgba(139, 92, 246, 0.4)' }}
      >
        <motion.div
          className="auth-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.i
            className="fa-solid fa-wallet brand-icon"
            variants={itemVariants}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          />
          <motion.h2 variants={itemVariants}>Create Account</motion.h2>
          <motion.p variants={itemVariants}>Set up your wallet in seconds</motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="form-group" variants={itemVariants}>
            <label>Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
              <i className="fa-regular fa-user" />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                required
              />
              <i className="fa-regular fa-envelope" />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
              <i className="fa-solid fa-lock" />
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Creating...</>
            ) : (
              <>Create Account <i className="fa-solid fa-arrow-right" /></>
            )}
          </motion.button>
        </motion.form>

        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Already have an account? <Link to="/login">Sign in</Link>
        </motion.div>
      </motion.div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  )
}
