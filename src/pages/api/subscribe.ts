import type { APIRoute } from "astro";

const MAILCHIMP_API_KEY = import.meta.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER = import.meta.env.MAILCHIMP_SERVER;
const QCFT_LIST_ID = import.meta.env.MAILCHIMP_QCFT_LIST_ID;
const HFGBC_LIST_ID = import.meta.env.MAILCHIMP_HFGBC_LIST_ID;

export const POST: APIRoute = async ({ request }) => {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER) {
    return new Response(
      JSON.stringify({ message: "Mailchimp not configured" }),
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { email, list } = body;

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
      });
    }

    const listId = list === "hfgb" ? HFGBC_LIST_ID : QCFT_LIST_ID;

    if (!listId) {
      return new Response(JSON.stringify({ message: "List not configured" }), {
        status: 500,
      });
    }

    const response = await fetch(
      `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
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
