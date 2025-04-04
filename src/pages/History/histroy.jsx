// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function OrdersList() {
//     const [orders, setOrders] = useState([]);
//     const [startDate, setStartDate] = useState(null);
//     const [endDate, setEndDate] = useState(null);

//     const fetchOrders = async (filtered = false) => {
//         try {
//             const params = filtered
//                 ? { 
//                     startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
//                     endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : null
//                 }
//                 : {}; 

//             const response = await axios.get('http://localhost:8080/api/get-order-basedDate', { params });

//             setOrders(response.data.data || []);
//         } catch (error) {
//             console.error('Error fetching orders:', error);
//         }
//     };

//     useEffect(() => {
//         fetchOrders(false);
//     }, []);

//     return (
//         <div className=" bg-black flex items-center justify-center p-1">
//             <div className="bg-white rounded-lg max-w-4xl w-full flex flex-col items-center justify-center relative border border-white-700 p-6 bg-gray-900 text-white">
//                 <h2 className="text-3xl text-center mb-6">Order History</h2>

//                 <div className="flex space-x-4 mb-6 justify-center">
                    
//                     <input 
//                         type="date" 
//                         value={startDate || ''} 
//                         onChange={(e) => setStartDate(e.target.value)} 
//                         className="p-2 rounded bg-gray-800 text-white border border-gray-600"
//                     />
//                     <input 
//                         type="date" 
//                         value={endDate || ''} 
//                         onChange={(e) => setEndDate(e.target.value)} 
//                         className="p-2 rounded bg-gray-800 text-white border border-gray-600"
//                     />
//                     <button 
//                         onClick={() => fetchOrders(true)} 
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                         Filter
//                     </button>
//                     <button 
//                         onClick={() => {
//                             setStartDate(null);
//                             setEndDate(null);
//                             fetchOrders(false);
//                         }} 
//                         className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//                     >
//                         Reset
//                     </button>
//                 </div>

