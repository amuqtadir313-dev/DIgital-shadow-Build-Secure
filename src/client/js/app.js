const API_BASE_URL = "/api";

// ======================================================
// HTML ESCAPING
// ======================================================

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) {
        return;
    }

    const searchInput =
        document.getElementById("searchInput");

    const search = searchInput
        ? searchInput.value.trim()
        : "";

    container.innerHTML = `
        <div class="loading">
            Loading products...
        </div>
    `;

    try {

        const url = search
            ? `${API_BASE_URL}/products?search=${encodeURIComponent(search)}`
            : `${API_BASE_URL}/products`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load products."
            );
        }

        if (!data.products || data.products.length === 0) {

            container.innerHTML = `
                <div class="loading">
                    No products found.
                </div>
            `;

            return;
        }

        container.innerHTML = data.products
            .map((product) => {

                return `
                    <article class="product-card">

                        <div class="product-icon">
                            🛍️
                        </div>

                        <h3>
                            ${escapeHtml(product.name)}
                        </h3>

                        <p>
                            ${escapeHtml(
                                product.description ||
                                "No description available."
                            )}
                        </p>

                        <div class="product-price">
                            ₹${Number(product.price)
                                .toLocaleString("en-IN")}
                        </div>

                        <div class="product-stock">
                            ${product.stock} items available
                        </div>

                    </article>
                `;
            })
            .join("");

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        container.innerHTML = `
            <div class="loading">
                Unable to connect to MarketHub API.
            </div>
        `;
    }
}


// ======================================================
// REGISTER
// ======================================================

async function registerUser(event) {

    event.preventDefault();

    const form = event.target;

    const message =
        document.getElementById("registerMessage");

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;


    message.className = "form-message";
    message.textContent = "Creating your account...";


    if (!name || !email || !password) {

        message.textContent =
            "Please fill in all required fields.";

        return;
    }


    if (password.length < 8) {

        message.textContent =
            "Password must contain at least 8 characters.";

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Registration failed."
            );
        }


        message.className =
            "form-message success";

        message.textContent =
            "Account created successfully. Redirecting to login...";


        form.reset();

setTimeout(() => {
    try {
        const tokenParts = data.accessToken.split(".");

        const payload = JSON.parse(
            atob(
                tokenParts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        const role = payload.role;

        if (role === "vendor") {
            window.location.href =
                "./vendor-dashboard.html";
        } else if (role === "admin") {
            window.location.href =
                "./admin-dashboard.html";
        } else {
            window.location.href =
                "./dashboard.html";
        }

    } catch (error) {
        console.error(
            "Role detection error:",
            error
        );

        window.location.href =
            "./dashboard.html";
    }
}, 700);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        message.className =
            "form-message";

        message.textContent =
            error.message ||
            "Unable to create account.";
    }
}


// ======================================================
// LOGIN
// ======================================================

async function loginUser(event) {

    event.preventDefault();

    const form = event.target;

    const message =
        document.getElementById("loginMessage");


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    message.className =
        "form-message";

    message.textContent =
        "Authenticating securely...";


    if (!email || !password) {

        message.textContent =
            "Please enter your email and password.";

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed."
            );
        }


        // Backend returns the JWT access token.
        if (!data.accessToken) {

            throw new Error(
                "Login succeeded but no access token was returned."
            );
        }


        /*
         * sessionStorage is used instead of localStorage.
         * The token is automatically removed when the
         * browser session ends.
         */

        sessionStorage.setItem(
            "marketHubToken",
            data.accessToken
        );


        // Store returned user information when available.

        if (data.user) {

            sessionStorage.setItem(
                "marketHubUser",
                JSON.stringify(data.user)
            );
        }


        message.className =
            "form-message success";

        message.textContent =
            "Login successful. Redirecting...";


        setTimeout(() => {

            window.location.href =
                "./dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.className =
            "form-message";

        message.textContent =
            error.message ||
            "Unable to login.";
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logoutUser() {

    sessionStorage.removeItem(
        "marketHubToken"
    );

    sessionStorage.removeItem(
        "marketHubUser"
    );

    window.location.href =
        "./index.html";
}


// ======================================================
// AUTHENTICATED API HELPER
// ======================================================

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        sessionStorage.getItem(
            "marketHubToken"
        );


    if (!token) {

        window.location.href =
            "./login.html";

        return null;
    }


    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };


    return fetch(url, {
        ...options,
        headers
    });
}


