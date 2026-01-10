// Intention types
export const INTENTION_TYPE = {
  STANDARD: 'standard',  // Teen still buys other things while saving
  INTENSE: 'intense',    // Teen only earns until goal is reached (rare)
};

// Variable pricing types
// The database can specify pricing as:
// - list: array of fixed price options
// - range: min/max range
// - weightedList: array of {price, weight} objects
// - weightedRange: {min, max, weights} where weights can bias toward low/high
// - advanced: custom function or complex configuration (for AI agent tweaks)
export const PRICING_TYPE = {
  FIXED: 'fixed',           // Single fixed price (default behavior)
  LIST: 'list',             // Array of price options: [40, 80, 120, 300]
  RANGE: 'range',           // Min/max range: {min: 40, max: 300}
  WEIGHTED_LIST: 'weightedList', // Weighted options: [{price: 40, weight: 1}, ...]
  WEIGHTED_RANGE: 'weightedRange', // Range with weight distribution: {min, max, bias: 'low'|'high'|'center'}
  ADVANCED: 'advanced',     // Custom configuration for AI agents
};

// Helper function to resolve a price from variable pricing configuration
export function resolvePrice(transaction) {
  if (!transaction.pricing || transaction.pricing.type === PRICING_TYPE.FIXED) {
    return { price: transaction.price, tier: null };
  }

  const config = transaction.pricing;
  let resolvedPrice;
  let tier = null;

  switch (config.type) {
    case PRICING_TYPE.LIST: {
      // Simple list: pick random from array
      const index = Math.floor(Math.random() * config.options.length);
      resolvedPrice = config.options[index];
      break;
    }
    case PRICING_TYPE.RANGE: {
      // Random within range
      resolvedPrice = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      break;
    }
    case PRICING_TYPE.WEIGHTED_LIST: {
      // Weighted selection from list
      const totalWeight = config.options.reduce((sum, opt) => sum + opt.weight, 0);
      let random = Math.random() * totalWeight;
      for (const option of config.options) {
        random -= option.weight;
        if (random <= 0) {
          resolvedPrice = option.price;
          tier = option.tier || null;
          break;
        }
      }
      if (resolvedPrice === undefined) {
        resolvedPrice = config.options[config.options.length - 1].price;
        tier = config.options[config.options.length - 1].tier || null;
      }
      break;
    }
    case PRICING_TYPE.WEIGHTED_RANGE: {
      // Range with bias toward low, high, or center
      const { min, max, bias = 'center' } = config;
      let factor = Math.random();
      if (bias === 'low') {
        factor = Math.pow(factor, 2); // Bias toward min
      } else if (bias === 'high') {
        factor = 1 - Math.pow(1 - factor, 2); // Bias toward max
      } else if (bias === 'center') {
        factor = (Math.random() + Math.random()) / 2; // Bell curve toward center
      }
      resolvedPrice = Math.floor(factor * (max - min + 1)) + min;
      break;
    }
    case PRICING_TYPE.ADVANCED: {
      // Advanced: use custom resolver function or fallback
      if (config.resolver && typeof config.resolver === 'function') {
        const result = config.resolver(transaction);
        resolvedPrice = result.price;
        tier = result.tier || null;
      } else if (config.tiers && config.tiers.length > 0) {
        // If tiers are defined, use weighted selection
        const totalWeight = config.tiers.reduce((sum, t) => sum + (t.weight || 1), 0);
        let random = Math.random() * totalWeight;
        for (const tierOption of config.tiers) {
          random -= tierOption.weight || 1;
          if (random <= 0) {
            resolvedPrice = tierOption.price;
            tier = tierOption.name || null;
            break;
          }
        }
        if (resolvedPrice === undefined) {
          resolvedPrice = config.tiers[config.tiers.length - 1].price;
          tier = config.tiers[config.tiers.length - 1].name || null;
        }
      } else {
        resolvedPrice = transaction.price;
      }
      break;
    }
    default:
      resolvedPrice = transaction.price;
  }

  // Ensure price is negative for expenses (preserve the sign convention)
  if (transaction.price < 0 && resolvedPrice > 0) {
    resolvedPrice = -resolvedPrice;
  } else if (transaction.price > 0 && resolvedPrice < 0) {
    resolvedPrice = Math.abs(resolvedPrice);
  }

  return { price: resolvedPrice, tier };
}

// Helper to get tier display name for a resolved price
export function getTierForPrice(transaction, price) {
  if (!transaction.pricing) return null;
  
  const config = transaction.pricing;
  const absPrice = Math.abs(price);
  
  // Check if tiers are defined
  if (config.tiers) {
    for (const tier of config.tiers) {
      if (Math.abs(tier.price) === absPrice) {
        return tier.name;
      }
    }
  }
  
  // For weighted list, check options for tier info
  if (config.type === PRICING_TYPE.WEIGHTED_LIST && config.options) {
    for (const option of config.options) {
      if (Math.abs(option.price) === absPrice) {
        return option.tier || null;
      }
    }
  }
  
  return null;
}