//                 {/* Scrollable order list container */}
//                 <div className="w-full max-h-[300px] overflow-y-auto border border-white-700 rounded-lg p-4">
//                     {orders.length > 0 ? (
//                         <ul className="list-none pl-0">
//                             {orders.map((order, index) => (
//                                 <div key={index} className="mb-6 p-4 border border-gray-600 rounded bg-gray-800">
//                                     <h3 className="text-xl font-bold">Category: {order.name}</h3>
//                                     {(Array.isArray(order.products) ? order.products : []).map((item) => (
//                                         <div key={item._id} className="mb-4 p-4 border border-gray-600 rounded bg-gray-700">
//                                             <h3 className="text-xl font-bold">Order ID: {item._id}</h3>
//                                             <p className="text-sm">Payment Method: {item.paymentMethod || "N/A"}</p>
//                                             <p className="text-sm">Total Price: ${item.totalPrice || "0.00"}</p>
//                                             <p className="text-sm">Final Price: ${item.finalPrice || "0.00"}</p>
//                                             <p className="text-sm">
//                                                 Shipping Address: {item.shippingAddress?.address || "N/A"}, 
//                                                 {item.shippingAddress?.city || "N/A"}, 
//                                                 {item.shippingAddress?.postalCode || "N/A"}, 
//                                                 {item.shippingAddress?.country || "N/A"}
//                                             </p>
//                                             <h4 className="mt-2 text-lg font-semibold">Items:</h4>
//                                             <ul className="list-inside list-disc">
//                                                 {(Array.isArray(item.orderItems) ? item.orderItems : []).map((product) => (
//                                                     <li key={product._id} className="text-sm">
//                                                         {product.name} (x{product.amount}) - ${product.price}
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                             <p className="text-xs text-gray-400 mt-2">
//                                                 Ordered on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
//                                             </p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p className="text-gray-400">No orders found for the selected date range.</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(''); // New state for category filter

    const fetchOrders = async (filtered = false) => {
        try {
            const params = filtered
                ? { 
                    startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
                    endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : null
                }
                : {}; 

            const response = await axios.get('http://localhost:8080/api/get-order-basedDate', { params });
            const allOrders = response.data.data || [];
            response.data.data.map((relword)=>{
                relword.products.map((underWorld)=>{
                    console.log(underWorld);
                    
                });
            })

            console.log();
            setOrders(allOrders);
            setFilteredOrders(allOrders); // Set filtered orders to all orders initially
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders(false);
    }, []);

    // Function to filter by category
    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        if (category) {
            const filtered = orders.filter(order => order.name === category);
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders); // Reset to all orders if no category selected
        }
    };

    return (
        <div className=" bg-black flex items-center justify-center p-1">
            <div className="bg-white rounded-lg max-w-4xl w-full flex flex-col items-center justify-center relative border border-white-700 p-6 bg-gray-900 text-white">
                <h2 className="text-3xl text-center mb-6">Order History</h2>
                <div className="flex space-x-4 mb-6 justify-center">
                    <input 
                        type="date" 
                        value={startDate || ''} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="p-2 rounded bg-gray-800 text-white border border-gray-600"
                    />
                    <input 
                        type="date" 
                        value={endDate || ''} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="p-2 rounded bg-gray-800 text-white border border-gray-600"
                    />
                    <button 
                        onClick={() => fetchOrders(true)} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Filter
                    </button>
                    <button 
                        onClick={() => {
                            setStartDate(null);
                            setEndDate(null);
                            setSelectedCategory('');
                            fetchOrders(false);
                        }} 
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Reset
                    </button>
                </div>

                {/* Dropdown for Category Filter */}
                <div className="mb-6">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="p-2 rounded bg-gray-800 text-white border border-gray-600"
                    >
                        <option value="">All Categories</option>
                        {orders.map((order, index) => (
                            <option key={index} value={order.name}>{order.name}</option>
                        ))}
                    </select>
                </div>

                {/* Scrollable order list container */}
                <div className="w-full max-h-[300px] overflow-y-auto border border-white-700 rounded-lg p-4">
                    {filteredOrders.length > 0 ? (
                        <ul className="list-none pl-0">
                            {filteredOrders.map((order, index) => (
                                <div key={index} className="mb-6 p-4 border border-gray-600 rounded bg-gray-800">
                                    <h3 className="text-xl font-bold">Category: {order.name}</h3>
                                    {(Array.isArray(order.products) ? order.products : []).map((item) => (
                                        <div key={item._id} className="mb-4 p-4 border border-gray-600 rounded bg-gray-700">
                                            {console.log(item)}
                                            <h3 className="text-xl font-bold">Order ID: {item._id}</h3>
                                            <p className="text-sm">Payment Method: {item.paymentMethod || "N/A"}</p>
                                            <p className="text-sm">Total Price: ${item.totalPrice || "0.00"}</p>
                                            <p className="text-sm">Final Price: ${item.finalPrice || "0.00"}</p>
                                            <p className="text-sm">
                                                Shipping Address: {item.shippingAddress?.address || "N/A"}, 
                                                {item.shippingAddress?.city || "N/A"}, 
                                                {item.shippingAddress?.postalCode || "N/A"}, 
                                                {item.shippingAddress?.country || "N/A"}
                                            </p>
                                            <h4 className="mt-2 text-lg font-semibold">Items:</h4>
                                            {console.log(item.orderItems,Array.isArray(item.orderItems))}
                                            <ul className="list-inside list-disc">
                                                {/* {(Array.isArray(item.orderItems) ? item.orderItems : []).map((product) => ( */}
                                                    <li key={item.orderItems._id} className="text-sm">
                                                        {item.orderItems.name} (x{item.orderItems.amount}) - ${item.orderItems.price}
                                                    </li>
                                                {/* ))} */}
                                            </ul>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Ordered on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No orders found for the selected date range or category.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

