export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  type: 'veg' | 'non-veg';
  image: string;
  description: string;
}

export interface ParcelItem {
  id: number;
  name: string;
  price: number;
  category: 'Couple Pack' | 'Family Pack' | 'Bucket Biryani';
  type: 'veg' | 'non-veg';
  image: string;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // === VEG BIRYANI ===
  {
    id: 1,
    name: "Veg. Biryani",
    price: 180,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Fragrant basmati rice cooked with seasonal vegetables and organic spices."
  },
  {
    id: 2,
    name: "Special Veg Biryani",
    price: 230,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Premium basmati rice layered with fresh veggies, cashews, and saffron."
  },
  {
    id: 3,
    name: "Mixed Veg Biryani",
    price: 240,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "A delicious combination of fresh garden veggies, paneer, and mushrooms."
  },
  {
    id: 4,
    name: "Paneer Biryani",
    price: 230,
    category: "Veg Biryani",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Marinated cottage cheese chunks layered with slow-cooked biryani rice."
  },
  {
    id: 5,
    name: "Special Paneer Biryani",
    price: 270,
    category: "Veg Biryani",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Richly spiced paneer cubes cooked in cream and ghee layered with rice."
  },
  {
    id: 6,
    name: "Mushroom Biryani",
    price: 230,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Fresh button mushrooms tossed in masala and cooked with long grain rice."
  },
  {
    id: 7,
    name: "Special Mushroom Biryani",
    price: 280,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Spicy claypot mushrooms tossed in chef's secret dry spices with biryani rice."
  },
  {
    id: 8,
    name: "Kaju Biryani",
    price: 240,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Roasted cashew nuts cooked in a rich onion gravy and slow-cooked with basmati."
  },
  {
    id: 9,
    name: "Paneer Tikka Biryani",
    price: 260,
    category: "Veg Biryani",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Tandoor-grilled paneer tikka skewers layered with aromatic basmati rice."
  },
  {
    id: 10,
    name: "Ulavacharu Mushroom Biryani",
    price: 280,
    category: "Veg Biryani",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Basmati rice layered with juicy mushrooms and traditional Andhra horsegram soup."
  },

  // === NON-VEG BIRYANI ===
  {
    id: 11,
    name: "Plain Biryani Rice",
    price: 160,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300",
    description: "Aromatic basmati rice cooked in special biryani stock without meat pieces."
  },
  {
    id: 12,
    name: "Egg Biryani",
    price: 190,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Aromatic basmati rice served with boiled eggs cooked in spicy gravy."
  },
  {
    id: 13,
    name: "Special Egg Biryani",
    price: 230,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Double portion of spiced eggs cooked in saffron infused basmati rice."
  },
  {
    id: 14,
    name: "Chicken Dum Biryani",
    price: 260,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Traditional Hyderabadi dum biryani with marinated chicken pieces."
  },
  {
    id: 15,
    name: "Chicken Fry Biryani",
    price: 270,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Aromatic biryani rice served with crispy, spicy deep-fried chicken."
  },
  {
    id: 16,
    name: "Chicken Biryani (Bone Curry)",
    price: 270,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Classic biryani rice layered with rich, bone-in chicken curry."
  },
  {
    id: 17,
    name: "Special Chicken Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "A rich mix of boneless chicken tikka cooked with saffron basmati rice."
  },
  {
    id: 18,
    name: "Joint Chicken Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Delicious dum biryani served with tandoori grilled chicken leg joints."
  },
  {
    id: 19,
    name: "Mughlai Chicken Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Rich, creamy biryani flavored with eggs, nuts, and Mughlai gravy."
  },
  {
    id: 20,
    name: "Chicken Tikka Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300",
    description: "Charcoal-grilled chicken tikka pieces cooked inside basmati biryani."
  },
  {
    id: 21,
    name: "Chicken Wings Biryani (Dry)",
    price: 270,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "A unique biryani served with crispy, seasoned dry chicken wings."
  },
  {
    id: 22,
    name: "Chicken Wings Biryani (Semi Gravy)",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Biryani rice served with chicken wings cooked in semi-spicy onion gravy."
  },
  {
    id: 23,
    name: "Chicken Lollipop Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Basmati biryani rice topped with crispy Indo-Chinese chicken lollipops."
  },
  {
    id: 24,
    name: "Ulavacharu Chicken Biryani",
    price: 330,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Biryani rice flavored with traditional Andhra horsegram soup and chicken."
  },
  {
    id: 25,
    name: "Tangdi Kabab Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "/tandoori_chicken.png",
    description: "Premium claypot biryani served with clay-oven roasted chicken drumsticks."
  },
  {
    id: 26,
    name: "Special Mutton Biryani (Bone)",
    price: 420,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Basmati rice dum cooked with bone-in tender goat meat pieces."
  },
  {
    id: 27,
    name: "Mutton Fry Biryani",
    price: 420,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Aromatic biryani rice served with pan-fried, spiced mutton bone pieces."
  },
  {
    id: 28,
    name: "Boneless Fish Biryani",
    price: 300,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Mildly spiced basmati rice layered with crispy boneless fish cubes."
  },
  {
    id: 29,
    name: "Special Fish Biryani",
    price: 320,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Rich claypot biryani served with deep fried fish cubes in tangry gravy."
  },
  {
    id: 30,
    name: "Prawns Fry Biryani",
    price: 360,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Basmati rice served with pan-fried prawns marinated in garlic and ginger."
  },
  {
    id: 31,
    name: "Special Prawns Biryani",
    price: 360,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Spicy prawns cooked in a thick yogurt-tomato base layered with rice."
  },
  {
    id: 32,
    name: "Mixed Non-Veg Biryani",
    price: 420,
    category: "Non-Veg Biryani",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "A royal combination of chicken, mutton, and prawns cooked with basmati."
  },

