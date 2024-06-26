
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { useAuth } from "./authContext/AuthContext";
import {
  GetWishlistItems,
  getCart,
  getOrders,
} from "./Components/ProductHandlers/ProductHandler";
import { useCart } from "./cartContext/CartContext";

function App() {
  const { pathname } = useLocation();
  const { user, dispatch } = useAuth();
  const { dispatch: cartdispatch } = useCart();
  const [loader, setLoader] = useState(true);

  const getWishlist = async () => {
    try {
      const wishlist = await GetWishlistItems();
      cartdispatch({ type: "ADDTOWISHLIST", payload: wishlist.success ? wishlist.wishlist : [] });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const getCartData = async () => {
    try {
      const cart = await getCart();
      cartdispatch({ type: "ADDTOCART", payload: cart.success ? cart.cart : [] });
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const getUsersOrders = async () => {
    try {
      const data = await getOrders();
      if (data.success) {
        cartdispatch({ type: "SETORDERS", payload: data.orders });
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    }
  };

  
  const getUserData = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoader(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URI}/api/getuser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.success) {
        localStorage.removeItem("auth_token");
        dispatch({ type: "LOGOUT" });
        setLoader(false);
        return;
      }
      dispatch({
        type: "LOGIN",
        payload: { ...data.user, token },
      });
      await getWishlist();
      await getCartData();
      await getUsersOrders();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoader(false);
    }
  };


  useEffect(() => {
    if (user) {
      setLoader(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || pathname === '/profile') {
      getUserData();
    }
  }, [pathname]);

  return (
    <>
      {!loader && <Header />}
      {loader ? (
        <div className="loaderwrapper">
          <div className="loader"></div>
        </div>
      ) : (
        <Outlet />
      )}
      {!loader && <Footer />}
    </>
  );
}

export default App;
