const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require('./db');

const app = express();
const productRouter = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');
const orderRouter = require('./routes/OrderRouer');

const Order = require('./models/orderModel');

const env = require('dotenv').config({path: '../.env'});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var corsOptions = {
    origin: "http://localhost:3000"
}

const calculateOrderAmount = (orderItems) => {
    const initialValue = 0;
    const itemsPrice = orderItems.reduce(
        (previousValue, currentValue) =>
        previousValue + currentValue.price * currentValue.amount, initialValue
    );
    return itemsPrice * 100;
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
// app.post('/webhook', async (req, res) => {
//     let data, eventType;
  
//     // Check if webhook signing is configured.
//     if (process.env.STRIPE_WEBHOOK_SECRET) {
//       // Retrieve the event by verifying the signature using the raw body and secret.
//       let event;
//       let signature = req.headers['stripe-signature'];
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.rawBody,
//           signature,
//           process.env.STRIPE_WEBHOOK_SECRET
//         );
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed.`);
//         return res.sendStatus(400);
//       }
//       data = event.data;
//       eventType = event.type;
//     } else {
//       // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//       // we can retrieve the event data directly from the request body.
//       data = req.body.data;
//       eventType = req.body.type;
//     }
  
//     if (eventType === 'payment_intent.succeeded') {
//       // Funds have been captured
//       // Fulfill any orders, e-mail receipts, etc
//       // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
//       console.log('💰 Payment captured!');
//     } else if (eventType === 'payment_intent.payment_failed') {
//       console.log('❌ Payment failed.');
//     }
//     res.sendStatus(200);
//   });

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Food Ordering"});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use('/api/', productRouter);
app.use('/api/', userRouter);
app.use('/api/', orderRouter);

app.post('/create-payment-intent', async(req, res) => {
    try {
        const { orderItems, shippingAddress, userId } = req.body;
        console.log(Object.keys(shippingAddress).length,orderItems.length);

        const totalPrice = calculateOrderAmount(orderItems);

        const taxPrice = Math.round(totalPrice*5 / 100).toFixed(2)
        const shippingPrice = 10;

        const finalTotal = Math.round(((totalPrice + 10)+(totalPrice * 5 / 100))).toFixed(2)
        console.log({
          orderItems,
          shippingAddress,
          paymentMethod: 'cash on delivery',
          totalPrice: totalPrice,
          taxPrice: taxPrice,
          shippingPrice: 10,
          user: ''
      });
        

        const order = new Order({
          orderItems:orderItems,
          shippingAddress: shippingAddress,
          paymentMethod: 'cash on delivery',
          totalPrice: totalPrice,
          taxPrice: taxPrice,
          shippingPrice: 10,
          finalPrice: finalTotal,
          user: ''
        })

        try {
          // Save the order
          await order.save();
        
          // Check for missing fields BEFORE saving
          if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
            return res.status(400).json({ message: "Please provide the address" });
          }
        
          if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "Please select an item first" });
          }
        
          // If everything is fine, send success response
          res.status(200).json({ message: "Your order is successfully placed" });
        
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Your order was not placed due to an issue" });
        }

        // res.send({"message":"Your order is successfully placed"})

        // res.send({
        //     clientSecret: paymentIntent.client_secret
        // })
    } catch(e) {
        res.status(400).json({
            error: {
                message: e.message
            }
        })
    }
})