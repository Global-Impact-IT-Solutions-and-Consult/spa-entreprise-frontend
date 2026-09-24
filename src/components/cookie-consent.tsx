"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cookie } from "lucide-react";

export const COOKIE_CONSENT_KEY = "ibookam_cookie_consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "ibookam:open-cookie-settings";

type ConsentChoice = "accepted" | "rejected";

function clearAnalyticsCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name || (name !== "_ga" && !name.startsWith("_ga_"))) return;

    const hostname = window.location.hostname;
    const domains = ["", hostname, `.${hostname}`];
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}; SameSite=Lax`;
    });
  });
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialiseConsent = window.setTimeout(() => {
      const storedChoice = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (storedChoice === "accepted" || storedChoice === "rejected") {
        setChoice(storedChoice);
      } else {
        setIsOpen(true);
      }
    }, 0);

    const openSettings = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => {
      window.clearTimeout(initialiseConsent);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const saveChoice = (nextChoice: ConsentChoice) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, nextChoice);
    setChoice(nextChoice);
    setIsOpen(false);

    if (nextChoice === "rejected") clearAnalyticsCookies();
  };

  return (
    <>
      {choice === "accepted" && gaId ? <GoogleAnalytics gaId={gaId} /> : null}

      {isOpen ? (
        <section
          aria-label="Cookie preferences"
          aria-live="polite"
          className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[100] mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-4 shadow-2xl md:bottom-5 md:p-5"
        >
          <div className="flex gap-3">
            <Cookie aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#E89D24]" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-950">Your cookie choices</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                iBookam uses essential storage for sign-in, security, saved preferences, and core site features. With your permission, we also use Google Analytics to understand how the site is used.
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Learn more in our{" "}
                <Link href="/privacy" className="font-semibold text-[#C77D0A] underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => saveChoice("rejected")}
              className="h-11 rounded-md border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => saveChoice("accepted")}
              className="h-11 rounded-md bg-[#E89D24] px-5 text-sm font-semibold text-white transition hover:bg-[#D88C18]"
            >
              Accept analytics
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
