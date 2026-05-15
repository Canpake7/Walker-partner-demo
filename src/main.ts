import {
  WalkerApiError,
  WalkerClient,
  createWalkerConnectUrl,
  type WalletBalance,
  type WalletTransaction,
} from "@walker/walker-sdk-js";
import "./styles.css";

const STORAGE_KEY = "walker.partner.demo.state";

interface DemoState {
  baseUrl: string;
  partnerName: string;
  clientId: string;
  externalUserId: string;
  redirectUri: string;
  connectionToken: string;
  spendAmount: string;
  spendReason: string;
}

const defaultState: DemoState = {
  baseUrl: "https://walker-xl5k.onrender.com",
  partnerName: "Walker Partner Demo",
  clientId: "",
  externalUserId: "demo-web-user",
  redirectUri: `${window.location.origin}/callback`,
  connectionToken: "",
  spendAmount: "100",
  spendReason: "demo_reward",
};

let state: DemoState = loadState();
let balance: WalletBalance | null = null;
let transactions: WalletTransaction[] = [];
let statusMessage = "Ready.";
let errorMessage = "";

function loadState(): DemoState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function walker(): WalkerClient {
  return new WalkerClient({
    baseUrl: state.baseUrl,
    connectionToken: state.connectionToken || undefined,
  });
}

function setStatus(message: string): void {
  statusMessage = message;
  errorMessage = "";
  render();
}

