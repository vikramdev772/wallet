import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { api } from "../api";
import Toast from "../components/Toast";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const navbarVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24, delay: 0.05 },
  },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  }),
};

function AnimatedBalance({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {value}
    </motion.span>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("send");
  const [toast, setToast] = useState(null);

  // Send form state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const currentUserId = api.getUserId();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, profileData] = await Promise.all([
        api.getWallet(),
        api.getProfile(),
      ]);
      if (walletData && walletData.wallet) setWallet(walletData.wallet);
      if (profileData && profileData.user) setProfile(profileData.user);
    } catch (err) {
      setToast({
        message: "Failed to load data: " + err.message,
        type: "error",
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const result = await api.sendMoney(recipientEmail, parseFloat(amount));
      if (result && result.wallet) {
        setToast({
          message: result.message || "Transfer successful!",
          type: "success",
        });
        setWallet(result.wallet);
        setRecipientEmail("");
        setAmount("");
        loadData();
      }
    } catch (err) {
      setToast({ message: err.message || "Transfer failed", type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const balance = wallet ? parseFloat(wallet.balance).toFixed(8) : "0.00000000";
  const activeUser = profile || user;

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navbar */}
      <motion.nav
        className="navbar"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="nav-logo">
          <motion.i
            className="fa-solid fa-wallet"
            whileHover={{ scale: 1.15, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <span>CryptoWallet</span>
        </div>
        <div className="nav-profile">
          <motion.div
            className="user-badge"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <i className="fa-regular fa-circle-user" />
            <span>
              {activeUser?.name || "User"} (ID: {currentUserId || "N/A"})
            </span>
          </motion.div>
          <motion.button
            className="btn-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-power-off" /> <span>Logout</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="workspace">
        {/* Left Panel */}
        <motion.div
          className="wallet-panel"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="glass-card balance-card"
            variants={fadeSlideUp}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>Current Balance</h3>
            <div className="balance-amount">
              <AnimatedBalance value={balance} />
              <span className="currency-symbol">USDT</span>
            </div>
            <motion.button
              className="btn-copy"
              style={{ marginTop: "12px", fontSize: "0.8rem" }}
              onClick={loadData}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <motion.i
                className="fa-solid fa-arrows-rotate"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
              />{" "}
              Refresh Balance
            </motion.button>
          </motion.div>

          <motion.div className="actions-grid" variants={fadeSlideUp}>
            <motion.button
              className={`action-tab-btn ${activeTab === "send" ? "active" : ""}`}
              onClick={() => setActiveTab("send")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              layout
            >
              <i className="fa-solid fa-paper-plane" />
              <span>Send Money</span>
            </motion.button>
            <motion.button
              className={`action-tab-btn ${activeTab === "receive" ? "active" : ""}`}
              onClick={() => setActiveTab("receive")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              layout
            >
              <i className="fa-solid fa-qrcode" />
              <span>Receive</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="main-panel"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="glass-card">
            <AnimatePresence mode="wait">
              {/* Send Form */}
              {activeTab === "send" && (
                <motion.div
                  className="form-section"
                  key="send"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="panel-title">
                    <i className="fa-solid fa-paper-plane" />
                    <span>Send Money Instantly</span>
                  </div>
                  <motion.form
                    onSubmit={handleSend}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div className="form-group" variants={fadeSlideUp}>
                      <label>Recipient Email</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="e.g. recipient@example.com"
                          required
                        />
                        <i className="fa-regular fa-envelope" />
                      </div>
                    </motion.div>
                    <motion.div className="form-group" variants={fadeSlideUp}>
                      <label>Amount (USDT)</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="0.00000001"
                          step="any"
                          required
                        />
                        <i className="fa-solid fa-dollar-sign" />
                      </div>
                    </motion.div>
                    <motion.button
                      type="submit"
                      className="btn-submit"
                      disabled={sending}
                      variants={fadeSlideUp}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sending ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          Transfer Money{" "}
                          <i className="fa-solid fa-arrow-right" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                </motion.div>
              )}

              {/* Receive Info */}
              {activeTab === "receive" && (
                <motion.div
                  className="form-section"
                  key="receive"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="panel-title">
                    <i className="fa-solid fa-qrcode" />
                    <span>Receive Digital Assets</span>
                  </div>
                  <div className="receive-content">
                    <motion.div
                      className="qr-code-box"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.15,
                      }}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeUser?.email || "")}&color=06b6d4&bgcolor=0e1117`}
                        alt="Wallet QR Code"
                      />
                    </motion.div>
                    <motion.div
                      className="receive-details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                    >
                      <h4>Your Wallet Address</h4>
                      <p>
                        Share this email with the sender. Transfers are instant
                        and free.
                      </p>
                      <motion.button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            activeUser?.email || "",
                          );
                          setToast({
                            message: "Email copied!",
                            type: "success",
                          });
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="fa-regular fa-copy" /> {activeUser?.email}
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account Profile Card */}
          <motion.div
            className="glass-card history-card"
            variants={fadeSlideUp}
            whileHover={{ y: -2 }}
          >
            <div className="panel-title">
              <i className="fa-solid fa-id-badge" />
              <span>Current Account Profile (localStorage inspect target)</span>
            </div>
            <div className="history-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      field: "localStorage.userId",
                      value: currentUserId || "None",
                      note: "Client-controlled ID passed to backend",
                      badge: true,
                    },
                    {
                      field: "Account Name",
                      value: activeUser?.name || "N/A",
                      note: `Fetched via /api/user/profile?userId=${currentUserId}`,
                    },
                    {
                      field: "Account Email",
                      value: activeUser?.email || "N/A",
                      note: "Recipient identifier for transfers",
                    },
                    {
                      field: "Wallet Balance",
                      value: `${balance} USDT`,
                      note: `Fetched via /api/wallet?userId=${currentUserId}`,
                    },
                  ].map((row, i) => (
                    <motion.tr
                      key={row.field}
                      custom={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <td>
                        <strong>{row.field}</strong>
                      </td>
                      <td>
                        {row.badge ? (
                          <span className="ip-badge">{row.value}</span>
                        ) : (
                          row.value
                        )}
                      </td>
                      <td>{row.note}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}