  // === VEG FRIED RICE ===
  {
    id: 33,
    name: "Veg Fried Rice",
    price: 180,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Wok-tossed rice with chopped carrots, beans, and spring onions."
  },
  {
    id: 34,
    name: "Special Veg Fried Rice",
    price: 220,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Veg fried rice loaded with extra nuts, cashews, and baby corn."
  },
  {
    id: 35,
    name: "Mixed Veg Fried Rice",
    price: 220,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Stir-fried rice with assorted veggies, paneer, and button mushrooms."
  },
  {
    id: 36,
    name: "Kaju Fried Rice",
    price: 250,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "A rich fried rice loaded with butter-roasted crunchy cashew nuts."
  },
  {
    id: 37,
    name: "Zeera Rice",
    price: 220,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=300",
    description: "Steamed basmati rice tempered with cumin seeds and pure ghee."
  },
  {
    id: 38,
    name: "Paneer Fried Rice",
    price: 230,
    category: "Veg Fried Rice",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Chinese style wok-tossed rice cooked with crispy paneer cubes."
  },
  {
    id: 39,
    name: "Mushroom Fried Rice",
    price: 230,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Fluffy rice wok-tossed with fresh button mushrooms and garlic."
  },
  {
    id: 40,
    name: "Schezwan Veg Fried Rice",
    price: 200,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Spicy fried rice tossed in homemade Schezwan chilli pepper paste."
  },
  {
    id: 41,
    name: "Curd Rice",
    price: 110,
    category: "Veg Fried Rice",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Traditional South Indian rice mixed with fresh yogurt and tempered mustard."
  },

  // === NON-VEG FRIED RICE ===
  {
    id: 42,
    name: "Egg Fried Rice",
    price: 200,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Chinese classic wok-tossed rice with scrambled eggs and spring onion."
  },
  {
    id: 43,
    name: "Special Egg Fried Rice",
    price: 240,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Egg fried rice cooked with double eggs, onions, and spicy spices."
  },
  {
    id: 44,
    name: "Chicken Fried Rice",
    price: 240,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Wok-tossed rice with shredded chicken breast and fresh vegetables."
  },
  {
    id: 45,
    name: "Special Chicken Fried Rice",
    price: 290,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Wok-tossed chicken fried rice topped with spicy chicken 65 pieces."
  },
  {
    id: 46,
    name: "Prawns Fried Rice",
    price: 320,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Stir-fried rice cooked with juicy marinated baby prawns and onions."
  },
  {
    id: 47,
    name: "Mixed Non-Veg Fried Rice",
    price: 350,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Stir-fried rice loaded with a mix of chicken, egg, and baby prawns."
  },
  {
    id: 48,
    name: "Schezwan Chicken Fried Rice",
    price: 250,
    category: "Non-Veg Fried Rice",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Spicy chicken fried rice tossed in homemade Schezwan chilli gravy."
  },

