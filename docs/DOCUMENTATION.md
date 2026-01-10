# Profit & Inventory Tracker

A browser-based tool for tracking sales, inventory, and profit shares when selling products with investor capital.

---

## What Problem Does This Solve?

When you sell products using both your own capital and an investor's capital, accounting gets messy:

- How many units did I buy with my money vs. the investor's money?
- When I sell from the investor's stock, how do I split the profit fairly?
- How much total cash do I need to return to the investor?
- What's my actual take-home after all the splits?

This tracker handles all of that math automatically.

---

## How It Works

### The Capital Split Model

```
+------------------+     +--------------------+
|   Your Capital   |     |  Investor Capital  |
|      (100%)      |     |                    |
+--------+---------+     +---------+----------+
         |                         |
         v                         v
+------------------+     +--------------------+
|   Your Stash     |     |   Investor Stash   |
|  (Your units)    |     |  (Investor units)  |
+--------+---------+     +---------+----------+
         |                         |
         v                         v
    Sell & Keep           Sell & Split
    100% Profit           (e.g., 60/40)
```

When you sell from **your own stash**, you keep 100% of the profit.

When you sell from the **investor's stash**, the profit splits according to your agreed ratio (default: 60% to you as labor fee, 40% to investor).

### Inventory Calculation

```
Units = floor(Capital / Cost Per Item)
```

Example: If you have 2000 PHP capital and items cost 200 PHP each, you can purchase 10 units.

### Profit Calculation

**Your Stash:**
```
Net Profit = (Selling Price - Cost Price) * Units Sold
```

**Investor Stash:**
```
Gross Profit = (Selling Price - Cost Price) * Units Sold
Your Labor Share = Gross Profit * Split Ratio
Investor Share = Gross Profit * (1 - Split Ratio)
Return to Investor = (Cost Price * Units Sold) + Investor Share
```

---

## File Structure

```
/
|-- tracker.html      # Main application
|-- css/
|   `-- style.css     # Styling
|-- js/
|   `-- script.js     # Application logic
`-- docs/
    `-- README.md     # This file
```

---

## Data Storage

All data persists in `localStorage` under two keys:

| Key                         | Contents                          |
|-----------------------------|-----------------------------------|
| `profitTracker_products`    | Array of product configurations   |
| `profitTracker_activeViews` | Currently displayed panel states  |

No server required. Everything runs client-side.

---

## Usage

1. Open `tracker.html` in any modern browser
2. Add a product with:
   - Product name
   - Cost price (your purchase cost per unit)
   - Selling price
   - Your capital contribution
   - Investor capital contribution
   - Profit split ratio
3. Use arrow buttons to display products in the split-view panels
4. Click "+ Sold 1" each time you make a sale
5. Dashboard updates automatically with:
   - Remaining inventory counts
   - Progress bars
   - Profit calculations
   - Investor payout amounts

---

## Split View

The dashboard supports two side-by-side panels for comparing products. Use the arrow buttons on each product tab:

- Left arrow: Display in left panel
- Right arrow: Display in right panel
- X button: Remove product from the list

---

## Browser Support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled and localStorage access.

---

## License

MIT License. See [LICENSE](../LICENSE) file.
