/* =====================================================================
   cro_slayy_holic — PRODUCT DATA
   ---------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO GROW THE SHOP.

   To add a product later:
     1. Put its photo in the  images/  folder (a phone photo is fine).
     2. Copy one { ... } block below, paste it inside "products: [ ]",
        and fill in the details. Save. Done — a new 3D podium appears.

   >>> SAVE YOUR PHOTOS with these exact names so they show up:
        images/electric-sleeve.jpg   (Pikachu / mustard + brown)
        images/fire-sleeve.jpg       (orange + green, Ember & Thread)
        images/ghost-sleeve.jpg      (purple + magenta Gengar clutch)
        images/water-sleeve.jpg      (blue + cream, Squirtle vibe)
   (Any image format works — .jpg, .png, .webp — just match the name.)
   ===================================================================== */

window.CRO_PRODUCTS = {

  categories: [
    { id: "sleeves",      label: "Granny Grid Sleeves" },
    { id: "toys",         label: "The Zoo" },
    { id: "accessories",  label: "Wear the Vibe" },
    { id: "future",       label: "Coming Soon" }
  ],

  products: [

    {
      id: "sleeve-electric",
      name: "Electric — Pikachu Laptop Sleeve",
      category: "sleeves",
      price: "DM for price",
      image: "images/electric-sleeve.jpg",
      colors: ["#e0a815", "#4a3526", "#0f0f14"],
      description: "Granny-square laptop sleeve in mustard + espresso with a hand-stitched Pikachu bolt and Poké Ball motif. Snap-button flap. Part of the Granny Grid Collection.",
      custom: false, soldOut: false, tag: "new drop"
    },

    {
      id: "sleeve-fire",
      name: "Fire — Ember & Thread Sleeve",
      category: "sleeves",
      price: "DM for price",
      image: "images/fire-sleeve.jpg",
      colors: ["#c8721f", "#2f5d3a", "#efe6d2"],
      description: "Cream + forest-green granny grid with burnt-orange blooms, a leather flame patch and Poké Ball. Cozy heritage vibes for your laptop.",
      custom: false, soldOut: false, tag: ""
    },

    {
      id: "sleeve-ghost",
      name: "Ghost / Poison — Gengar Clutch Sleeve",
      category: "sleeves",
      price: "DM for price",
      image: "images/ghost-sleeve.jpg",
      colors: ["#3a2f4a", "#8e2f63", "#c9b6ff"],
      description: "Moody purple + magenta envelope clutch sleeve with a spooky moon and Poké Ball. Button-close flap. For the dark-academia crochet crowd.",
      custom: false, soldOut: false, tag: ""
    },

    {
      id: "sleeve-water",
      name: "Water — Squirtle Blue Sleeve",
      category: "sleeves",
      price: "DM for price",
      image: "images/water-sleeve.jpg",
      colors: ["#6fa8c7", "#1f5f8b", "#efe6d2"],
      description: "Soft blue + cream granny-square sleeve with wave trim, toggle closure and a Poké Ball square. Calm, coastal, cuddly.",
      custom: false, soldOut: false, tag: ""
    }

    /*  Add your next make below (copy this block, remove the // ):
    ,{
      id: "custom-octopus",
      name: "Custom Octopus (your colors)",
      category: "toys",
      price: "from ₹600",
      image: "images/octopus.jpg",
      colors: ["#b6f0d4","#ff9ec7"],
      description: "Made-to-order amigurumi octopus in any colors you like.",
      custom: true, soldOut: false, tag: ""
    }
    */

  ]
};