  // === VEG STARTERS ===
  {
    id: 49,
    name: "Veg. Manchurian",
    price: 170,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Crispy fried vegetable balls tossed in sweet and tangy soya garlic sauce."
  },
  {
    id: 50,
    name: "Crispy Veg",
    price: 180,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Thinly sliced garden fresh vegetables golden fried and seasoned with salt."
  },
  {
    id: 51,
    name: "Dragon Veg",
    price: 180,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Exotic julienned vegetables tossed in spicy red dragon chilli sauce."
  },
  {
    id: 52,
    name: "Paneer Majestic",
    price: 240,
    category: "Veg Starters",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Tender paneer strips cooked in yogurt, mint, green chillies, and curry leaves."
  },
  {
    id: 53,
    name: "Paneer Manchurian",
    price: 220,
    category: "Veg Starters",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Paneer cubes tossed in classic soy-garlic Indo-Chinese manchurian sauce."
  },
  {
    id: 54,
    name: "Paneer 65",
    price: 220,
    category: "Veg Starters",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Deep-fried paneer cubes marinated in rich South Indian red spices."
  },
  {
    id: 55,
    name: "Chilli Paneer",
    price: 230,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Wok-tossed paneer chunks with capsicum, onion, and dark soy chilli glaze."
  },
  {
    id: 56,
    name: "Mushroom Manchurian",
    price: 230,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Crispy golden button mushrooms tossed in spicy manchurian glaze."
  },
  {
    id: 57,
    name: "Mushroom Chilli",
    price: 230,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300",
    description: "Deep fried mushrooms wok-tossed with capsicum, green chillies and garlic."
  },
  {
    id: 58,
    name: "Mushroom 65",
    price: 230,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Batter-fried mushrooms marinated in traditional ginger-garlic red paste."
  },
  {
    id: 59,
    name: "Pepper Mushroom",
    price: 240,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Dry tossed mushrooms seasoned heavily with fresh crushed black peppercorns."
  },
  {
    id: 60,
    name: "Veg. Hong Kong",
    price: 240,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    description: "Fried vegetables tossed in sweet, sour and spicy Hong Kong style sauce."
  },
  {
    id: 61,
    name: "Kaju Fry",
    price: 250,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Whole cashews pan fried in pure ghee, seasoned with salt and black pepper."
  },
  {
    id: 62,
    name: "Crispy Baby Corn",
    price: 230,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=300",
    description: "Tender baby corn fingers golden-fried and tossed with spices."
  },
  {
    id: 63,
    name: "Baby Corn Manchurian",
    price: 210,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=300",
    description: "Baby corn pieces tossed in thick Indo-Chinese sweet garlic manchurian."
  },
  {
    id: 64,
    name: "Baby Corn Chilli",
    price: 210,
    category: "Veg Starters",
    type: "veg",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=300",
    description: "Crispy baby corn stir-fried in high flame with bell peppers and green chillies."
  },

