import React, { useState } from 'react';

const ManageMenuPizza1 = () => {
    // Initial State mimicking DB
    const [items, setItems] = useState([
        { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800' },
        { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800' },
        { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800' },
        { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800' },
        { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800' },
        { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800' },
        { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800' },
        { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, category: 'Special', categoryColor: 'bg-orange-100 text-orange-800' },
    ]);

    const handlePriceChange = (id, newPrice) => {
        setItems(items.map(i => i.id === id ? { ...i, price: parseFloat(newPrice) || 0 } : i));
    };

    const handleSave = () => {
        alert('Changes saved! (Mock Action)');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Menu Management</h1>
                    <p className="text-gray-500 text-sm md:text-base">Manage your restaurant's menu items. Update descriptions, categories, and adjust unit prices.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                    Save Changes
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Item Name</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Category</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Description</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest w-32">Unit Price (€)</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                <td className="p-6 font-bold text-gray-900 dark:text-white">{item.name}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.categoryColor}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-6 text-sm text-gray-500 max-w-md truncate" title={item.description}>
                                    {item.description}
                                </td>
                                <td className="p-6">
                                    <div className="relative w-32">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-bold">€</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-gray-100 hover:border-gray-300 focus:border-blue-500 dark:border-gray-700 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700/50 font-mono font-bold text-gray-900 dark:text-white transition-all outline-none"
                                        />
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <button className="text-blue-500 hover:text-blue-600 font-bold text-sm">Edit Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageMenuPizza1;