// ======================================================
// INITIAL PAGE SETUP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Homepage products
        if (
            document.getElementById(
                "productsContainer"
            )
        ) {
            loadProducts();
        }


        // Registration form
        const registerForm =
            document.getElementById(
                "registerForm"
            );

        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                registerUser
            );
        }


        // Login form
        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }

    }
);


// ======================================================
// CUSTOMER DASHBOARD
// ======================================================

let dashboardProducts = [];
let shoppingCart = JSON.parse(
    sessionStorage.getItem("marketHubCart") || "[]"
);


// ======================================================
// CHECK LOGIN
// ======================================================

function requireLogin() {

    const token =
        sessionStorage.getItem("marketHubToken");

    if (!token) {
        window.location.href = "./login.html";
        return false;
    }

    return true;
}


// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadCustomerDashboard() {

    if (!requireLogin()) {
        return;
    }

    const storedUser =
        sessionStorage.getItem("marketHubUser");

    if (storedUser) {

        try {

            const user =
                JSON.parse(storedUser);

            document.getElementById("userName")
                .textContent =
                user.name || "Customer";

        } catch (error) {

            console.error(
                "User data error:",
                error
            );
        }
    }

    await loadDashboardProducts();

    renderCart();

    await loadCustomerOrders();
}


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadDashboardProducts() {

    const container =
        document.getElementById(
            "dashboardProducts"
        );

    if (!container) {
        return;
    }

    const search =
        document.getElementById(
            "dashboardSearch"
        )?.value.trim() || "";


    container.innerHTML = `
        <div class="loading">
            Loading products...
        </div>
    `;


    try {

        const url = search
            ? `${API_BASE_URL}/products?search=${encodeURIComponent(search)}`
            : `${API_BASE_URL}/products`;


        const response =
            await authenticatedFetch(url);


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load products."
            );
        }


        dashboardProducts =
            data.products || [];


        if (dashboardProducts.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    No products found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            dashboardProducts
                .map(product => `

                    <article class="product-card">

                        <div class="product-icon">
                            🛍️
                        </div>

                        <h3>
                            ${escapeHtml(product.name)}
                        </h3>

                        <p>
                            ${escapeHtml(
                                product.description ||
                                "No description available."
                            )}
                        </p>

                        <div class="product-price">
                            ₹${Number(product.price)
                                .toLocaleString("en-IN")}
                        </div>

                        <div class="product-stock">
                            ${product.stock}
                            items available
                        </div>

                        <button
                            class="add-cart-button"
                            onclick="addToCart('${product.id}')"
                            ${product.stock <= 0 ? "disabled" : ""}
                        >
                            Add to Cart
                        </button>

                    </article>

                `)
                .join("");


    } catch (error) {

        console.error(
            "Dashboard product error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load products.
            </div>
        `;
    }
}


// ======================================================
// ADD TO CART
// ======================================================

function addToCart(productId) {

    const product =
        dashboardProducts.find(
            item => item.id === productId
        );


    if (!product) {
        return;
    }


    const existing =
        shoppingCart.find(
            item => item.productId === productId
        );


    if (existing) {

        if (
            existing.quantity <
            Number(product.stock)
        ) {
            existing.quantity++;
        }

    } else {

        shoppingCart.push({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            stock: Number(product.stock)
        });
    }


    saveCart();

    renderCart();
}


// ======================================================
// UPDATE CART QUANTITY
// ======================================================

function updateCartQuantity(
    productId,
    change
) {

    const item =
        shoppingCart.find(
            product =>
                product.productId === productId
        );


    if (!item) {
        return;
    }


    item.quantity += change;


    if (item.quantity <= 0) {

        shoppingCart =
            shoppingCart.filter(
                product =>
                    product.productId !== productId
            );

    } else if (
        item.quantity > item.stock
    ) {

        item.quantity = item.stock;
    }


    saveCart();

    renderCart();
}


// ======================================================
// REMOVE FROM CART
// ======================================================

function removeFromCart(productId) {

    shoppingCart =
        shoppingCart.filter(
            item =>
                item.productId !== productId
        );


    saveCart();

    renderCart();
}


// ======================================================
// SAVE CART
// ======================================================

function saveCart() {

    sessionStorage.setItem(
        "marketHubCart",
        JSON.stringify(shoppingCart)
    );
}


// ======================================================
// RENDER CART
// ======================================================

function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    const totalElement =
        document.getElementById(
            "cartTotal"
        );

    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    if (!container) {
        return;
    }


    if (shoppingCart.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Your cart is empty.
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "₹0.00";
        }

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        return;
    }


    let total = 0;


    container.innerHTML =
        shoppingCart
            .map(item => {

                const itemTotal =
                    item.price *
                    item.quantity;

                total += itemTotal;


                return `
                    <div class="cart-item">

                        <div class="cart-item-info">

                            <h3>
                                ${escapeHtml(item.name)}
                            </h3>

                            <p>
                                ₹${item.price.toLocaleString("en-IN")}
                                × ${item.quantity}
                            </p>

                        </div>


                        <div class="cart-item-actions">

                            <div class="quantity-control">

                                <button
                                    onclick="updateCartQuantity(
                                        '${item.productId}',
                                        -1
                                    )"
                                >
                                    −
                                </button>

                                <strong>
                                    ${item.quantity}
                                </strong>

                                <button
                                    onclick="updateCartQuantity(
                                        '${item.productId}',
                                        1
                                    )"
                                >
                                    +
                                </button>

                            </div>


                            <strong>
                                ₹${itemTotal.toLocaleString("en-IN")}
                            </strong>


                            <button
                                class="remove-cart-button"
                                onclick="removeFromCart(
                                    '${item.productId}'
                                )"
                            >
                                Remove
                            </button>

                        </div>

                    </div>
                `;
            })
            .join("");


    if (totalElement) {

        totalElement.textContent =
            `₹${total.toLocaleString("en-IN", {
                minimumFractionDigits: 2
            })}`;
    }


    if (checkoutButton) {
        checkoutButton.disabled = false;
    }
}


// ======================================================
// CHECKOUT
// ======================================================

async function checkoutCart() {

    if (shoppingCart.length === 0) {
        return;
    }


    const message =
        document.getElementById(
            "checkoutMessage"
        );


    message.className =
        "form-message";

    message.textContent =
        "Processing secure checkout...";


    try {

        const items =
            shoppingCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));


        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        items
                    })
                }
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Checkout failed."
            );
        }


        shoppingCart = [];

        saveCart();

        renderCart();


        message.className =
            "form-message success";

        message.textContent =
            "Order created successfully!";


        await loadCustomerOrders();


    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );

        message.className =
            "form-message";

        message.textContent =
            error.message ||
            "Unable to complete checkout.";
    }
}


// ======================================================
// LOAD CUSTOMER ORDERS
// ======================================================

async function loadCustomerOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/orders/my`
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load orders."
            );
        }


        const orders =
            data.orders || [];


        if (orders.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    You have not placed any orders yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            orders.map(order => `

                <div class="order-card">

                    <div class="order-card-header">

                        <h3>
                            Order #${escapeHtml(
                                String(order.id).slice(0, 8)
                            )}
                        </h3>

                        <span class="order-status">
                            ${escapeHtml(
                                order.status
                            )}
                        </span>

                    </div>


                    <div class="order-details">

                        <span>
                            ${new Date(
                                order.created_at
                            ).toLocaleString("en-IN")}
                        </span>

                        <span class="order-total">
                            ₹${Number(
                                order.total_amount
                            ).toLocaleString("en-IN")}
                        </span>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        console.error(
            "Order history error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load your orders.
            </div>
        `;
    }
}


