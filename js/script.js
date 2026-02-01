// ═══════════════════════════════════════════════════════════════
// PROFIT TRACKER - Multi-Product Split View Dashboard
// ═══════════════════════════════════════════════════════════════

// --- 1. CONFIGURATION & STATE ---
let products = [];
let activeViews = [null, null]; // Two panels for split view

// --- 2. STARTUP LOGIC ---
window.onload = function() {
    loadData();
    renderProductTabs();
    renderSplitView();
};

function loadData() {
    const savedData = localStorage.getItem('profitTracker_products');
    if (savedData) {
        products = JSON.parse(savedData);
    }
    
    const savedViews = localStorage.getItem('profitTracker_activeViews');
    if (savedViews) {
        activeViews = JSON.parse(savedViews);
    }
}

function saveData() {
    localStorage.setItem('profitTracker_products', JSON.stringify(products));
    localStorage.setItem('profitTracker_activeViews', JSON.stringify(activeViews));
}

function clearData() {
    showConfirm({
        title: "Reset All Data",
        message: "Are you sure you want to clear ALL products and start over?",
        icon: "🗑️",
        type: "danger",
        confirmText: "Yes, Reset",
        cancelText: "Cancel",
        onConfirm: function() {
            localStorage.removeItem('profitTracker_products');
            localStorage.removeItem('profitTracker_activeViews');
            location.reload();
        }
    });
}

// --- 3. PRODUCT MANAGEMENT ---

function generateId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const cost = parseFloat(document.getElementById('costPrice').value) || 0;
    const price = parseFloat(document.getElementById('sellPrice').value) || 0;
    const myCap = parseFloat(document.getElementById('myCapital').value) || 0;
    const invCap = parseFloat(document.getElementById('investorCapital').value) || 0;
    const split = parseFloat(document.getElementById('profitSplit').value);

    // Validation
    if (!name) {
        showAlert({
            title: "Missing Product Name",
            message: "Please enter a product name.",
            icon: "📝",
            type: "warning"
        });
        return;
    }
    if (cost === 0 || price === 0) {
        showAlert({
            title: "Invalid Prices",
            message: "Please enter valid Cost and Selling Price.",
            icon: "💰",
            type: "warning"
        });
        return;
    }

    const newProduct = {
        id: generateId(),
        name: name,
        cost: cost,
        price: price,
        myCap: myCap,
        invCap: invCap,
        split: split,
        mySold: 0,
        invSold: 0
    };

    products.push(newProduct);
    
    // Auto-assign to first empty panel
    if (activeViews[0] === null) {
        activeViews[0] = newProduct.id;
    } else if (activeViews[1] === null) {
        activeViews[1] = newProduct.id;
    }

    saveData();
    renderProductTabs();
    renderSplitView();
    clearForm();
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('costPrice').value = '';
    document.getElementById('sellPrice').value = '';
    document.getElementById('myCapital').value = '';
    document.getElementById('investorCapital').value = '';
    document.getElementById('profitSplit').value = '0.6';
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    const productName = product ? product.name : "this product";
    
    showConfirm({
        title: "Delete Product",
        message: `Delete "${productName}"? This action cannot be undone.`,
        icon: "🗑️",
        type: "danger",
        confirmText: "Delete",
        cancelText: "Keep",
        onConfirm: function() {
            products = products.filter(p => p.id !== productId);
            
            // Remove from active views if present
            if (activeViews[0] === productId) activeViews[0] = null;
            if (activeViews[1] === productId) activeViews[1] = null;
            
            saveData();
            renderProductTabs();
            renderSplitView();
        }
    });
}

function selectProduct(productId, panelIndex) {
    // Check if already in the other panel
    const otherPanel = panelIndex === 0 ? 1 : 0;
    if (activeViews[otherPanel] === productId) {
        // Swap them
        activeViews[otherPanel] = activeViews[panelIndex];
    }
    
    activeViews[panelIndex] = productId;
    saveData();
    renderProductTabs();
    renderSplitView();
}

function removeFromView(panelIndex) {
    activeViews[panelIndex] = null;
    saveData();
    renderProductTabs();
    renderSplitView();
}

// --- 4. RENDER FUNCTIONS ---

