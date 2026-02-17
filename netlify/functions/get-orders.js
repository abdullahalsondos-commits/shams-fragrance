// netlify/functions/get-orders.js

exports.handler = async (event, context) => {
    try {
        // ✅ لازم يطابق أسماء Environment Variables في Netlify
        const token = process.env.NETLIFY_ACCESS_TOKEN;
        const siteId = process.env.NETLIFY_SITE_ID;

        if (!token || !siteId) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    error: "Missing NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID",
                    got: {
                        NETLIFY_ACCESS_TOKEN: Boolean(token),
                        NETLIFY_SITE_ID: Boolean(siteId),
                    },
                }),
            };
        }

        // 1) Get forms for this site
        const formsRes = await fetch(`https://api.netlify.com/api/v1/forms?site_id=${siteId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!formsRes.ok) {
            const txt = await formsRes.text();
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Failed to list forms", details: txt }),
            };
        }

        const forms = await formsRes.json();

        // ✅ لو عندك FORM_NAME في env استخدمه
        const formName = process.env.FORM_NAME || "order";
        const orderForm = forms.find((f) => f.name === formName);

        if (!orderForm) {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: `Form "${formName}" not found on this site` }),
            };
        }

        // 2) Get submissions
        const subsRes = await fetch(
            `https://api.netlify.com/api/v1/forms/${orderForm.id}/submissions?per_page=100`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!subsRes.ok) {
            const txt = await subsRes.text();
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Failed to list submissions", details: txt }),
            };
        }

        const submissions = await subsRes.json();

        // 3) Normalize to your admin dashboard format
        const orders = submissions
            .map((s) => {
                const d = s.data || {};
                let items = [];
                try {
                    items = JSON.parse(d.order_items_json || "[]");
                } catch (_) {
                    items = [];
                }

                const totalNum = parseFloat(String(d.order_total || "0").replace(/[^\d.]/g, "")) || 0;
                const subNum = parseFloat(String(d.order_subtotal || "0").replace(/[^\d.]/g, "")) || 0;

                // shipping: FREE or number
                let shipNum = 0;
                const shipRaw = String(d.order_shipping || "");
                if (shipRaw.toUpperCase().includes("FREE")) shipNum = 0;
                else shipNum = parseFloat(shipRaw.replace(/[^\d.]/g, "")) || 0;

                return {
                    id: d.order_id || s.id,
                    date: d.order_date || s.created_at || new Date().toISOString(),
                    status: d.order_status || "pending",
                    customerName: d.customer_name || "",
                    customerPhone: d.customer_phone || "",
                    customerGov: d.customer_gov || "",
                    customerAddress: d.customer_address || "",
                    customerEmail: d.customer_email || "",
                    orderItems: items,
                    subtotal: subNum,
                    shipping: shipNum,
                    total: totalNum,
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
            },
            body: JSON.stringify({ orders }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Server error", details: String(err) }),
        };
    }
};
