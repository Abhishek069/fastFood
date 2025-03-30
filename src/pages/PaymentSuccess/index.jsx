import { Alert } from "../../components/elements/Alert";
import { useSelector } from "react-redux";
import { cartProducts } from "../../stores/cart/cartSlice";
import { clearCart } from "../../stores/cart/cartSlice"
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const PaymentSuccess = () => {
    const dispatch = useDispatch()
    const cart = useSelector(cartProducts);

    useEffect(()=>{
        dispatch(clearCart([]))
    },[dispatch])



    return (
        <div className="max-w-lg mx-auto p-4">
            <Alert variant="success">
                Your Order is Placed now.
            </Alert>
        </div>
    )
}

export default PaymentSuccess;