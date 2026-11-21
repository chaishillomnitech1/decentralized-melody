import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Banknote, Bitcoin, History, Copy, Check } from "lucide-react";

// Buyer checkout: PayPal, Cash App, Coinbase. Stripe is NOT in the buyer
// path (the server answers 410 for every Stripe endpoint) and the old
// simulated payment is gone. Test/demo mode only: no real payment is taken
// and no real NFT is minted or moved.

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    artist: string;
  };
  userId?: number;
}

type Rail = "paypal" | "cashapp" | "coinbase";

type PaymentOptions = {
  stripe: { configured: boolean; disabled: boolean; message: string };
  paypal: { configured: boolean };
  cashApp: { handle: string };
  coinbase: { configured: boolean };
};

type LedgerEntry = {
  id: string;
  date: string;
  type: string;
  rail: string;
  amount: number;
  currency: string;
  item: string;
  status: string;
  reference?: string | null;
  demo: boolean;
};

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function PaymentModal({ isOpen, onClose, nft, userId }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rail, setRail] = useState<Rail | null>(null);
  const [options, setOptions] = useState<PaymentOptions | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [cashAppDone, setCashAppDone] = useState(false);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const price = parseFloat(nft.price) || 0;
  const cashAppInstruction = `Pay $${nft.price} to $chaisthegreat28 in Cash App`;

  useEffect(() => {
    if (!isOpen) return;
    setNotice(null);
    setApprovalUrl(null);
    setCashAppDone(false);
    setRail(null);
    fetch("/api/payment-options")
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => setOptions(null));
    fetch("/api/ledger")
      .then((r) => r.json())
      .then((d) => setHistory(d.entries || []))
      .catch(() => setHistory([]));
  }, [isOpen]);

  const refreshHistory = () => {
    fetch("/api/ledger")
      .then((r) => r.json())
      .then((d) => setHistory(d.entries || []))
      .catch(() => undefined);
  };

  const handlePayPal = async () => {
    if (!options?.paypal.configured) {
      setNotice("PayPal is not connected yet. The owner can enable it by adding PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Secrets.");
      return;
    }
    setIsProcessing(true);
    setNotice(null);
    const { ok, data } = await postJson("/api/paypal/create-order", {
      amount: price,
      currency: "USD",
      item: nft.title,
      buyerEmail: buyerEmail || undefined,
    });
    setIsProcessing(false);
    if (!ok) {
      setNotice((data as { error?: string }).error || "PayPal order creation failed.");
      return;
    }
    const url = (data as { approvalUrl?: string }).approvalUrl;
    if (url) {
      setApprovalUrl(url);
      window.open(url, "_blank", "noopener");
    }
    toast({ title: "PayPal order created", description: "Approve the payment in PayPal to complete it (test/demo mode)." });
    refreshHistory();
  };

  const handleCoinbase = async () => {
    if (!options?.coinbase.configured) {
      setNotice("Coinbase is not connected yet. The owner can enable it by adding the Coinbase Commerce API key in Secrets.");
      return;
    }
    setIsProcessing(true);
    setNotice(null);
    const { ok, data } = await postJson("/api/coinbase/create-charge", {
      amount: price,
      currency: "USD",
      item: nft.title,
      buyerEmail: buyerEmail || undefined,
    });
    setIsProcessing(false);
    if (!ok) {
      setNotice((data as { error?: string }).error || "Coinbase charge creation failed.");
      return;
    }
    const url = (data as { hostedUrl?: string }).hostedUrl;
    if (url) {
      setApprovalUrl(url);
      window.open(url, "_blank", "noopener");
    }
    toast({ title: "Coinbase charge created", description: "Complete the payment on the Coinbase checkout page (test/demo mode)." });
    refreshHistory();
  };

  const handleCashAppConfirm = async () => {
    setIsProcessing(true);
    setNotice(null);
    const { ok, data } = await postJson("/api/ledger/record", {
      amount: price,
      currency: "USD",
      rail: "cashapp",
      item: nft.title,
      buyerContact: buyerEmail || undefined,
      status: "pending-manual-unverified",
      reference: "cashapp:$chaisthegreat28",
      type: "payment",
    });
    setIsProcessing(false);
    if (!ok) {
      setNotice((data as { error?: string }).error || "Could not record the Cash App payment.");
      return;
    }
    setCashAppDone(true);
    toast({
      title: "Cash App payment recorded as pending",
      description: "The seller must verify the Cash App payment before delivering the NFT.",
    });
    refreshHistory();
  };

  const copyInstruction = async () => {
    try {
      await navigator.clipboard.writeText(cashAppInstruction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice(cashAppInstruction);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase NFT</DialogTitle>
          <DialogDescription>Choose how to pay for this NFT. Test/demo checkout — no real payment is taken and no real NFT is minted or moved.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <img src={nft.imageUrl} alt={nft.title} className="w-20 h-20 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold">{nft.title}</h3>
              <p className="text-sm text-muted-foreground">by {nft.artist}</p>
              <p className="text-lg font-bold mt-1">{nft.price} ETH</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="buyer-email">Your email (optional — for the receipt and ledger)</label>
            <input id="buyer-email" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="you@example.com" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant={rail === "paypal" ? "default" : "outline"} onClick={() => { setRail("paypal"); setNotice(null); }}>
                <CreditCard className="mr-1 h-4 w-4" /> PayPal
              </Button>
              <Button type="button" variant={rail === "cashapp" ? "default" : "outline"} onClick={() => { setRail("cashapp"); setNotice(null); }}>
                <Banknote className="mr-1 h-4 w-4" /> Cash App
              </Button>
              <Button type="button" variant={rail === "coinbase" ? "default" : "outline"} onClick={() => { setRail("coinbase"); setNotice(null); }}>
                <Bitcoin className="mr-1 h-4 w-4" /> Coinbase
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Stripe checkout is disabled. Use PayPal, Cash App, or Coinbase.</p>
          </div>

          {notice && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm">{notice}</div>
          )}

          {rail === "paypal" && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">Pay with PayPal</p>
              {options && !options.paypal.configured ? (
                <p className="text-sm text-muted-foreground">PayPal is not connected yet. The owner can enable it by adding PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Secrets.</p>
              ) : (
                <p className="text-sm text-muted-foreground">A PayPal order will be created for ${nft.price}. Approve it in PayPal to complete the purchase.</p>
              )}
              <Button onClick={handlePayPal} disabled={isProcessing || !options?.paypal.configured} className="w-full" size="lg">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Pay with PayPal
              </Button>
              {approvalUrl && (
                <a href={approvalUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm underline">Open the PayPal approval page</a>
              )}
            </div>
          )}

          {rail === "cashapp" && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">Pay with Cash App</p>
              <p className="text-sm font-semibold">{cashAppInstruction}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyInstruction}>
                  {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                  {copied ? "Copied" : "Copy instruction"}
                </Button>
                <a href="https://cash.app/$chaisthegreat28" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">Open Cash App</a>
              </div>
              <p className="text-xs text-muted-foreground">Cash App payments are manual: pay in Cash App, then confirm below. The payment is recorded as pending and unverified until the seller checks Cash App.</p>
              <Button onClick={handleCashAppConfirm} disabled={isProcessing || cashAppDone} className="w-full" size="lg">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
                {cashAppDone ? "Cash App payment recorded" : "I have paid in Cash App"}
              </Button>
            </div>
          )}

          {rail === "coinbase" && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">Pay with Coinbase</p>
              {options && !options.coinbase.configured ? (
                <p className="text-sm text-muted-foreground">Coinbase is not connected yet. The owner can enable it by adding the Coinbase Commerce API key in Secrets.</p>
              ) : (
                <p className="text-sm text-muted-foreground">A Coinbase Commerce charge will be created for ${nft.price}. Complete it on the Coinbase checkout page.</p>
              )}
              <Button onClick={handleCoinbase} disabled={isProcessing || !options?.coinbase.configured} className="w-full" size="lg">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bitcoin className="mr-2 h-4 w-4" />}
                Pay with Coinbase
              </Button>
              {approvalUrl && (
                <a href={approvalUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm underline">Open the Coinbase checkout page</a>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowHistory((v) => !v)}>
              <History className="mr-1 h-4 w-4" /> {showHistory ? "Hide transaction history" : "View transaction history"}
            </Button>
            {showHistory && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                {history.length === 0 ? (
                  <p className="text-muted-foreground">No transactions recorded yet.</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex justify-between gap-2 border-b py-1 last:border-0">
                      <span>{new Date(entry.date).toLocaleString()} — {entry.item}</span>
                      <span>{entry.amount} {entry.currency} · {entry.rail} · {entry.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">Test/demo checkout. Buyer and seller flows are recorded in the app ledger; no real money moves until the owner connects a payment account.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