function setError(error: unknown): void {
  if (error instanceof WalkerApiError) {
    errorMessage = `${error.status}: ${String(error.detail)}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }
  render();
}

function openHostedConnect(): void {
  try {
    const url = createWalkerConnectUrl({
      baseUrl: state.baseUrl,
      clientId: state.clientId,
      externalUserId: state.externalUserId,
      partnerName: state.partnerName,
      redirectUri: state.redirectUri,
      scopes: ["wallet:read", "wallet:spend"],
    });
    window.location.href = url;
  } catch (error) {
    setError(error);
  }
}

function openWalkerApp(): void {
  try {
    const url = createWalkerConnectUrl({
      clientId: state.clientId,
      externalUserId: state.externalUserId,
      partnerName: state.partnerName,
      redirectUri: state.redirectUri,
      scopes: ["wallet:read", "wallet:spend"],
    });
    window.location.href = url;
  } catch (error) {
    setError(error);
  }
}

async function useDevConnection(): Promise<void> {
  try {
    setStatus("Creating development connection...");
    const connection = await walker().connectPartnerUser({
      clientId: state.clientId,
      externalUserId: state.externalUserId,
      scopes: ["wallet:read", "wallet:spend"],
      playerAuth: {
        devPlayerEmail: "test@example.com",
        devPlayerName: "Test Player",
      },
    });
    state.connectionToken = connection.connectionToken;
    saveState();
    await refreshWallet();
    setStatus("Development connection created.");
  } catch (error) {
    setError(error);
  }
}

async function refreshWallet(): Promise<void> {
  try {
    setStatus("Refreshing wallet...");
    balance = await walker().getBalance();
    const response = await walker().listTransactions({ limit: 20 });
    transactions = response.transactions;
    setStatus("Wallet refreshed.");
  } catch (error) {
    setError(error);
  }
}

async function spendCredits(): Promise<void> {
  try {
    const amount = Number.parseInt(state.spendAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Spend amount must be a positive integer.");
    }
    setStatus("Spending credits...");
    await walker().spendCredits({
      amount,
      reason: state.spendReason,
      externalReference: `demo-${Date.now()}`,
      idempotencyKey: `${state.externalUserId}:${state.spendReason}:${Date.now()}`,
      metadata: {
        source: "walker-partner-demo",
      },
    });
    await refreshWallet();
    setStatus("Spend complete.");
  } catch (error) {
    setError(error);
  }
}

function captureCallback(): void {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("walker_connection_token");
  if (!token) return;
  state.connectionToken = token;
  saveState();
  window.history.replaceState({}, "", "/");
  setStatus("Captured connection token from Walker app callback.");
  void refreshWallet();
}

function updateState(key: keyof DemoState, value: string): void {
  state = { ...state, [key]: value };
  saveState();
  render();
}

function resetDemo(): void {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState;
  balance = null;
  transactions = [];
  statusMessage = "Reset complete.";
  errorMessage = "";
  render();
}

function input(label: string, key: keyof DemoState, type = "text"): string {
  return `
    <label class="field">
      <span>${label}</span>
      <input data-key="${key}" type="${type}" value="${escapeHtml(state[key])}" />
    </label>
  `;
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  app.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Walker partner wallet test</p>
          <h1>Connect & Spend Demo</h1>
        </div>
        <button data-action="reset" class="ghost">Reset</button>
      </header>

      <section class="status ${errorMessage ? "error" : ""}">
        ${escapeHtml(errorMessage || statusMessage)}
      </section>

      <section class="grid">
        <article class="panel">
          <div class="panel-title">
            <span>1</span>
            <h2>Connection settings</h2>
          </div>
          ${input("Walker API", "baseUrl", "url")}
          ${input("Partner name", "partnerName")}
          ${input("Client ID", "clientId")}
          ${input("Redirect URI", "redirectUri", "url")}
          <p class="hint">Use the client ID provided by Walker. The redirect URI must exactly match the registered callback URL for this demo.</p>
        </article>

        <article class="panel">
          <div class="panel-title">
            <span>2</span>
            <h2>Connect Walker user</h2>
          </div>
          ${input("Partner user ID", "externalUserId")}
          <button data-action="hosted-connect" ${state.clientId ? "" : "disabled"}>Open hosted Walker consent</button>
          <button data-action="open-walker" ${state.clientId ? "" : "disabled"} class="secondary">Open Walker app shortcut</button>
          <button data-action="dev-connect" ${state.clientId ? "" : "disabled"} class="secondary">Dev connection</button>
          ${input("Connection token", "connectionToken")}
          <p class="hint">Hosted consent works cross-platform; the app shortcut only works on devices with Walker installed.</p>
        </article>

        <article class="panel balance-panel">
          <div class="panel-title">
            <span>3</span>
            <h2>Read wallet</h2>
          </div>
          <button data-action="refresh" ${state.connectionToken ? "" : "disabled"}>Refresh wallet</button>
          <div class="balance">${balance ? balance.creditBalance.toLocaleString() : "--"}</div>
          <p class="hint">credits available</p>
          <div class="stats">
            <span>Earned <strong>${balance ? balance.totalCreditsEarned.toLocaleString() : "--"}</strong></span>
            <span>Spent <strong>${balance ? balance.totalCreditsSpent.toLocaleString() : "--"}</strong></span>
          </div>
        </article>

        <article class="panel">
          <div class="panel-title">
            <span>4</span>
            <h2>Spend credits</h2>
          </div>
          ${input("Amount", "spendAmount", "number")}
          ${input("Reason", "spendReason")}
          <button data-action="spend" ${state.connectionToken ? "" : "disabled"}>Spend credits</button>
        </article>
      </section>

      <section class="panel transactions">
        <div class="panel-title">
          <span>5</span>
          <h2>Transactions</h2>
        </div>
        ${transactions.length ? transactions.map(transactionRow).join("") : `<p class="hint">No transactions loaded yet.</p>`}
      </section>
    </section>
  `;

  bindEvents(app);
}

function transactionRow(transaction: WalletTransaction): string {
  const sign = transaction.amount >= 0 ? "+" : "";
  return `
    <div class="transaction">
      <span>${escapeHtml(transaction.reason)}</span>
      <strong>${sign}${transaction.amount.toLocaleString()}</strong>
    </div>
  `;
}

function bindEvents(root: HTMLElement): void {
  root.querySelectorAll<HTMLInputElement>("input[data-key]").forEach((element) => {
    element.addEventListener("input", () => {
      updateState(element.dataset.key as keyof DemoState, element.value);
    });
  });
  root.querySelector<HTMLElement>('[data-action="hosted-connect"]')?.addEventListener("click", openHostedConnect);
  root.querySelector<HTMLElement>('[data-action="open-walker"]')?.addEventListener("click", openWalkerApp);
  root.querySelector<HTMLElement>('[data-action="dev-connect"]')?.addEventListener("click", () => void useDevConnection());
  root.querySelector<HTMLElement>('[data-action="refresh"]')?.addEventListener("click", () => void refreshWallet());
  root.querySelector<HTMLElement>('[data-action="spend"]')?.addEventListener("click", () => void spendCredits());
  root.querySelector<HTMLElement>('[data-action="reset"]')?.addEventListener("click", resetDemo);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

captureCallback();
render();
