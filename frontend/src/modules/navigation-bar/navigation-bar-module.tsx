import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";

import { useFlowValidator } from "~/modules/flow-builder/hooks/use-flow-validator";
import { useWorkflowState } from "~/modules/flow-builder/hooks/use-workflow-state";
import { useApplicationState } from "~/stores/application-state";

import { Switch } from "~@/components/generics/switch-case";
import { Whenever } from "~@/components/generics/whenever";
import { cn } from "~@/utils/cn";

export function NavigationBarModule() {
    const { getWorkflowData } = useWorkflowState();
    const workflowData = getWorkflowData();
    const [isMobileView] = useApplicationState(s => [s.view.mobile]);

    const [isValidating, validateFlow] = useFlowValidator((isValid) => {
        if (isValid) toast.success("Flow is valid", { description: "You can now proceed to the next step", dismissible: true });
        else toast.error("Flow is invalid", { description: "Please check if the flow is complete and has no lone nodes" });
    });

    async function handleExecuteFlow() {
        validateFlow();
        try {
            const coinHoldings = [
                { id: "btc-bitcoin", name: "Bitcoin", holding: 38.09 },
                { id: "eth-ethereum", name: "Ethereum", holding: 22.36 },
                { id: "ada-cardano", name: "Cardano", holding: 29.76 },
                { id: "sol-solana", name: "Solana", holding: 44.9 },
                { id: "dot-polkadot", name: "Polkadot", holding: 9.83 },
                { id: "xrp-xrp", name: "Ripple", holding: 2.95 },
                { id: "ltc-litecoin", name: "Litecoin", holding: 33.12 },
                { id: "bnb-binance-coin", name: "Binance Coin", holding: 4.07 },
                { id: "link-chainlink", name: "Chainlink", holding: 21.04 },
                { id: "doge-dogecoin", name: "Dogecoin", holding: 36.64 },
            ];
            const baseUrl = "https://api.coinpaprika.com/v1";

            // Fetch basic coin details and market data
            const coinDetails = await Promise.all(coinHoldings.map(coin => axios.get(`${baseUrl}/coins/${coin.id}`)));
            const marketData = await Promise.all(coinHoldings.map(coin => axios.get(`${baseUrl}/tickers/${coin.id}`)));

            // Fetch latest crypto news from CryptoCompare
            const newsResponse = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", {
                params: { lang: "EN" },
                headers: { Authorization: `Apikey 45772842c9a7895b7e8798091cd51fcf2ad6e384ed9482894911f54d5e89b965` },
            });

            const latestNews = newsResponse.data.Data.slice(0, 5); // Get top 5 news articles

            // Format coin data for WhatsApp
            const coinMessage = coinHoldings
                .map((coin, index) => {
                    const market = marketData[index].data;
                    const detail = coinDetails[index].data;

                    const currentValue = (coin.holding * market.quotes.USD.price).toFixed(2);

                    return (
                        `*${detail.name} (${detail.symbol})*
    `
                        + `💰 Current Price: $${market.quotes.USD.price.toFixed(2)}
    `
                        + `📈 24h Change: ${market.quotes.USD.percent_change_24h.toFixed(2)}%
    `
                        + `📊 Market Cap: $${market.quotes.USD.market_cap.toLocaleString()}
    `
                        + `🏆 All-Time High: $${market.quotes.USD.ath_price.toFixed(2)}
    `
                        + `💼 Holding: ${coin.holding} units
    `
                        + `💸 Total Value: $${currentValue}
    \n`
                    );
                })
                .join("");

            // Format news data for WhatsApp
            const newsMessage = latestNews
                .map((news) => {
                    return `📰 *${news.title}*
    ${news.url}`;
                })
                .join("\n\n");

            // Combine coin data and news into the WhatsApp message
            const finalMessage = `🪙 *Crypto Portfolio Update* 🪙\n\n${coinMessage}🔔 *Latest Crypto News:*\n\n${newsMessage}\n\n⚡ Powered by MerlinFlow`;

            console.log("WhatsApp Message:");
            console.log(finalMessage);

            // Send to backend
            await axios.post("http://localhost:3000/api/executeFlow", {
                config: workflowData,
            });

            toast.success("Flow executed successfully");
        } catch (error) {
            console.error("Error fetching crypto data or news:", error);
            toast.error("Failed to execute flow");
        }
    }

    return (
        <div className="relative shrink-0 bg-dark-700 px-1.5 py-2">
            <div className="absolute inset-0">
                <div className="absolute h-full w-4/12 from-teal-900/20 to-transparent bg-gradient-to-r <md:(from-teal-900/50)" />
            </div>

            <div className="relative flex items-stretch justify-between gap-x-8">
                <div className="flex items-center py-0.5 pl-2">
                    <div className="size-8 flex shrink-0 select-none items-center justify-center rounded-lg bg-teal-600 text-sm font-bold leading-none">
                        <span className="translate-y-px">A</span>
                    </div>

                    <div className="ml-3 h-full flex flex-col select-none justify-center gap-y-1 leading-none">
                        <div className="text-sm font-medium leading-none <md:(text-xs)">Merlin Flow</div>

                        <div className="text-xs text-light-50/60 leading-none">By Merlin ke Rakshak</div>
                    </div>
                </div>

                <Whenever condition={isMobileView} not>
                    <div className="flex items-center justify-end gap-x-2">
                        <button
                            type="button"
                            className={cn(
                                "h-full flex items-center justify-center outline-none gap-x-2 border border-dark-300 rounded-lg bg-dark-300/50 px-3 text-sm transition active:(bg-dark-400) hover:(bg-dark-200)",
                                isValidating && "cursor-not-allowed op-50 pointer-events-none",
                            )}
                            onClick={handleExecuteFlow}
                        >
                            <Switch match={isValidating}>
                                <Switch.Case value>
                                    <div className="i-svg-spinners:180-ring size-5" />
                                </Switch.Case>
                                <Switch.Case value={false}>
                                    <div className="i-mynaui:check-circle size-5" />
                                </Switch.Case>
                            </Switch>
                            <span className="pr-0.5">{isValidating ? "Executing Flow" : "Execute Flow"}</span>
                        </button>

                        <div className="h-4 w-px bg-dark-300" />

                        <div className="h-full flex items-center">
                            <SignedOut>
                                <SignInButton mode="modal" forceRedirectUrl="/">
                                    <button
                                        type="button"
                                        className="h-full flex items-center justify-center gap-x-2 border border-dark-300 rounded-lg bg-dark-300/50 px-3 text-sm outline-none transition active:(bg-dark-400) hover:(bg-dark-200)"
                                    >
                                        <div className="i-lucide:log-in size-5" />
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-8 h-8",
                                        },
                                    }}
                                />
                            </SignedIn>
                        </div>
                    </div>
                </Whenever>
            </div>
        </div>
    );
}