  // === NON-VEG STARTERS ===
  {
    id: 65,
    name: "RRR Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "/tandoori_chicken.png",
    description: "Hot and spicy dry chicken starter cooked in green chilli and curry leaves."
  },
  {
    id: 66,
    name: "Hot & Crispy Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Crispy breaded chicken breast strips served piping hot with garlic dip."
  },
  {
    id: 67,
    name: "Chicken Manchurian",
    price: 270,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Golden fried chicken bites tossed in ginger, garlic and soy manchurian sauce."
  },
  {
    id: 68,
    name: "Chicken 65",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Classic deep-fried chicken cubes marinated in red chillies and yogurt."
  },
  {
    id: 69,
    name: "Chilli Chicken",
    price: 290,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1598511726623-d73400609b40?auto=format&fit=crop&q=80&w=300",
    description: "Battered chicken chunks stir-fried with capsicum, onion, and dark soya glaze."
  },
  {
    id: 70,
    name: "American Chicken",
    price: 290,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Golden fried chicken fingers glazed with sweet honey and garlic sauce."
  },
  {
    id: 71,
    name: "Chicken Fry Bone",
    price: 270,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Traditional bone-in chicken pieces deep fried in dry southern spices."
  },
  {
    id: 72,
    name: "Chicken Fry Boneless",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Boneless chicken breast nuggets deep fried in spicy corn flour batter."
  },
  {
    id: 73,
    name: "Chicken Wings (Dry)",
    price: 280,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Crispy chicken wings seasoned dry with ginger, salt, and red pepper."
  },
  {
    id: 74,
    name: "Chicken Wings (Semi Gravy)",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Juicy chicken wings coated in semi-dry garlic and red pepper paste."
  },
  {
    id: 75,
    name: "Chicken Lollipop",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Crispy deep-fried chicken wings pulled down and tossed in schezwan sauce."
  },
  {
    id: 76,
    name: "Chicken 555",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Marinated chicken strips wok-tossed with cashews, yogurt, and red pepper."
  },
  {
    id: 77,
    name: "Chilli Wings",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Chicken wings fried and tossed in super hot red chilli garlic paste."
  },
  {
    id: 78,
    name: "Kaju Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Deep fried chicken chunks stir-fried with roasted cashew nuts and soy."
  },
  {
    id: 79,
    name: "Crispy Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Extra crunchy golden chicken nuggets dusted with salt and white pepper."
  },
  {
    id: 80,
    name: "Chicken Majestic",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300",
    description: "Chicken breast strips marinated in buttermilk and wok-tossed in yogurt."
  },
  {
    id: 81,
    name: "Dragon Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Fried chicken strips tossed in extremely hot sweet and spicy red chilli sauce."
  },
  {
    id: 82,
    name: "Lemon Chicken",
    price: 290,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Stir-fried chicken nuggets coated in tangy fresh lemon juice and syrup."
  },
  {
    id: 83,
    name: "Pepper Chicken",
    price: 290,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Dry chicken chunks sautéed with fresh onions and crushed black pepper."
  },
  {
    id: 84,
    name: "Ginger Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Stir-fried chicken breast tossed in fresh ginger juliennes and dark soy."
  },
  {
    id: 85,
    name: "Garlic Chicken",
    price: 300,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Indo-Chinese chicken starter wok-tossed with plenty of minced fresh garlic."
  },
  {
    id: 86,
    name: "Mutton Fry",
    price: 420,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Tender goat mutton bone pieces pan fried in rich Guntur dry red spices."
  },
  {
    id: 87,
    name: "Chilli Mutton",
    price: 430,
    category: "Non-Veg Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Pan-fried mutton pieces tossed in extremely hot soy chilli green gravy."
  },

  // === SEA FOOD STARTERS ===
  {
    id: 88,
    name: "Apollo Fish",
    price: 300,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Andhra classic boneless fish cubes marinated in yogurt and deep fried."
  },
  {
    id: 89,
    name: "Crispy Fish",
    price: 320,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Crumbed boneless fish fillets deep fried till extra golden and crunchy."
  },
  {
    id: 90,
    name: "Chilli Fish",
    price: 300,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Fried fish chunks tossed in wok with bell peppers, green chillies and soy."
  },
  {
    id: 91,
    name: "Prawns Fry",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Pan-fried prawns marinated in fresh ginger-garlic paste and lemon."
  },
  {
    id: 92,
    name: "Ginger Prawns",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Tossed prawns cooked in wok with julienned ginger and soy sauce."
  },
  {
    id: 93,
    name: "Garlic Prawns",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Fried prawns tossed in Chinese style garlic sauce with spring onions."
  },
  {
    id: 94,
    name: "Chilli Prawns",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Juicy prawns stir-fried in capsicum, onions, and hot chilli garlic base."
  },
  {
    id: 95,
    name: "Loose Prawns (Dry)",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Lightly battered crispy fried prawns tossed dry with spring onions."
  },
  {
    id: 96,
    name: "Pepper Prawns",
    price: 360,
    category: "Sea Food Starters",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Pan-roasted prawns tossed in crushed fresh black pepper and salt."
  },

