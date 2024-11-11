// Get references to elements
const transactionForm = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const budgetInput = document.getElementById("budget-amount");
const setBudgetButton = document.getElementById("set-budget");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance-amount");
const transactionList = document.getElementById("transaction-list");
const budgetStatusEl = document.getElementById("budget-status");
const exportCSVButton = document.getElementById("export-csv");
const exportPDFButton = document.getElementById("export-pdf");
const expenseChartCanvas = document.getElementById("expenseChart");

// Initialize variables
let totalIncome = 0;
let totalExpenses = 0;
let budget = 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Function to update displayed data
function updateDisplay() {
    totalIncomeEl.textContent = totalIncome.toFixed(2);
    totalExpensesEl.textContent = totalExpenses.toFixed(2);
    balanceEl.textContent = (totalIncome - totalExpenses).toFixed(2);

    if (budget > 0) {
        if (totalExpenses > budget) {
            budgetStatusEl.textContent = "You have exceeded your budget!";
            budgetStatusEl.style.color = "red";
        } else {
            budgetStatusEl.textContent = `Budget: $${budget.toFixed(2)} remaining`;
            budgetStatusEl.style.color = "green";
        }
    }

    // Display transaction history
    transactionList.innerHTML = "";
    transactions.forEach((transaction, index) => {
        const li = document.createElement("li");
        li.textContent = `${transaction.description} - $${transaction.amount} (${transaction.type} - ${transaction.category})`;
        transactionList.appendChild(li);
    });

    renderChart();
}

// Function to render the chart
function renderChart() {
    const incomeData = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenseData = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    const chartData = {
        labels: ['Income', 'Expenses'],
        datasets: [{
            label: 'Total Income vs Expenses',
            data: [incomeData, expenseData],
            backgroundColor: ['#4CAF50', '#F44336'],
        }]
    };

    new Chart(expenseChartCanvas, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
        },
    });
}

// Event listener for adding transactions
transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value.trim());
    const type = typeInput.value;
    const category = categoryInput.value;

    if (description && !isNaN(amount) && amount > 0) {
        const transaction = { description, amount, type, category };

        // Update totals based on type
        if (type === "income") {
            totalIncome += amount;
        } else if (type === "expense") {
            totalExpenses += amount;
        }

        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // Clear form and update display
        descriptionInput.value = "";
        amountInput.value = "";
        categoryInput.value = "general";
        updateDisplay();
    }
});

// Event listener for setting budget
setBudgetButton.addEventListener("click", () => {
    const newBudget = parseFloat(budgetInput.value.trim());
    if (!isNaN(newBudget) && newBudget >= 0) {
        budget = newBudget;
        localStorage.setItem("budget", budget);
        budgetInput.value = "";
        updateDisplay();
    }
});

// Event listener for exporting to CSV
exportCSVButton.addEventListener("click", () => {
    const csv = transactions.map(t => `${t.description},${t.amount},${t.type},${t.category}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
});

// Event listener for exporting to PDF
exportPDFButton.addEventListener("click", () => {
    const doc = new jsPDF();
    doc.text("Personal Finance Tracker", 10, 10);
    transactions.forEach((t, index) => {
        doc.text(`${t.description} - $${t.amount} (${t.type} - ${t.category})`, 10, 20 + (index * 10));
    });
    doc.save("transactions.pdf");
});

// Initialize the app with stored data
window.onload = () => {
    budget = parseFloat(localStorage.getItem("budget")) || 0;
    updateDisplay();
};
