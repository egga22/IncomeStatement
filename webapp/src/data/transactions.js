// Intention types
export const INTENTION_TYPE = {
  STANDARD: 'standard',  // Teen still buys other things while saving
  INTENSE: 'intense',    // Teen only earns until goal is reached (rare)
};

// Default transactions from the original spreadsheet
// All items enabled by default with 1.0 probability modifier
// frequency: None = no limit, or number of days between occurrences
// weekendOnly: true = item only available on Saturday/Sunday, false = available any day
export const defaultTransactions = [
  { id: 1, name: "Video Game", price: -70, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 2, name: "Art Supplies", price: -45, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 3, name: "Trendy Jeans", price: -50, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 4, name: "Anime Convention Ticket", price: -150, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: true },
  { id: 5, name: "Trendy Nike Sneakers", price: -120, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 6, name: "Trendy T-shirt", price: -25, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 7, name: "Airsoft Gun", price: -30, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 8, name: "Skateboard", price: -100, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 9, name: "New Lego Set", price: -80, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 10, name: "Poster For Room", price: -60, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 11, name: "PS5", price: -500, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 12, name: "Trendy Haircut", price: -35, gender: "Any", active: true, odds: 1.0, frequency: 60, weekendOnly: false },
  { id: 13, name: "Trendy Baseball Cap", price: -25, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 14, name: "Gift For Friend", price: -25, gender: "Any", active: true, odds: 1.0, frequency: 30, weekendOnly: false },
  { id: 15, name: "Gift for Girlfriend", price: -35, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 16, name: "Trendy Graphic Hoodie", price: -45, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 17, name: "Trendy Backpack", price: -45, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 18, name: "Music Festival Ticket", price: -300, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: true },
  { id: 19, name: "Baseball Game Ticket", price: -30, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 20, name: "Six Flags Visit", price: -50, gender: "Any", active: true, odds: 1.0, frequency: "None", weekendOnly: true },
  { id: 21, name: "Arcade Session", price: -15, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: true },
  { id: 22, name: "Movie Ticket", price: -15, gender: "Any", active: true, odds: 1.0, frequency: 7, weekendOnly: false },
  { id: 23, name: "Robux", price: -25, gender: "Any", active: false, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 24, name: "Music Album", price: -10, gender: "Any", active: false, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 25, name: "Pokemon Card Pack", price: -15, gender: "Boy", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 26, name: "Funko Pop", price: -20, gender: "Girl", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 27, name: "Labubu", price: -40, gender: "Girl", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 28, name: "Stanley Cup", price: -50, gender: "Girl", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 29, name: "Boba", price: -8, gender: "Girl", active: true, odds: 1.0, frequency: "None", weekendOnly: false },
  { id: 30, name: "Mow The Lawn", price: 10, gender: "Any", active: true, odds: 1.0, frequency: 1, weekendOnly: false },
  { id: 31, name: "Clean The Garage", price: 30, gender: "Any", active: true, odds: 1.0, frequency: 1, weekendOnly: false },
  { id: 32, name: "Deep Clean the Bathroom", price: 70, gender: "Any", active: true, odds: 1.0, frequency: 30, weekendOnly: false },
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
  id: "standard",
  name: "Standard",
  description: "My personal preference",
  gender: "Boy",
  items: {
    "1": {
        "active": true,
        "odds": 1,
        "frequency": 14
    },
    "2": {
        "active": false,
        "odds": 1
    },
    "3": {
        "active": false,
        "odds": 1
    },
    "4": {
        "active": false,
        "odds": 1
    },
    "5": {
        "active": true,
        "odds": 1,
        "frequency": 60
    },
    "7": {
        "active": true,
        "odds": 1,
        "frequency": 7
    },
    "8": {
        "active": true,
        "odds": 1,
        "frequency": 30
    },
    "9": {
        "active": false,
        "odds": 1
    },
    "10": {
        "active": false,
        "odds": 1
    },
    "13": {
        "active": true,
        "odds": 1,
        "frequency": 14
    },
    "15": {
        "active": true,
        "odds": 1,
        "frequency": 7
    },
    "16": {
        "active": true,
        "odds": 1,
        "frequency": 7
    },
    "17": {
        "active": true,
        "odds": 1,
        "frequency": 14
    },
    "18": {
        "active": true,
        "odds": 1,
        "frequency": 60
    },
    "19": {
        "active": true,
        "odds": 1,
        "frequency": 30
    },
    "20": {
        "active": true,
        "odds": 1,
        "frequency": 30
    },
    "21": {
        "active": true,
        "odds": 3,
        "frequency": 4
    }
}
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