// ======================================================
// DASHBOARD INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "dashboardProducts"
            )
        ) {

            loadCustomerDashboard();
        }

    }
);


// ======================================================
// VENDOR DASHBOARD
// ======================================================

async function loadVendorDashboard() {

    if (!requireLogin()) {
        return;
    }

    const storedUser =
        sessionStorage.getItem("marketHubUser");

    if (storedUser) {

        try {

            const user =
                JSON.parse(storedUser);

            if (user.role !== "vendor") {

                window.location.href =
                    "./dashboard.html";

                return;
            }

            document.getElementById("vendorName")
                .textContent =
                user.name || "Vendor";

        } catch (error) {

            console.error(
                "Vendor user data error:",
                error
            );
        }
    }

    await loadVendorProducts();

    await loadVendorOrders();
}


// ======================================================
// LOAD VENDOR PRODUCTS
// ======================================================

async function loadVendorProducts() {

    const container =
        document.getElementById(
            "vendorProducts"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/products`
            );

        if (!response) {
            return;
        }

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load products."
            );
        }

        const user =
            JSON.parse(
                sessionStorage.getItem(
                    "marketHubUser"
                )
            );

        const products =
            (data.products || [])
                .filter(
                    product =>
                        product.vendor_id === user.id
                );


        if (products.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    You have not created any products yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            products.map(product => `

                <article class="product-card">

                    <div class="product-icon">
                        📦
                    </div>

                    <h3>
                        ${escapeHtml(product.name)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            product.description || ""
                        )}
                    </p>

                    <div class="product-price">
                        ₹${Number(product.price)
                            .toLocaleString("en-IN")}
                    </div>

                    <div class="product-stock">
                        Stock: ${product.stock}
                    </div>

                    <div class="vendor-product-actions">

                        <button
                            class="danger-button"
                            onclick="deleteVendorProduct(
                                '${product.id}'
                            )"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `).join("");

    } catch (error) {

        console.error(
            "Vendor products error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load your products.
            </div>
        `;
    }
}


// ======================================================
// CREATE PRODUCT
// ======================================================

async function createVendorProduct(event) {

    event.preventDefault();

    const message =
        document.getElementById(
            "productMessage"
        );

    const name =
        document.getElementById(
            "productName"
        ).value.trim();

    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();

    const price =
        Number(
            document.getElementById(
                "productPrice"
            ).value
        );

    const stock =
        Number(
            document.getElementById(
                "productStock"
            ).value
        );


    message.textContent =
        "Creating product...";


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/products`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        description,
                        price,
                        stock
                    })
                }
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to create product."
            );
        }


        message.className =
            "form-message success";

        message.textContent =
            "Product created successfully.";


        document.getElementById(
            "productForm"
        ).reset();


        await loadVendorProducts();


    } catch (error) {

        console.error(
            "Create product error:",
            error
        );

        message.className =
            "form-message";

        message.textContent =
            error.message ||
            "Unable to create product.";
    }
}