// Default transactions from the original spreadsheet
// All items enabled by default with 1.0 probability modifier
// frequency: None = no limit, or number of days between occurrences
// pricing: optional variable pricing configuration with product tiers
export const defaultTransactions = [
  { 
    id: 1, 
    name: "Video Game", 
    price: -70, 
    gender: "Boy", 
    active: true, 
    odds: 1.0, 
    frequency: "None",
    pricing: {
      type: PRICING_TYPE.WEIGHTED_LIST,
      options: [
        { price: 20, weight: 2, tier: "Indie Game" },
        { price: 40, weight: 3, tier: "Sale Game" },
        { price: 70, weight: 4, tier: "Standard Game" },
        { price: 100, weight: 1, tier: "Collector's Edition" },
      ],
      tiers: [
        { name: "Indie Game", price: 20, weight: 2 },
        { name: "Sale Game", price: 40, weight: 3 },
        { name: "Standard Game", price: 70, weight: 4 },
        { name: "Collector's Edition", price: 100, weight: 1 },
      ]
    }
  },
  { id: 2, name: "Art Supplies", price: -45, gender: "Any", active: true, odds: 1.0, frequency: "None" },
  { id: 3, name: "Trendy Jeans", price: -50, gender: "Any", active: true, odds: 1.0, frequency: "None" },
  { id: 4, name: "Anime Convention Ticket", price: -150, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { 
    id: 5, 
    name: "Trendy Nike Sneakers", 
    price: -120, 
    gender: "Boy", 
    active: true, 
    odds: 1.0, 
    frequency: "None",
    pricing: {
      type: PRICING_TYPE.WEIGHTED_LIST,
      options: [
        { price: 40, weight: 2, tier: "Cheap Shoes" },
        { price: 80, weight: 3, tier: "Old Shoes" },
        { price: 120, weight: 4, tier: "Trendy Shoes" },
        { price: 300, weight: 1, tier: "Limited Edition Shoes" },
      ],
      tiers: [
        { name: "Cheap Shoes", price: 40, weight: 2 },
        { name: "Old Shoes", price: 80, weight: 3 },
        { name: "Trendy Shoes", price: 120, weight: 4 },
        { name: "Limited Edition Shoes", price: 300, weight: 1 },
      ]
    }
  },
  { id: 6, name: "Trendy T-shirt", price: -25, gender: "Any", active: true, odds: 1.0, frequency: "None" },
  { id: 7, name: "Airsoft Gun", price: -30, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 8, name: "Skateboard", price: -100, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { 
    id: 9, 
    name: "New Lego Set", 
    price: -80, 
    gender: "Any", 
    active: true, 
    odds: 1.0, 
    frequency: "None",
    pricing: {
      type: PRICING_TYPE.WEIGHTED_LIST,
      options: [
        { price: 30, weight: 3, tier: "Small Set" },
        { price: 80, weight: 4, tier: "Medium Set" },
        { price: 150, weight: 2, tier: "Large Set" },
        { price: 400, weight: 1, tier: "Ultimate Set" },
      ],
      tiers: [
        { name: "Small Set", price: 30, weight: 3 },
        { name: "Medium Set", price: 80, weight: 4 },
        { name: "Large Set", price: 150, weight: 2 },
        { name: "Ultimate Set", price: 400, weight: 1 },
      ]
    }
  },
  { id: 10, name: "Poster For Room", price: -60, gender: "Any", active: true, odds: 1.0, frequency: "None" },
  { id: 11, name: "PS5", price: -500, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 12, name: "Trendy Haircut", price: -35, gender: "Any", active: true, odds: 1.0, frequency: 60 },
  { id: 13, name: "Trendy Baseball Cap", price: -25, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { 
    id: 14, 
    name: "Gift For Friend", 
    price: -25, 
    gender: "Any", 
    active: true, 
    odds: 1.0, 
    frequency: 30,
    pricing: {
      type: PRICING_TYPE.RANGE,
      min: 10,
      max: 50,
    }
  },
  { id: 15, name: "Gift for Girlfriend", price: -35, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 16, name: "Trendy Graphic Hoodie", price: -45, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 17, name: "Trendy Backpack", price: -45, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { 
    id: 18, 
    name: "Music Festival Ticket", 
    price: -300, 
    gender: "Any", 
    active: true, 
    odds: 1.0, 
    frequency: "None",
    pricing: {
      type: PRICING_TYPE.WEIGHTED_LIST,
      options: [
        { price: 100, weight: 2, tier: "General Admission" },
        { price: 200, weight: 3, tier: "Premium GA" },
        { price: 300, weight: 3, tier: "VIP" },
        { price: 500, weight: 1, tier: "Backstage Pass" },
      ],
      tiers: [
        { name: "General Admission", price: 100, weight: 2 },
        { name: "Premium GA", price: 200, weight: 3 },
        { name: "VIP", price: 300, weight: 3 },
        { name: "Backstage Pass", price: 500, weight: 1 },
      ]
    }
  },
  { id: 19, name: "Baseball Game Ticket", price: -30, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 20, name: "Six Flags Visit", price: -50, gender: "Any", active: true, odds: 1.0, frequency: "None" },
  { id: 21, name: "Arcade Session", price: -15, gender: "Boy", active: true, odds: 1.0, frequency: "None" },
  { id: 22, name: "Movie Ticket", price: -15, gender: "Any", active: true, odds: 1.0, frequency: 7 },
  { id: 23, name: "Robux", price: -25, gender: "Any", active: false, odds: 1.0, frequency: "None" },
  { id: 24, name: "Music Album", price: -10, gender: "Any", active: false, odds: 1.0, frequency: "None" },
  { 
    id: 25, 
    name: "Pokemon Card Pack", 
    price: -15, 
    gender: "Boy", 
    active: true, 
    odds: 1.0, 
    frequency: "None",
    pricing: {
      type: PRICING_TYPE.LIST,
      options: [5, 15, 30, 50],
    }
  },
  { id: 26, name: "Funko Pop", price: -20, gender: "Girl", active: true, odds: 1.0, frequency: "None" },
  { id: 27, name: "Labubu", price: -40, gender: "Girl", active: true, odds: 1.0, frequency: "None" },
  { id: 28, name: "Stanley Cup", price: -50, gender: "Girl", active: true, odds: 1.0, frequency: "None" },
  { id: 29, name: "Boba", price: -8, gender: "Girl", active: true, odds: 1.0, frequency: "None" },
  { id: 30, name: "Mow The Lawn", price: 10, gender: "Any", active: true, odds: 1.0, frequency: 1 },
  { id: 31, name: "Clean The Garage", price: 30, gender: "Any", active: true, odds: 1.0, frequency: 1 },
  { id: 32, name: "Deep Clean the Bathroom", price: 70, gender: "Any", active: true, odds: 1.0, frequency: 30 },
];

// Preset "personalities" with custom weights and item selections
export const defaultPersonalities = [
  {
    id: "default",
    name: "Default",
    description: "Standard configuration from spreadsheet",
    gender: "Any",
    items: {} // Empty means use default values
  },
  {
    id: "gamer-boy",
    name: "Gamer Boy",
    description: "Loves video games, tech, and gaming culture",
    gender: "Boy",
    items: {
      1: { active: true, odds: 7.0 },   // Video Game - high priority
      11: { active: true, odds: 5.0 },  // PS5 - very high priority
      21: { active: true, odds: 2 },  // Arcade Session
      23: { active: true, odds: 1.5 },  // Robux - enable and boost
      4: { active: true, odds: 1 },   // Anime Convention Ticket
      25: { active: true, odds: 1 },  // Pokemon Card Pack
    }
  },
  {
    id: "fashionista-girl",
    name: "Fashionista Girl",
    description: "Loves trendy clothes, accessories, and style",
    gender: "Girl",
    items: {
      3: { active: true, odds: 2.0 },   // Trendy Jeans
      6: { active: true, odds: 2.0 },   // Trendy T-shirt
      27: { active: true, odds: 6 },  // Labubu - collectibles
      28: { active: true, odds: 6 },  // Stanley Cup
      26: { active: true, odds: 6 },  // Funko Pop
      29: { active: true, odds: 5 },  // Boba
    }
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Loves hanging out with friends and experiences",
    gender: "Any",
    items: {
      20: { active: true, odds: 4 },  // Six Flags Visit
      18: { active: true, odds: 5 },  // Music Festival Ticket
      14: { active: true, odds: 6.0 },  // Gift For Friend
      29: { active: true, odds: 8.0 },  // Boba
      22: { active: true, odds: 7 },  // Movie Ticket
      21: { active: true, odds: 4 },  // Arcade Session
    }
  },
  {
    id: "hard-worker",
    name: "Hard Worker",
    description: "Focused on earning money through chores",
    gender: "Any",
    items: {
      30: { active: true, odds: 3.0 },  // Mow The Lawn
      31: { active: true, odds: 2.5 },  // Clean The Garage
      32: { active: true, odds: 2.0 },  // Deep Clean the Bathroom
      // Lower odds for spending
      1: { active: true, odds: 0.3 },
      3: { active: true, odds: 0.3 },
      11: { active: false },
      18: { active: false },
    }
  },
  {
    id: "big-spender",
    name: "Big Spender",
    description: "Goes for the expensive items",
    gender: "Any",
    items: {
      11: { active: true, odds: 2.5 },  // PS5
      5: { active: true, odds: 2.0 },   // Trendy Nike Sneakers
      18: { active: true, odds: 2.0 },  // Music Festival Ticket
      4: { active: true, odds: 1.8 },   // Anime Convention Ticket
      8: { active: true, odds: 1.5 },   // Skateboard
      // Lower odds for earning
      30: { active: true, odds: 0.5 },
      31: { active: true, odds: 0.3 },
      32: { active: true, odds: 0.2 },
    }
  },
];
