# Teensville Income Statement Generator

An interactive web application that generates random income statements for teens. This project converts the original Excel spreadsheet into a modern React webapp with enhanced features.

## Features

### 🎲 Random Income Statement Generation
- Generate random income statements based on transaction weights/odds
- Customize the number of transactions to generate
- Real-time running balance calculation

### 👤 Gender Filter Support
- Filter transactions by gender (Boy, Girl, or Any)
- Automatic filtering based on selected personality

### ⚙️ Custom Weight Editing
- Toggle items on/off
- Adjust weight/odds for each transaction
- Higher weights = more likely to appear in generated statements

### 🎭 Personality Presets
Pre-configured profiles with custom weights and item selections:

- **Default**: Standard configuration from the original spreadsheet
- **Gamer Boy**: Loves video games, tech, and gaming culture
- **Fashionista Girl**: Loves trendy clothes, accessories, and style
- **Social Butterfly**: Loves hanging out with friends and experiences
- **Hard Worker**: Focused on earning money through chores
- **Big Spender**: Goes for the expensive items

### 🔄 Preset Modifications
- Quick generation from preset without manual configuration
- Modify preset settings without resetting them
- "Modified" badge shows when settings differ from preset
- "Reset to Preset" button to restore original preset values

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

## Project Structure

```
IncomeStatement/
├── IncomeStatementGenerator.jsx  # Main component
├── IncomeStatementGenerator.css  # Styles
├── transactions.js               # Transaction data & presets
├── App.jsx                       # App entry point
├── App.css                       # App styles
├── main.jsx                      # React entry point
├── index.css                     # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Original Spreadsheet Data

The webapp includes all transactions from the original "Teensville Income Statement.xlsx" spreadsheet:

### Income Sources (Chores)
- Mow The Lawn: $10
- Clean The Garage: $30
- Deep Clean the Bathroom: $70

### Expenses
Various teen-related expenses including:
- Video games and gaming accessories
- Fashion items (clothes, shoes, accessories)
- Food and drinks (Boba)
- Entertainment (movie tickets, arcade, Six Flags)
- Collectibles (Funko Pop, Labubu, Stanley Cup)
- And more!