  // === EGG ITEMS ===
  {
    id: 97,
    name: "Omelet",
    price: 80,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Fluffy double egg omelet with chopped green chillies and onions."
  },
  {
    id: 98,
    name: "Chilli Egg",
    price: 200,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Hard-boiled eggs battered, deep-fried, and tossed in chilli soya sauce."
  },
  {
    id: 99,
    name: "Egg Manchurian",
    price: 200,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Fried egg wedges cooked in Indo-Chinese garlic soy manchurian gravy."
  },
  {
    id: 100,
    name: "Egg Bhurji",
    price: 170,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Traditional Indian scrambled eggs cooked with spices, onions and coriander."
  },
  {
    id: 101,
    name: "Egg Curry",
    price: 170,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Boiled eggs cooked in a mildly spiced homestyle onion-tomato gravy."
  },
  {
    id: 102,
    name: "Methi Egg Curry",
    price: 220,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Hard-boiled eggs cooked in a highly aromatic fresh fenugreek leaf gravy."
  },
  {
    id: 103,
    name: "Egg Tomato",
    price: 180,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "A tangy egg curry cooked with boiled eggs and fresh ground tomatoes."
  },
  {
    id: 104,
    name: "Egg Kheema Curry",
    price: 180,
    category: "Egg Items",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    description: "Finely minced boiled egg scramble cooked in a rich, spicy mutton style gravy."
  },

  // === TANDOORI NON-VEG ===
  {
    id: 105,
    name: "Tandoori Chicken (Half)",
    price: 260,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "/tandoori_chicken.png",
    description: "Half chicken marinated in yogurt and tandoori spices, roasted in clay oven."
  },
  {
    id: 106,
    name: "Tandoori Chicken (Full)",
    price: 520,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "/tandoori_chicken.png",
    description: "Full chicken roasted in clay tandoor, served with mint chutney and onion rings."
  },
  {
    id: 107,
    name: "Tangdi Kebab (4 pcs)",
    price: 250,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "/tandoori_chicken.png",
    description: "Chicken drumsticks marinated in rich spice paste and grilled inside tandoor."
  },
  {
    id: 108,
    name: "Hariyali Kebab (4 pcs)",
    price: 250,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Chicken chunks marinated in mint, coriander, and spinach paste and roasted."
  },
  {
    id: 109,
    name: "Malai Kebab (4 pcs)",
    price: 250,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300",
    description: "Creamy chicken kebabs marinated in cashew paste, cheese, and fresh cream."
  },
  {
    id: 110,
    name: "Chicken Tikka",
    price: 260,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300",
    description: "Spiced chicken cubes skewered with onions and bell peppers and roasted."
  },
  {
    id: 111,
    name: "Malai Tikka",
    price: 260,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300",
    description: "Mild boneless chicken chunks marinated in cream, cheese and grilled."
  },
  {
    id: 112,
    name: "Fish Tikka",
    price: 270,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
    description: "Boneless fish cubes marinated in mustard oil, ajwain and grilled in tandoor."
  },
  {
    id: 113,
    name: "Prawns Tikka",
    price: 260,
    category: "Tandoori Non-Veg",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Marinated tiger prawns skewered and slow roasted to perfection in clay tandoor."
  },

  // === TANDOORI VEG ===
  {
    id: 114,
    name: "Malai Paneer",
    price: 250,
    category: "Tandoori Veg",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Cottage cheese cubes marinated in rich cream, cashews, and cardamom and grilled."
  },
  {
    id: 115,
    name: "Paneer Tikka",
    price: 250,
    category: "Tandoori Veg",
    type: "veg",
    image: "/paneer_tikka.png",
    description: "Traditional clay-oven grilled paneer tikka skewered with tomatoes and onions."
  }
];

