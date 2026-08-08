import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Budgets from "../components/Budgets";

function BudgetPlanner({ budgets, loadData }) {
  const { openAddModal } = useOutletContext();

  return (
    <div>
      <PageHeader title="Budget Planner" subtitle="Set limits and track your spending" onNew={openAddModal} />
      <Budgets budgets={budgets} onChanged={loadData} />
    </div>
  );
}

export default BudgetPlanner;