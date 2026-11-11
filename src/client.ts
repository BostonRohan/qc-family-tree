import { initBotId } from "botid/client/core";

export function init() {
  initBotId({
    protect: [
      {
        path: "/api/subscribe",
        method: "POST",
      },
      {
        path: "/api/paypal/create-subscription-plan",
        method: "POST",
      },
    ],
  });
}

// Initialize on import
init();
