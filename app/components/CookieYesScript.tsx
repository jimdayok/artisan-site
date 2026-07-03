import Script from "next/script";

const COOKIEYES_SCRIPT =
  "https://cdn-cookieyes.com/client_data/e83ecccf3618d9b417487e7baad2c2f1/script.js";

export default function CookieYesScript() {
  return (
    <Script
      id="cookieyes-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            var hosts = { "www.artisanslabs.com": true, "artisanslabs.com": true };
            if (!hosts[window.location.hostname]) return;
            var script = document.createElement("script");
            script.id = "cookieyes";
            script.src = "${COOKIEYES_SCRIPT}";
            document.head.appendChild(script);
          })();
        `,
      }}
    />
  );
}
