import Budgets from "../components/Budgets";
import { theme } from "../theme";

function BudgetPlanner({ budgets, loadData }) {
  return (
    <div>
      <h1 style={pageTitle}>Budget Planner</h1>
      <p style={pageSubtitle}>Set limits and track your spending</p>
      <Budgets budgets={budgets} onChanged={loadData} />
    </div>
  );
}

const pageTitle = { margin: "0 0 2px", fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.colors.ink };
const pageSubtitle = { margin: "0 0 24px", fontSize: 14, color: theme.colors.muted };

export default BudgetPlanner;