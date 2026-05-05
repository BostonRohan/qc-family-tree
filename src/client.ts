import { initBotId } from "botid/client/core";

export function init() {
  initBotId({
    protect: [
      {
        path: "/api/subscribe",
        method: "POST",
      },
    ],
  });
}

// Initialize on import
init();
