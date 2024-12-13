import "virtual:uno.css";

import { RouterProvider } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { setAutoFreeze } from "immer";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import { ClerkProvider } from "@clerk/clerk-react";

import "~/assets/styles/global.scss";

import { ApplicationStateProvider } from "~/stores/application-state";

import { router } from "~@/router";
import { initializeHead } from "~@/unhead";

initializeHead();

ReactGA.initialize("G-CJM5ZGWSKN");

OverlayScrollbars.plugin(ClickScrollPlugin);

setAutoFreeze(false);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <ApplicationStateProvider>
                <RouterProvider router={router} />

                <Analytics />
            </ApplicationStateProvider>
        </ClerkProvider>
    </React.StrictMode>,
);
