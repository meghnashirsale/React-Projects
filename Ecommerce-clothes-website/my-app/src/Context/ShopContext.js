import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

// Initialize cart 
const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        // Fetch all products
        fetch('https://your-render-backend-url.onrender.com/allproducts')
            .then((response) => response.json())
            .then((data) => setAll_Product(data))
            .catch((error) => console.error("Error fetching products:", error));

        // Fetch cart items if auth-token exists
        if (localStorage.getItem('auth-token')) {
            fetch('https://your-render-backend-url.onrender.com/getcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json', // Changed to 'application/json'
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: "",
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data))
                .catch((error) => console.error("Error fetching cart items:", error));
        }
    }, []);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        if (localStorage.getItem('auth-token')) {
            fetch('https://your-render-backend-url.onrender.com/addtocart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json', // Changed to 'application/json'
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data))
                .catch((error) => console.error("Error adding item to cart:", error));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (localStorage.getItem('auth-token')) {
            fetch('https://your-render-backend-url.onrender.com/removefromcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json', // Changed to 'application/json'
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data))
                .catch((error) => console.error("Error removing item from cart:", error));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        const productMap = all_product.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = productMap[item]; // Optimized product lookup using productMap
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
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
