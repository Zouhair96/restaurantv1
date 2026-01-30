import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Default to empty, wait for scope to be set
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartScope, setCartScope] = useState(null);

    // Initial load when scope changes
    useEffect(() => {
        if (!cartScope) return;

        try {
            const savedCart = localStorage.getItem(`cart_${cartScope}`);
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            } else {
                setCartItems([]);
            }
        } catch (e) {
            console.error("Failed to load cart", e);
            setCartItems([]);
        }
    }, [cartScope]);

    // Save cart to localStorage whenever it changes, ONLY if scope is set
    useEffect(() => {
        if (!cartScope) return;
        localStorage.setItem(`cart_${cartScope}`, JSON.stringify(cartItems));
    }, [cartItems, cartScope]);

    /**
     * Set the current context scope (e.g. restaurant name)
     * This switches the active bucket for the cart.
     */
    const setContextScope = (scope) => {
        if (scope !== cartScope) {
            setCartScope(scope);
            // We rely on the useEffect above to load the new data
            // But to prevent flashing old data from previous scope, we can clear temporarily
            setCartItems([]);
        }
    };

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            // Check if item with same id and size already exists
            const existingItemIndex = prevItems.findIndex(
                (cartItem) => cartItem.id === item.id && cartItem.size === item.size
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += item.quantity;
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, item];
            }
        });
    };

    const removeFromCart = (itemId, size) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => !(item.id === itemId && item.size === size))
        );
    };

    const updateQuantity = (itemId, size, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, size);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId && item.size === size
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
        setContextScope,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
