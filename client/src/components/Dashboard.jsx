import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import RecentTransactions from "../components/RecentTransactions";
import AskFinPilot from "../components/AskFinpilot";
import { theme } from "../theme";

function Dashboard({ stats, insight, transactions, loadData, loading }) {
  const { openAddModal } = useOutletContext();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your money at a glance" onNew={openAddModal} />

      {loading && <p style={{ color: theme.colors.muted }}>Loading…</p>}

      {stats && (
        <div className="fp-stat-grid">
          <StatCard label="Total Balance" value={stats.balance} icon="₹" accent={theme.colors.brand}
            sub={stats.balance >= 0 ? "You're in the green" : "Spending over income"}
            subColor={stats.balance >= 0 ? theme.colors.income : theme.colors.expense} />
          <StatCard label="Total Income" value={stats.total_income} icon="↑" accent={theme.colors.income} sub="All income recorded" />
          <StatCard label="This Month" value={stats.month_expense} icon="▤" accent={theme.colors.expense} sub="Spent this month" />
          <StatCard label="This Week" value={stats.week_expense} icon="◷" accent={theme.colors.warning} sub="Spent in last 7 days" />
        </div>
      )}

      {insight && insight.expense_pct !== undefined && (
        <div className="fp-insight" style={insightStyle}>
          <span style={{ fontSize: 18 }}>✦</span>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Spent</div>
              <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.colors.expense }}>{insight.expense_pct}%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Saved</div>
              <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.colors.income }}>{insight.savings_pct}%</div>
            </div>
          </div>
          <span style={{ fontSize: 14, color: theme.colors.ink, lineHeight: 1.5, flex: 1, minWidth: 200 }}>{insight.comment}</span>
        </div>
      )}

      <AskFinPilot />

      <RecentTransactions transactions={transactions} />
    </div>
  );
}

const insightStyle = {
  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20,
  padding: "14px 18px", background: theme.colors.brandSoft, border: `1px solid ${theme.colors.border}`,
  borderLeft: `3px solid ${theme.colors.brand}`, borderRadius: theme.radius.md,
};

export default Dashboard;