function renderProductTabs() {
    const container = document.getElementById('productTabs');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products yet. Add your first product above!</p>';
        return;
    }

    let html = '';
    products.forEach(product => {
        const isActive = activeViews.includes(product.id);
        const panelClass = activeViews[0] === product.id ? 'panel-1' : 
                          activeViews[1] === product.id ? 'panel-2' : '';
        
        html += `
            <div class="product-tab ${isActive ? 'active' : ''} ${panelClass}" data-id="${product.id}">
                <span class="product-tab__name">${product.name}</span>
                <div class="product-tab__actions">
                    <button onclick="selectProduct('${product.id}', 0)" class="tab-btn tab-btn--left" title="Show in Left Panel">◀</button>
                    <button onclick="selectProduct('${product.id}', 1)" class="tab-btn tab-btn--right" title="Show in Right Panel">▶</button>
                    <button onclick="deleteProduct('${product.id}')" class="tab-btn tab-btn--delete" title="Delete Product">×</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderSplitView() {
    const dashboard = document.getElementById('splitDashboard');
    if (!dashboard) return;

    // Check if we have any products to show
    if (activeViews[0] === null && activeViews[1] === null) {
        dashboard.innerHTML = `
            <div class="empty-dashboard">
                <div class="empty-dashboard__icon">📦</div>
                <h3>No Products Selected</h3>
                <p>Add a product above, then use the arrow buttons to display it here.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="split-container">';
    
    // Panel 1
    html += renderPanel(0);
    
    // Panel 2 (only if we have a second product or want to show empty state)
    if (products.length > 1 || activeViews[1] !== null) {
        html += '<div class="split-divider"></div>';
        html += renderPanel(1);
    }
    
    html += '</div>';
    dashboard.innerHTML = html;
}

function renderPanel(panelIndex) {
    const productId = activeViews[panelIndex];
    
    if (productId === null) {
        return `
            <div class="panel panel--empty">
                <div class="empty-panel">
                    <p>Select a product to display here</p>
                </div>
            </div>
        `;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        activeViews[panelIndex] = null;
        return renderPanel(panelIndex);
    }

    // Calculate values
    const myTotalUnits = Math.floor(product.myCap / product.cost);
    const invTotalUnits = Math.floor(product.invCap / product.cost);
    const myStock = myTotalUnits - product.mySold;
    const invStock = invTotalUnits - product.invSold;
    const myPct = myTotalUnits > 0 ? (myStock / myTotalUnits) * 100 : 0;
    const invPct = invTotalUnits > 0 ? (invStock / invTotalUnits) * 100 : 0;

    // Financials
    const myRevenue = product.mySold * product.price;
    const myCostOfGoods = product.mySold * product.cost;
    const myNetProfit = myRevenue - myCostOfGoods;

    const invRevenue = product.invSold * product.price;
    const invCostOfGoods = product.invSold * product.cost;
    const invTotalProfit = invRevenue - invCostOfGoods;
    const myLaborShare = invTotalProfit * product.split;
    const investorShare = invTotalProfit * (1 - product.split);
    const totalPayoutToInvestor = invCostOfGoods + investorShare;

    const totalCash = myRevenue + invRevenue;
    const totalTakeHome = myNetProfit + myLaborShare;

    const panelClass = panelIndex === 0 ? 'panel--left' : 'panel--right';

    return `
        <div class="panel ${panelClass}">
            <div class="panel__header">
                <h3 class="panel__title">${product.name}</h3>
                <button onclick="removeFromView(${panelIndex})" class="btn btn--close" title="Remove from view">×</button>
            </div>

            <!-- My Stash -->
            <article class="card card--my-stash card--compact">
                <div class="card__header">
                    <div>
                        <h4 class="card__heading">My Stash</h4>
                        <p class="card__subtext">Capital: ₱${product.myCap.toLocaleString()}</p>
                    </div>
                    <div class="stash__inventory">
                        <p class="stash__inventory-label">Inventory</p>
                        <p class="stash__inventory-count stash__inventory-count--gold">
                            ${myStock} / ${myTotalUnits}
                        </p>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-bar__fill progress-bar__fill--gold" style="width: ${myPct}%"></div>
                    </div>
                </div>

                <div class="sold-section sold-section--gold">
                    <div>
                        <p class="sold-label">Sold</p>
                        <p class="sold-count sold-count--gold" id="mySold-${product.id}">${product.mySold}</p>
                    </div>
                    <div class="sold-actions">
                        <button onclick="unsellItem('${product.id}', 'me')" class="btn btn--undo btn--undo-gold">
                            - Undo
                        </button>
                        <button onclick="sellItem('${product.id}', 'me')" class="btn btn--sell btn--sell-gold">
                            + Sold 1
                        </button>
                    </div>
                </div>

                <div class="profit-section">
                    <p class="profit-label">My Net Profit (100%)</p>
                    <p class="profit-value">₱${myNetProfit.toLocaleString()}</p>
                </div>
            </article>

            <!-- Investor Stash -->
            <article class="card card--investor card--compact">
                <div class="card__header">
                    <div>
                        <h4 class="card__heading">Investor Stash</h4>
                        <p class="card__subtext">Capital: ₱${product.invCap.toLocaleString()}</p>
                    </div>
                    <div class="stash__inventory">
                        <p class="stash__inventory-label">Inventory</p>
                        <p class="stash__inventory-count stash__inventory-count--cyan">
                            ${invStock} / ${invTotalUnits}
                        </p>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-bar__fill progress-bar__fill--cyan" style="width: ${invPct}%"></div>
                    </div>
                </div>

                <div class="sold-section sold-section--cyan">
                    <div>
                        <p class="sold-label">Sold</p>
                        <p class="sold-count sold-count--cyan" id="invSold-${product.id}">${product.invSold}</p>
                    </div>
                    <div class="sold-actions">
                        <button onclick="unsellItem('${product.id}', 'investor')" class="btn btn--undo btn--undo-cyan">
                            - Undo
                        </button>
                        <button onclick="sellItem('${product.id}', 'investor')" class="btn btn--sell btn--sell-cyan">
                            + Sold 1
                        </button>
                    </div>
                </div>

                <div class="profit-section">
                    <div class="profit-grid">
                        <div class="profit-item">
                            <p class="profit-label">Return to Investor</p>
                            <p class="profit-value profit-value--large">₱${totalPayoutToInvestor.toLocaleString()}</p>
                            <p class="profit-hint">Principal + Their Share</p>
                        </div>
                        <div class="profit-item profit-item--right">
                            <p class="profit-label">My Fee (Labor)</p>
                            <p class="profit-value profit-value--large">₱${myLaborShare.toLocaleString()}</p>
                            <p class="profit-hint">My Share of Profit</p>
                        </div>
                    </div>
                </div>
            </article>

            <!-- Totals -->
            <section class="card card--totals card--compact">
                <div class="totals-content">
                    <div class="totals-main">
                        <p class="totals-label">Total Cash Collected</p>
                        <p class="totals-value">₱${totalCash.toLocaleString()}</p>
                    </div>
                    <div class="totals-secondary">
                        <p class="totals-label">Total Take-Home for Me</p>
                        <p class="totals-earnings">₱${totalTakeHome.toLocaleString()}</p>
                        <p class="totals-hint">My Profit + Labor Fee</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

// --- 5. SELL ITEM FUNCTION ---

function sellItem(productId, who) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const myTotalUnits = Math.floor(product.myCap / product.cost);
    const invTotalUnits = Math.floor(product.invCap / product.cost);

    if (who === 'me') {
        if (product.mySold < myTotalUnits) {
            product.mySold++;
            saveData();
            renderSplitView();
            triggerSaleAnimation(`mySold-${productId}`);
        } else {
            showAlert({
                title: "Out of Stock",
                message: `No more inventory in Your Stash for "${product.name}"!`,
                icon: "📦",
                type: "warning"
            });
        }
    } else {
        if (product.invSold < invTotalUnits) {
            product.invSold++;
            saveData();
            renderSplitView();
            triggerSaleAnimation(`invSold-${productId}`);
        } else {
            showAlert({
                title: "Out of Stock",
                message: `No more inventory in Investor Stash for "${product.name}"!`,
                icon: "📦",
                type: "warning"
            });
        }
    }
}

function unsellItem(productId, who) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (who === 'me') {
        if (product.mySold > 0) {
            product.mySold--;
            saveData();
            renderSplitView();
            triggerSaleAnimation(`mySold-${productId}`);
        } else {
            showAlert({
                title: "Nothing to Undo",
                message: `No sales to undo in Your Stash for "${product.name}"!`,
                icon: "↩️",
                type: "warning"
            });
        }
    } else {
        if (product.invSold > 0) {
            product.invSold--;
            saveData();
            renderSplitView();
            triggerSaleAnimation(`invSold-${productId}`);
        } else {
            showAlert({
                title: "Nothing to Undo",
                message: `No sales to undo in Investor Stash for "${product.name}"!`,
                icon: "↩️",
                type: "warning"
            });
        }
    }
}

// --- 6. ANIMATION HELPERS ---

function triggerSaleAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('sale-pulse');
        setTimeout(() => {
            element.classList.remove('sale-pulse');
        }, 300);
    }
}

// --- 7. CUSTOM MODAL SYSTEM ---

function showModal(options) {
    const overlay = document.getElementById('customModal');
    const modal = overlay.querySelector('.modal');
    const iconEl = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const actionsEl = document.getElementById('modalActions');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');

    // Reset modal classes
    modal.className = 'modal';
    if (options.type) {
        modal.classList.add(`modal--${options.type}`);
    }

    // Set content
    iconEl.textContent = options.icon || '⚠';
    titleEl.textContent = options.title || 'Alert';
    messageEl.textContent = options.message || '';

    // Configure buttons
    if (options.showCancel === false) {
        actionsEl.className = 'modal__actions modal__actions--single';
        cancelBtn.style.display = 'none';
    } else {
        actionsEl.className = 'modal__actions';
        cancelBtn.style.display = '';
        cancelBtn.textContent = options.cancelText || 'Cancel';
    }
    
    confirmBtn.textContent = options.confirmText || 'OK';

    // Show modal
    overlay.classList.add('active');

    // Handle button clicks
    const closeModal = () => {
        overlay.classList.remove('active');
    };

    const handleConfirm = () => {
        closeModal();
        if (options.onConfirm) options.onConfirm();
    };

    const handleCancel = () => {
        closeModal();
        if (options.onCancel) options.onCancel();
    };

    // Remove old listeners and add new ones
    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            handleCancel();
        }
    };

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function showAlert(options) {
    showModal({
        ...options,
        showCancel: false,
        confirmText: options.confirmText || 'Got It'
    });
}

function showConfirm(options) {
    showModal({
        ...options,
        showCancel: true
    });
}