export const PARCEL_ITEMS: ParcelItem[] = [
  // === COUPLE PACKS ===
  {
    id: 201,
    name: "Chicken Dum Biryani (Couple)",
    price: 360,
    category: "Couple Pack",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Aromatic Hyderabadi chicken dum biryani. Perfect portion for two people."
  },
  {
    id: 202,
    name: "Chicken Fry Biryani (Couple)",
    price: 370,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Aromatic biryani rice served with crispy, spicy fried chicken. Serves two."
  },
  {
    id: 203,
    name: "Chicken B/L Fry Biryani (Couple)",
    price: 400,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Biryani rice served with boneless fried chicken cubes. Serves two."
  },
  {
    id: 204,
    name: "Chicken Wings Biryani (Couple - Dry)",
    price: 380,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Dum biryani rice paired with crispy seasoned dry chicken wings. Serves two."
  },
  {
    id: 205,
    name: "Chicken Wings Biryani (Couple - Semi Gravy)",
    price: 400,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Biryani rice topped with chicken wings cooked in onion gravy. Serves two."
  },
  {
    id: 206,
    name: "Chicken Lollipop Biryani (Couple)",
    price: 400,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Golden fried chicken lollipops served over spiced biryani rice. Serves two."
  },
  {
    id: 207,
    name: "Mutton Biryani (Couple)",
    price: 500,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300",
    description: "Basmati rice dum cooked with bone-in tender mutton pieces. Serves two."
  },
  {
    id: 208,
    name: "Prawns Biryani (Couple)",
    price: 460,
    category: "Couple Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Biryani rice cooked with spicy marinated prawns and yogurt. Serves two."
  },

  // === FAMILY PACKS ===
  {
    id: 301,
    name: "Family Dum Biryani (Chicken)",
    price: 630,
    category: "Family Pack",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Hyderabadi chicken dum biryani in family portion. Serves 3-4 people."
  },
  {
    id: 302,
    name: "Family Fry Biryani (Chicken)",
    price: 680,
    category: "Family Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Basmati biryani rice served with a large family pack of fried chicken. Serves 3-4."
  },
  {
    id: 303,
    name: "Family Wings Biryani (Dry)",
    price: 700,
    category: "Family Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Family portion of biryani served with crispy seasoned dry chicken wings. Serves 3-4."
  },
  {
    id: 304,
    name: "Family Wings Biryani (Semi Gravy)",
    price: 740,
    category: "Family Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Large pack of wings cooked in onion gravy served over biryani rice. Serves 3-4."
  },
  {
    id: 305,
    name: "Family Lollipop Biryani (Chicken)",
    price: 740,
    category: "Family Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "A huge portion of lollipop biryani for groups. Serves 3-4."
  },
  {
    id: 306,
    name: "Family Special Biryani (Chicken)",
    price: 700,
    category: "Family Pack",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Chef's special boneless chicken tikka family pack. Serves 3-4."
  },
  {
    id: 307,
    name: "Family Prawns Biryani",
    price: 750,
    category: "Family Pack",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    description: "Family portion of spiced prawns biryani. Serves 3-4."
  },

  // === BUCKET BIRYANI ===
  {
    id: 401,
    name: "Bucket Dum Biryani (Chicken)",
    price: 700,
    category: "Bucket Biryani",
    type: "non-veg",
    image: "/special_dum_biryani.png",
    description: "Traditional Hyderabadi chicken dum biryani served in a large take-out bucket. Serves 4-5."
  },
  {
    id: 402,
    name: "Bucket Fry Biryani (Chicken)",
    price: 780,
    category: "Bucket Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300",
    description: "Giant bucket of biryani rice topped with crispy bone-in/boneless fried chicken. Serves 4-5."
  },
  {
    id: 403,
    name: "Bucket Wings Biryani (Chicken)",
    price: 770,
    category: "Bucket Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "A large take-out bucket of wings biryani with extra wings. Serves 4-5."
  },
  {
    id: 404,
    name: "Bucket Wings Biryani (Semi Gravy)",
    price: 830,
    category: "Bucket Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Bucket of biryani rice served with wings cooked in semi-dry gravy. Serves 4-5."
  },
  {
    id: 405,
    name: "Bucket Lollipop Biryani (Chicken)",
    price: 830,
    category: "Bucket Biryani",
    type: "non-veg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300",
    description: "Super large bucket of lollipop chicken biryani. Serves 4-5."
  }
];
