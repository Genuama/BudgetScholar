import { Link } from "react-router-dom";

const resources = [
  {
    icon: "📖",
    type: "Book",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    desc: "Timeless lessons on wealth and happiness. Changed how I think about money entirely.",
    url: "https://www.morganhousel.com/writing/the-psychology-of-money",
  },
  {
    icon: "📗",
    type: "Book",
    title: "I Will Teach You To Be Rich",
    author: "Ramit Sethi",
    desc: "Practical, no-BS advice written for young people. Covers budgeting, saving, and investing.",
    url: "https://www.iwillteachyoutoberich.com",
  },
  {
    icon: "🌐",
    type: "Website",
    title: "Investopedia",
    author: "investopedia.com",
    desc: "The best free resource for learning finance terms, concepts, and how investing actually works.",
    url: "https://www.investopedia.com",
  },
  {
    icon: "🎓",
    type: "Free Course",
    title: "Khan Academy — Personal Finance",
    author: "khanacademy.org",
    desc: "Free, beginner-friendly videos covering budgets, taxes, insurance, and retirement basics.",
    url: "https://www.khanacademy.org/college-careers-more/personal-finance",
  },
  {
    icon: "💬",
    type: "Community",
    title: "r/personalfinance",
    author: "reddit.com",
    desc: "A huge community of people helping each other figure out money. Great for real-life questions.",
    url: "https://www.reddit.com/r/personalfinance",
  },
  {
    icon: "🛠️",
    type: "Website",
    title: "NerdWallet",
    author: "nerdwallet.com",
    desc: "Clear, unbiased guides on credit cards, student loans, and building your financial foundation.",
    url: "https://www.nerdwallet.com",
  },
];

const features = [
  {
    icon: "💸",
    title: "Track Every Dollar",
    desc: "Log your income and expenses in seconds. Know exactly where your money is going, every single day.",
  },
  {
    icon: "🎯",
    title: "Set Smart Budgets",
    desc: "Create spending limits by category. Get instant visual feedback on how close you are to your limit.",
  },
  {
    icon: "📊",
    title: "See the Big Picture",
    desc: "Your dashboard shows your net balance, savings rate, and budget health — all in one clean view.",
  },
  {
    icon: "🏫",
    title: "Built for Students",
    desc: "Designed with student life in mind. Simple, fast, and focused on what actually matters for your budget.",
  },
];

export default function Landing() {
  return (
    <div className="landing">

      {/* ── Nav ── */}
      <header className="landing-nav">
        <div className="landing-nav-brand">BudgetScholar</div>
        <div className="landing-nav-links">
          <Link to="/login" className="landing-nav-login">Sign in</Link>
          <Link to="/register" className="landing-nav-cta">Get Started</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-orb orb3" />

        <div className="hero-content">
          <div className="hero-badge">💰 Free · No ads · Built for you</div>
          <h1 className="hero-title">
            Stop wondering<br />
            where your money went.
          </h1>
          <p className="hero-sub">
            BudgetScholar helps you track spending, set budgets, and actually
            stick to them — so you can focus on what matters.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Start for free →</Link>
            <Link to="/login" className="btn-ghost">I have an account</Link>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="hero-card">
          <div className="preview-label">Net Balance</div>
          <div className="preview-amount">$1,240.50</div>
          <div className="preview-stats">
            <div className="preview-stat">
              <span className="preview-stat-label">Income</span>
              <span className="preview-stat-val income">+$2,400.00</span>
            </div>
            <div className="preview-stat">
              <span className="preview-stat-label">Expenses</span>
              <span className="preview-stat-val expense">-$1,159.50</span>
            </div>
          </div>
          <div className="preview-divider" />
          <div className="preview-budget-title">Groceries</div>
          <div className="preview-bar-track">
            <div className="preview-bar-fill" style={{ width: "68%" }} />
          </div>
          <div className="preview-bar-labels">
            <span>$136 spent</span>
            <span className="ok-tag">$64 left</span>
          </div>
          <div className="preview-budget-title" style={{ marginTop: 10 }}>Transport</div>
          <div className="preview-bar-track">
            <div className="preview-bar-fill warn" style={{ width: "88%" }} />
          </div>
          <div className="preview-bar-labels">
            <span>$88 spent</span>
            <span className="warn-tag">$12 left</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <h2 className="features-title">Everything you need, nothing you don't.</h2>
        <p className="features-sub">Simple by design. Powerful where it counts.</p>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="resources">
        <div className="resources-header">
          <h2 className="resources-title">Want to learn more about budgeting & investing?</h2>
          <p className="resources-sub">
            These are the books, sites, and communities that actually helped me as a student.
            No fluff — just the good stuff.
          </p>
        </div>
        <div className="resources-grid">
          {resources.map(r => (
            <a key={r.title} href={r.url} target="_blank" rel="noreferrer" className="resource-card">
              <div className="resource-card-top">
                <span className="resource-icon">{r.icon}</span>
                <span className="resource-type">{r.type}</span>
              </div>
              <div className="resource-title">{r.title}</div>
              <div className="resource-author">{r.author}</div>
              <p className="resource-desc">{r.desc}</p>
              <div className="resource-link">Check it out →</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Creator ── */}
      <section className="creator">
        <div className="creator-card">
          <div className="creator-avatar">A</div>
          <div className="creator-info">
            <div className="creator-made">Made with 💚 by</div>
            <div className="creator-name">Ama</div>
            <div className="creator-student-tag">🎓 Built by a student, for students (mostly)</div>
            <p className="creator-bio">
              A developer who got tired of not knowing where her money was going —
              so she built the tool she wished existed.
              BudgetScholar is a personal project built with React, Node.js, and MariaDB.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-footer-brand">BudgetScholar</span>
        <span>© {new Date().getFullYear()} Ama. All rights reserved.</span>
      </footer>

    </div>
  );
}
