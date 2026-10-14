export class AnalyticsManager {
    static init(measurementId) {
        window.dataLayer ||= [];
        AnalyticsManager._send("js", new Date());
        AnalyticsManager._send("config", measurementId, { send_page_view: false });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.append(script);
    }

    static trackPageView(path) {
        AnalyticsManager._send("event", "page_view", { page_location: location.origin + path });
    }

    static _send() {
        // Must be `arguments`
        window.dataLayer.push(arguments);
    }
}
