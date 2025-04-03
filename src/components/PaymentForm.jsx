import {
  CardElement,
  useElements,
  useStripe,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, cartProducts } from "../stores/cart/cartSlice";
import { getAddress, clearAddress } from "../stores/userInfo/addressSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "./elements/Button";
import { ToastContainer, toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const StripeWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

const PaymentForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [total,setTotal] = useState()
  const dispatch = useDispatch();
  const cart = useSelector(cartProducts);
  const address = useSelector(getAddress);
  const navigate = useNavigate();
  const elements = useElements();
  const stripe = useStripe();

//   console.log(cart);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  useEffect(()=>{
    const total = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.amount,
    0);
    setTotal(total)
  })


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("called");
    

    if (!cart?.length || !address) {
      setError("Invalid payment details or empty cart.");
      return;
    }

    setLoading(true);
    setError(null);
    console.log(cart)
    try {
      const response = await fetch(
        "http://localhost:8080/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethodType: "COD",
            orderItems: cart,

            userId: "", // Replace with actual userId if applicable
            shippingAddress: address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      //   const { clientSecret } = data;

      //   const result = await stripe.confirmCardPayment(clientSecret, {
      //     payment_method: {
      //       card: elements.getElement(CardElement),
      //     },
      //   });

      //   if (result.error) {
      //     setError(result.error.message);
      //   } else if (result.paymentIntent.status === "succeeded") {
      //     dispatch(clearAddress());
      //     dispatch(clearCart());
      if(data.message === "Your order is successfully placed"){
          navigate("/payment-success");
      }
      else{
        toast(data.message)
      }
      //   }
      console.log(response, data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form
      className="md:w-2/3 md:mx-auto px-2 pt-1"
      id="payment-form"
      onSubmit={handleSubmit}
    >
        <ToastContainer></ToastContainer>
      <label htmlFor="card-element" className="pt-4 text-2xl md:text-center">
        Please select the option first
      </label>
      <div className="my-4">
        <div>
          <ul>
            <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
              <li>Product</li>
              <li>Price</li>
            </div>
            {cart.map((item, index) => (
              <div>
                <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
                  <li key={index}>{item.name}</li>
                  <li key={index}>{item.price}</li>
                </div>
                <hr></hr>
              </div>
            ))}
            <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
              <li></li>
              <li>{total}</li>
            </div>
            <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
              <li>GST</li>
              <li>{Math.round(total*5 / 100).toFixed(2)}</li>
            </div>
            <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
              <li>Shipping Price</li>
              <li>{10}</li>
            </div>
            <div className="container mx-auto flex justify-between align-center py-2 border-b-gray-400 border-b-1">
              <li>Total Price</li>
              <li>{Math.round(((total + 10)+(total * 5 / 100))).toFixed(2)}</li>
            </div>
          </ul>
        </div>
        <ul>
          <li>
            <label>
              <input
                type="checkbox"
                name="payment"
                value="cash-on-delivery"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              Cash on Delivery
            </label>
          </li>
        </ul>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-center p-2">
        <Button type="submit" disabled={loading && isChecked} >
          {loading ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
