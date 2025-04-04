const express = require('express')

const router = express.Router()

const Order = require('../models/orderModel')

router.get('/Getorder', async (req, res) => {
    try {
        const Orders = await Order.find()
        console.log(Orders)
        res.status(200).send({ data: Orders})
    } catch (err) {
        res.status(400).send({ error: err})
    }
})

// router.get('/get-order-basedDate', async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;
        
//         const filter = {};
//         if (startDate && endDate) {
//             filter.orderDate = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             };
//         }

//         const products = await Order.aggregate([
//             { $match: filter },
//             { $group: {
//                 _id: '$category',
//                 products: { $push: '$$ROOT' }
//             }},
//             { $project: { name: '$_id', products: 1, _id: 0 }}
//         ]);

//         res.status(200).send({ data: products });
//     } catch (err) {
//         res.status(400).send({ error: err.message });
//     }
// });

router.get('/get-order-basedDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.aggregate([
            { $match: filter },
            { 
                $unwind: "$orderItems" 
            },
            { 
                $group: {
                    _id: "$orderItems.name", 
                    products: { $push: "$$ROOT" }
                }
            },
            { 
                $project: { 
                    name: "$_id", 
                    products: 1, 
                    _id: 0 
                } 
            }
        ]);

        res.status(200).send({ data: orders });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// router.get('/get-order-basedDate', async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;

//         const filter = {};
//         if (startDate && endDate) {
//             filter.createdAt = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             };
//         }

//         console.log("Applied Date Filter:", JSON.stringify(filter, null, 2));

//         const aggregatePipeline = [
//             { $match: filter },
//             { $unwind: "$orderItems" }, 
//             {
//                 $group: {
//                     _id: "$orderItems.category", 
//                     products: { $push: "$$ROOT" }
//                 }
//             },
//             {
//                 $project: {
//                     name: "$_id",
//                     products: 1,
//                     _id: 0
//                 }
//             }
//         ];

//         const orders = await Order.aggregate(aggregatePipeline);
//         console.log("Orders found:", orders.length);

//         res.status(200).send({ data: orders });
//     } catch (err) {
//         res.status(400).send({ error: err.message });
//     }
// });


module.exports = router