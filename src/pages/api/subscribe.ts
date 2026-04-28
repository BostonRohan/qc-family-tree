import type { APIRoute } from "astro";
import { checkBotId } from "botid/server";

const MAILCHIMP_QCFT_API_KEY = import.meta.env.MAILCHIMP_QCFT_API_KEY;
const MAILCHIMP_QCFT_SERVER = import.meta.env.MAILCHIMP_QCFT_SERVER;
const QCFT_LIST_ID = import.meta.env.MAILCHIMP_QCFT_LIST_ID;

const MAILCHIMP_HFGBC_API_KEY = import.meta.env.MAILCHIMP_HFGBC_API_KEY;
const MAILCHIMP_HFGBC_SERVER = import.meta.env.MAILCHIMP_HFGBC_SERVER;
const HFGBC_LIST_ID = import.meta.env.MAILCHIMP_HFGBC_LIST_ID;

export const POST: APIRoute = async ({ request }) => {
  const verification = await checkBotId();

  if (verification.isBot) {
    return new Response(JSON.stringify({ message: "Access denied" }), {
      status: 403,
    });
  }

  try {
    const body = await request.json();
    const { email, list } = body;

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
      });
    }

    const isHfgb = list === "hfgb";
    const apiKey = isHfgb ? MAILCHIMP_HFGBC_API_KEY : MAILCHIMP_QCFT_API_KEY;
    const server = isHfgb ? MAILCHIMP_HFGBC_SERVER : MAILCHIMP_QCFT_SERVER;
    const listId = isHfgb ? HFGBC_LIST_ID : QCFT_LIST_ID;

    if (!apiKey || !server || !listId) {
      return new Response(
        JSON.stringify({ message: "Mailchimp not configured" }),
        {
          status: 500,
        },
      );
    }

    const response = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
        }),
      },
    );

    if (response.status >= 400) {
      const data = await response.json();
      if (data.title === "Member Exists") {
        return new Response(
          JSON.stringify({ message: "You're already subscribed!" }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({ message: data.detail || "Subscription failed" }),
        { status: 400 },
      );
    }

    return new Response(
      JSON.stringify({ message: "Successfully subscribed!" }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
};
