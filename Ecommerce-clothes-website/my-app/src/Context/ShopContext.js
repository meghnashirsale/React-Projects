import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

// Initialize the cart with default values
const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index <= 300; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [allProducts, setAllProducts] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    const backendURL = "https://your-render-backend-url.onrender.com";

    useEffect(() => {
        // Fetch all products
        fetch(`${backendURL}/allproducts`)
            .then((response) => response.json())
            .then((data) => setAllProducts(data))
            .catch((error) => console.error("Error fetching products:", error));

        // Fetch cart items if auth-token exists
        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            fetch(`${backendURL}/getcart`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "auth-token": authToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data))
                .catch((error) => console.error("Error fetching cart items:", error));
        }
    }, [backendURL]);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            fetch(`${backendURL}/addtocart`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "auth-token": authToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log("Item added to cart:", data))
                .catch((error) => console.error("Error adding item to cart:", error));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            fetch(`${backendURL}/removefromcart`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "auth-token": authToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log("Item removed from cart:", data))
                .catch((error) => console.error("Error removing item from cart:", error));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        const productMap = allProducts.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = productMap[item];
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, count) => total + count, 0);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        allProducts,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
