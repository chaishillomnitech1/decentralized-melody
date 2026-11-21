import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Owner payment rails: PayPal, Cash App, Coinbase. Stripe is NOT in the
// buyer path: every Stripe endpoint below answers 410 and charges nothing.
// No credentials are invented here; PayPal/Coinbase only activate when the
// owner adds their keys in Secrets. No real payments, mints, sales or
// trades happen in demo mode.
// ---------------------------------------------------------------------------

const LEDGER_FILE = path.join(process.cwd(), "server", "data", "transactions.json");
const CASH_APP_HANDLE = "$chaisthegreat28";

export type LedgerEntry = {
  id: string;
  date: string;
  type: string;
  rail: string;
  amount: number;
  currency: string;
  item: string;
  buyerContact?: string | null;
  sellerContact?: string | null;
  status: string;
  reference?: string | null;
  demo: boolean;
};

function readLedger(): LedgerEntry[] {
  try {
    if (!fs.existsSync(LEDGER_FILE)) return [];
    const raw = fs.readFileSync(LEDGER_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLedger(entries: LedgerEntry[]) {
  fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function recordLedger(entry: Omit<LedgerEntry, "id" | "date"> & { id?: string; date?: string }): LedgerEntry {
  const entries = readLedger();
  const full: LedgerEntry = {
    ...entry,
    id: entry.id || `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: entry.date || new Date().toISOString(),
  };
  entries.push(full);
  writeLedger(entries);
  return full;
}

function redact(entry: LedgerEntry) {
  return {
    ...entry,
    buyerContact: entry.buyerContact ? "provided (redacted)" : null,
    sellerContact: entry.sellerContact ? "provided (redacted)" : null,
  };
}

const STRIPE_DISABLED = {
  error: "Stripe checkout is disabled. Use PayPal, Cash App, or Coinbase.",
  paymentOptions: "/api/payment-options",
};

export function registerPaymentRoutes(app: Express) {
  // Buyer-facing payment options. Stripe is listed only as disabled.
  app.get("/api/payment-options", (_req: Request, res: Response) => {
    res.json({
      stripe: { configured: false, disabled: true, message: "Stripe checkout is disabled. Use PayPal, Cash App, or Coinbase." },
      paypal: { configured: Boolean(process.env.PAYPAL_CLIENT_ID) },
      cashApp: { handle: CASH_APP_HANDLE },
      coinbase: { configured: Boolean(process.env.COINBASE_COMMERCE_API_KEY) },
    });
  });

  // --- Stripe traffic is redirected, never charged ---
  app.post("/api/payment/create-intent", (_req: Request, res: Response) => {
    res.status(410).json(STRIPE_DISABLED);
  });
  app.post("/api/payment/confirm", (_req: Request, res: Response) => {
    res.status(410).json(STRIPE_DISABLED);
  });
  app.post("/api/webhooks/stripe", (_req: Request, res: Response) => {
    res.status(410).json({ error: "Stripe webhooks are disabled. Use PayPal, Cash App, or Coinbase." });
  });

  // --- PayPal: creates an order only when the owner connected PayPal ---
  app.post("/api/paypal/create-order", async (req: Request, res: Response) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !secret) {
      return res.status(503).json({ error: "PayPal is not connected yet. The owner can enable it by adding PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Secrets." });
    }
    const { amount, currency, item, buyerEmail } = req.body || {};
    const value = Number(amount);
    if (!value || value <= 0) return res.status(400).json({ error: "A valid amount is required." });
    try {
      const base = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
      const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
      });
      if (!tokenRes.ok) return res.status(502).json({ error: "PayPal authorization failed." });
      const token = (await tokenRes.json()) as { access_token: string };
      const orderRes = await fetch(`${base}/v2/checkout/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: currency || "USD", value: value.toFixed(2) }, description: String(item || "NFT purchase") }] }),
      });
      const order = (await orderRes.json()) as { id?: string; status?: string; links?: { rel: string; href: string }[] };
      if (!orderRes.ok) return res.status(502).json({ error: "PayPal order creation failed.", details: order });
      const approvalUrl = order.links?.find((l) => l.rel === "approve")?.href || null;
      const entry = recordLedger({ type: "payment", rail: "paypal", amount: value, currency: currency || "USD", item: String(item || "NFT purchase"), buyerContact: buyerEmail || null, status: "order_created", reference: order.id || null, demo: process.env.PAYPAL_MODE !== "live" });
      res.json({ orderId: order.id, approvalUrl, status: order.status, ledgerId: entry.id });
    } catch (error) {
      res.status(502).json({ error: "PayPal order creation failed." });
    }
  });

  // --- Coinbase Commerce: creates a charge only when the owner connected it ---
  app.post("/api/coinbase/create-charge", async (req: Request, res: Response) => {
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Coinbase is not connected yet. The owner can enable it by adding the Coinbase Commerce API key in Secrets." });
    }
    const { amount, currency, item, buyerEmail } = req.body || {};
    const value = Number(amount);
    if (!value || value <= 0) return res.status(400).json({ error: "A valid amount is required." });
    try {
      const chargeRes = await fetch("https://api.commerce.coinbase.com/charges", {
        method: "POST",
        headers: { "X-CC-Api-Key": apiKey, "X-CC-Version": "2018-03-22", "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(item || "NFT purchase"), description: String(item || "NFT purchase"), pricing_type: "fixed_price", local_price: { amount: value.toFixed(2), currency: currency || "USD" } }),
      });
      const charge = (await chargeRes.json()) as { data?: { id?: string; hosted_url?: string; code?: string } };
      if (!chargeRes.ok) return res.status(502).json({ error: "Coinbase charge creation failed.", details: charge });
      const entry = recordLedger({ type: "payment", rail: "coinbase", amount: value, currency: currency || "USD", item: String(item || "NFT purchase"), buyerContact: buyerEmail || null, status: "charge_created", reference: charge.data?.id || null, demo: false });
      res.json({ chargeId: charge.data?.id, hostedUrl: charge.data?.hosted_url, code: charge.data?.code, ledgerId: entry.id });
    } catch (error) {
      res.status(502).json({ error: "Coinbase charge creation failed." });
    }
  });

  // --- Ledger: the app's own transaction history ---
  app.get("/api/ledger", (_req: Request, res: Response) => {
    const entries = readLedger();
    res.json({ count: entries.length, entries: entries.map(redact) });
  });

  app.post("/api/ledger/record", (req: Request, res: Response) => {
    const { amount, currency, rail, item, buyerContact, sellerContact, status, reference, type } = req.body || {};
    const value = Number(amount);
    if (!value || value <= 0 || !rail || !item) {
      return res.status(400).json({ error: "amount, rail, and item are required to record a payment." });
    }
    const entry = recordLedger({ type: String(type || "payment"), rail: String(rail), amount: value, currency: String(currency || "USD"), item: String(item), buyerContact: buyerContact || null, sellerContact: sellerContact || null, status: String(status || "recorded"), reference: reference || null, demo: true });
    res.json({ entry: redact(entry) });
  });

  // --- Demo mint / sale listing / trade offer (test/demo only, no chain) ---
  app.post("/api/demo/mint", (req: Request, res: Response) => {
    const { title, price, currency, sellerEmail } = req.body || {};
    if (!title || !price) return res.status(400).json({ error: "title and price are required." });
    const nftId = `demo_nft_${Date.now()}`;
    const entry = recordLedger({ type: "mint", rail: "demo", amount: Number(price), currency: String(currency || "USD"), item: String(title), sellerContact: sellerEmail || null, status: "demo-mint-intent", reference: nftId, demo: true });
    res.json({ demo: true, nft: { id: nftId, title: String(title), price: Number(price), status: "demo-mint", chain: "none" }, ledgerId: entry.id });
  });

  app.post("/api/demo/list", (req: Request, res: Response) => {
    const { nftId, title, price, currency, sellerEmail } = req.body || {};
    if (!title || !price) return res.status(400).json({ error: "title and price are required." });
    const entry = recordLedger({ type: "listing", rail: "demo", amount: Number(price), currency: String(currency || "USD"), item: String(title), sellerContact: sellerEmail || null, status: "demo-listed", reference: nftId || null, demo: true });
    res.json({ demo: true, listing: { nftId: nftId || null, title: String(title), price: Number(price), status: "demo-listed" }, ledgerId: entry.id });
  });

  app.post("/api/demo/trade", (req: Request, res: Response) => {
    const { offerItem, askItem, fromEmail, toEmail } = req.body || {};
    if (!offerItem || !askItem) return res.status(400).json({ error: "offerItem and askItem are required." });
    const entry = recordLedger({ type: "trade", rail: "demo", amount: 0, currency: "USD", item: `${offerItem} for ${askItem}`, buyerContact: toEmail || null, sellerContact: fromEmail || null, status: "demo-trade-offer", reference: null, demo: true });
    res.json({ demo: true, trade: { offerItem: String(offerItem), askItem: String(askItem), status: "demo-trade-offer" }, ledgerId: entry.id });
  });
}
