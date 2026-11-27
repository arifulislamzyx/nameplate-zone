"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { FB_PIXEL_ID, fbPageView } from "@/lib/fbpixel";

/** Loads the Meta Pixel base code and sends PageView on every client-side route change. */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRender = useRef(true);

  useEffect(() => {
    // The base snippet already sends the first PageView.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    fbPageView();
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