// ======================================================
// DELETE PRODUCT
// ======================================================

async function deleteVendorProduct(productId) {

    if (
        !confirm(
            "Are you sure you want to remove this product?"
        )
    ) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/products/${productId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete product."
            );
        }


        await loadVendorProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete product."
        );
    }
}


// ======================================================
// LOAD VENDOR ORDERS
// ======================================================

async function loadVendorOrders() {

    const container =
        document.getElementById(
            "vendorOrders"
        );

    if (!container) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/vendor/orders`
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load vendor orders."
            );
        }


        const orders =
            data.orders || [];


        if (orders.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    No customer orders yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            orders.map(order => `

                <div class="vendor-order-card">

                    <div class="vendor-order-header">

                        <h3>
                            Order #${escapeHtml(
                                String(order.id).slice(0, 8)
                            )}
                        </h3>

                        <span class="order-status">
                            ${escapeHtml(
                                order.status
                            )}
                        </span>

                    </div>


                    <div class="vendor-order-info">

                        <div>
                            Customer<br>
                            <strong>
                                ${escapeHtml(
                                    order.customer_name ||
                                    "Customer"
                                )}
                            </strong>
                        </div>

                        <div>
                            Total<br>
                            <strong>
                                ₹${Number(
                                    order.total_amount
                                ).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div>
                            Status<br>

                            <select
                                class="status-select"
                                id="status-${order.id}"
                            >

                                <option value="pending"
                                    ${order.status === "pending" ? "selected" : ""}>
                                    Pending
                                </option>

                                <option value="confirmed"
                                    ${order.status === "confirmed" ? "selected" : ""}>
                                    Confirmed
                                </option>

                                <option value="processing"
                                    ${order.status === "processing" ? "selected" : ""}>
                                    Processing
                                </option>

                                <option value="shipped"
                                    ${order.status === "shipped" ? "selected" : ""}>
                                    Shipped
                                </option>

                                <option value="delivered"
                                    ${order.status === "delivered" ? "selected" : ""}>
                                    Delivered
                                </option>

                                <option value="cancelled"
                                    ${order.status === "cancelled" ? "selected" : ""}>
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>


                    <button
                        class="update-status-button"
                        onclick="updateVendorOrderStatus(
                            '${order.id}'
                        )"
                    >
                        Update Order Status
                    </button>

                </div>

            `).join("");


    } catch (error) {

        console.error(
            "Vendor orders error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load customer orders.
            </div>
        `;
    }
}


// ======================================================
// UPDATE ORDER STATUS
// ======================================================

async function updateVendorOrderStatus(orderId) {

    const select =
        document.getElementById(
            `status-${orderId}`
        );


    if (!select) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/vendor/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: select.value
                    })
                }
            );


        if (!response) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update order status."
            );
        }


        await loadVendorOrders();


    } catch (error) {

        console.error(
            "Order status error:",
            error
        );

        alert(
            error.message ||
            "Unable to update order status."
        );
    }
}


// ======================================================
// VENDOR PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "vendorProducts"
            )
        ) {

            loadVendorDashboard();
        }


        const productForm =
            document.getElementById(
                "productForm"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                createVendorProduct
            );
        }

    }
);