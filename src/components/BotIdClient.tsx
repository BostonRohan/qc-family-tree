import { BotIdClient as BotIdClientComponent } from "botid/client";

const protectedRoutes = [
  { path: "/api/subscribe", method: "POST" },
  { path: "/api/paypal/create-subscription-plan", method: "POST" },
];

export default function BotIdClient() {
  return <BotIdClientComponent protect={protectedRoutes} />;
}
