import React, { useState } from 'react'
import LiveOrders from '../../components/dashboard/LiveOrders'
import OrderDetailsModal from '../../components/dashboard/OrderDetailsModal'

const Orders = () => {
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalHandlers, setModalHandlers] = useState({
        onStatusUpdate: null,
        getStatusColor: null
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Order Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage and fulfill active orders in real-time.</p>
                </div>
            </div>

            {/* Live Orders Section - Reusing the component */}
            <LiveOrders onSelectOrder={(order, handler, getter) => {
                setSelectedOrder(order)
                setModalHandlers({ onStatusUpdate: handler, getStatusColor: getter })
            }} />

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={(id, status, driver) => {
                    if (modalHandlers.onStatusUpdate) {
                        modalHandlers.onStatusUpdate(id, status, driver).then(updatedOrder => {
                            if (updatedOrder) {
                                setSelectedOrder(updatedOrder)
                            }
                        })
                    }
                }}
                getStatusColor={modalHandlers.getStatusColor}
            />
        </div>
    )
}

export default Orders
