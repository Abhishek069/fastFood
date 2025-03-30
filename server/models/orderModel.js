const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
      // user: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   required: false,
      //   ref: "User",
      // },
      orderItems: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
      shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      paymentMethod: {
        type: String,
        required: true,
      },
      taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
      },
      shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
      },
      finalPrice:{
        type:Number,
        required:true,
      }
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = mongoose.model("Order", orderSchema);