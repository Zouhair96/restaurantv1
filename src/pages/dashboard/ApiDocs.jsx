import React from 'react'

const ApiDocs = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white">Integration & Payments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Configure your split payments, connect your POS, and manage your restaurant's automated revenue flow.
                    </p>
                </div>
                <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide">
                        API Version 1.0
                    </span>
                </div>
            </div>

            {/* Introduction */}
            <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Payment & Commission Logic</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Our platform automates revenue collection for both online and physical orders. Here is how our <strong>98/2 Split System</strong> works for your restaurant:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-500/5 rounded-3xl border border-green-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💳</span>
                            <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tight">Online Card Payments</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                            <li className="flex gap-2"><span>•</span> <strong>Instant Settlement</strong>: Funds are split at the moment of purchase.</li>
                            <li className="flex gap-2"><span>•</span> <strong>98% to You</strong>: Sent directly to your connected bank via Stripe.</li>
                            <li className="flex gap-2"><span>•</span> <strong>2% Fee</strong>: Automatically deducted for platform service.</li>
                        </ul>
                    </div>
                    <div className="p-6 bg-orange-500/5 rounded-3xl border border-orange-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💵</span>
                            <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tight">Physical Cash Orders</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                            <li className="flex gap-2"><span>•</span> <strong>Full Receipt</strong>: You collect 100% of the cash from the customer.</li>
                            <li className="flex gap-2"><span>•</span> <strong>Owed Balance</strong>: A 2% debt is recorded in your dashboard.</li>
                            <li className="flex gap-2"><span>•</span> <strong>Monthly Billing</strong>: We bill your balance at the end of each cycle.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Developer Integration</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Receive real-time notifications whenever a new order is placed, regardless of the POS system you use.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mb-3">1</div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Generate Key</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Create an API Key in Integration Settings.</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold mb-3">2</div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Configure Webhook</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Provide the URL where you want to receive orders.</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mb-3">3</div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Receive Orders</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">We send a POST request with JSON data instantly.</p>
                    </div>
                </div>
            </div>

            {/* Webhook Payload */}
            <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="text-purple-500">POST</span>
                    Order Webhook Payload
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                    When a new order is created, we send a HTTP POST request to your configured <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-pink-500">pos_webhook_url</code>.
                </p>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Request Headers</h4>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-gray-300">
                                {`Content-Type: application/json
Authorization: Bearer <YOUR_POS_API_KEY>
X-DigiMenu-Platform: v1`}
                            </pre>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">JSON Body Example</h4>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative group">
                            <pre className="text-xs font-mono text-green-400">
                                {`{
  "platform_info": {
    "name": "DigiMenu",
    "version": "1.0.0"
  },
  "order_data": {
    "id": "ord_123456789",
    "restaurant_id": 15,
    "order_type": "dine_in",   // or "take_out"
    "table_number": "12",      // null if take_out
    "delivery_address": null,  // string if take_out
    "payment_method": "credit_card",
    "payment_status": "paid",   // "paid" (Stripe) or "pending_cash" (Cash)
    "commission_amount": 0.26,  // platform fee (2%)
    "items": [
      {
        "id": 101,
        "name": "Double Cheeseburger",
        "quantity": 1,
        "price": 12.99,
        "modifiers": ["No Onions", "Extra Cheese"]
      }
    ],
    "total_price": 12.99,
    "created_at": "2024-03-20T14:30:00.000Z",
    "customer_id": "cust_987654321" // null if guest
  }
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expected Response */}
            <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Expected Response</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Your server must respond with a <code className="text-green-600 font-bold">200 OK</code> status code within 10 seconds. You may optionally include an external ID in the response body to link the order.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-blue-400">
                        {`{
  "success": true,
  "external_id": "POS_ORDER_999" // Optional: Your system's order ID
}`}
                    </pre>
                </div>
            </div>

            {/* Code Examples */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Implementation Examples</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Node.js / Express */}
                    <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-3">Node.js (Express)</h3>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto h-64 custom-scrollbar">
                            <pre className="text-xs font-mono text-gray-300">
                                {`app.post('/webhook/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  
  // 1. Verify API Key
  if (authHeader !== 'Bearer YOUR_SECRET_KEY') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Process Order
  const { order_data } = req.body;
  console.log('New Order:', order_data.id);

  // 3. Respond
  res.json({ 
    success: true,
    external_id: 'LOCAL_ID_' + Date.now() 
  });
});`}
                            </pre>
                        </div>
                    </div>

                    {/* Python / Flask */}
                    <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-3">Python (Flask)</h3>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto h-64 custom-scrollbar">
                            <pre className="text-xs font-mono text-gray-300">
                                {`from flask import Flask, request, jsonify

@app.route('/webhook/orders', methods=['POST'])
def handle_order():
    # 1. Verify API Key
    auth_header = request.headers.get('Authorization')
    if auth_header != 'Bearer YOUR_SECRET_KEY':
        return jsonify({'error': 'Unauthorized'}), 401

    # 2. Process Order
    data = request.json
    order = data.get('order_data')
    print(f"Processing order {order['id']}")

    # 3. Respond
    return jsonify({
        'success': True, 
        'external_id': 'POS_999'
    }), 200`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApiDocs
