/**
 * Species records live apart from the viewer and UI, so new museum entries
 * can be added here without changing the rendering code.
 */

export type AnatomyLayer = "outerBody" | "muscles" | "skeleton";

/**
 * One clickable dot on a model. position is a spot inside the model's bounding
 * box on a 0 to 1 scale: x = left to right, y = bottom to top, z = back to front.
 * normal is the direction the surface faces there; the dot hides when that
 * direction points away from the camera.
 */
export type Hotspot = {
  id: string;
  name: string;
  position: [number, number, number];
  normal: [number, number, number];
  /** Keep it short: one ot two sentences. */
  note: string;
};

export type SpeciesRecord = {
  id: string;
  name: string;
  scientificName: string;
  className: string;
  /** Font Awesome class for the gallery (free set only; fa-paw is the fallback). */
  icon: string;
  habitat: string;
  habitatTags: string[];
  range: string;
  diet: string;
  movement: string;
  adaptations: string[];
  facts: string[];
  modelPath?: string;
  modelAvailable: boolean;
  /** Name of the idle animation clip inside the GLB, if it has one. Defaults to 'idle'. */
  idleClip?: string;
  /** Dots placed on the model that explain a body part when clicked. */
  hotspots?: Hotspot[];
  /** 'model' = dot positions are exact points on the model. Leave out for the old to 1 style (lion). */
  hotspotSpace?: "box" | "model";
  /** Only enable a layer when its actual geometry is present in the linked asset. */
  availableLayers?: AnatomyLayer[];
};

export const species: SpeciesRecord[] = [
  {
    id: "lion",
    name: "Lion",
    scientificName: "Panthera leo",
    className: "Mammal . Felidae",
    icon: "fa-cat",
    habitat: "Savannas, grasslands, and open woodlands",
    range: "Sub-Saharan Africa",
    diet: "Carnivore",
    movement: "Walks on four limbs; bursts into a sprint when hunting.",
    adaptations: [
      "Forward-facing eyes for depth perception",
      "Retractable claws",
      "A social pride structure",
    ],
    facts: [
      "A lion's roar can carry for several kilometres.",
      "Lionesses do most group hunting, though males also hunt.",
    ],
    modelPath: "/models/lion/scene.gltf",
    modelAvailable: true,
    habitatTags: ["Savanna", "Grassland", "Woodland"],
    availableLayers: ["outerBody"],
    // These descriptions cover visible external regions only. The lion asset has
    // no internal anatomy, so none of this implies a hidden skeleton or muscles.
    hotspots: [
      {
        id: "head",
        name: "Head",
        position: [0.5, 0.8, 0.97],
        normal: [0, 0.2, 1],
        note: "Large canine teeth and strong jaw muscles let a lion grip and hold its prey.",
      },
      {
        id: "mane",
        name: "Mane",
        position: [0.85, 0.7, 0.85],
        normal: [1, 0, 0],
        note: "Only adult males grow a mane. It may signal age and strength to rivals and may help protect the neck in fights.",
      },
      {
        id: "foreleg",
        name: "Foreleg",
        position: [0.8, 0.4, 0.8],
        normal: [1, 0, 0],
        note: "Heavily muscled forelegs help a lion grapple with and pull down large prey.",
      },
      {
        id: "paws",
        name: "Paws and claws",
        position: [0.75, 0.04, 0.88],
        normal: [0.2, 0, 1],
        note: "Lions pull their claws back into sheaths so they stay sharp, and extend them to grip prey.",
      },
      {
        id: "chest",
        name: "Chest and ribs",
        position: [0.88, 0.58, 0.55],
        normal: [1, 0, 0],
        note: "A deep chest leaves room for big lungs and a strong heart, which power short bursts of speed.",
      },
      {
        id: "belly",
        name: "Belly",
        position: [0.8, 0.4, 0.5],
        normal: [1, -0.2, 0],
        note: "A lion can eat a very large meal at one time, then rest for long periods.",
      },
      {
        id: "hindleg",
        name: "Hind leg",
        position: [0.82, 0.42, 0.22],
        normal: [1, 0, 0],
        note: "Powerful hind legs drive sprints and leaps.",
      },
      {
        id: "tail",
        name: "Tail",
        position: [0.5, 0.45, 0.02],
        normal: [0, 0, -1],
        note: "The tail helps with balance and ends in a dark tuft of hair.",
      },
    ],
  },
  {
    id: "elephant",
    name: "Elephant",
    scientificName: "Elephantidae (family; multiple species)",
    className: "Mammal . Elephantidae",
    icon: "fa-paw",
    habitat: "Savannas, forests, and wetlands",
    range: "Africa and parts of Asia",
    diet: "Herbivore",
    movement:
      "A steady four-legged walk; cannot lift all feet off the ground at once.",
    adaptations: [
      "The trunk is used for breathing, grasping, and drinking",
      "Large ears help release heat",
      "Tusks can move soil and strip bark",
    ],
    facts: [
      "Elephants communicate with low-frequency sounds.",
      "A trunk is a muscular organ with no bones.",
    ],
    modelPath: "/models/elephant/scene.gltf",
    modelAvailable: true,
    availableLayers: ["outerBody"],
    hotspots: [
      {
        id: "trunk",
        name: "Trunk",
        position: [0.5, 0.35, 0.97],
        normal: [0, 0, 1],
        note: "The trunk is a muscular organ with no bones. It breathes, smells, grasps and drinks.",
      },
      {
        id: "tusk",
        name: "Tusk",
        position: [0.62, 0.4, 0.93],
        normal: [1, 0, 0.3],
        note: "Tusks are long incisor teeth. Elephants use them to dig, strip bark and move objects.",
      },
      {
        id: "ear",
        name: "Ear",
        position: [0.88, 0.7, 0.78],
        normal: [1, 0, 0],
        note: "Large ears are full of blood vessels. Flapping them helps release body heat.",
      },
      {
        id: "skin",
        name: "Skin",
        position: [0.88, 0.55, 0.5],
        normal: [1, 0, 0],
        note: "Thick, wrinkled skin holds mud and moisture, which helps protect it from sun and insects.",
      },
      {
        id: "legs",
        name: "Legs and feet",
        position: [0.8, 0.12, 0.75],
        normal: [1, 0, 0],
        note: "Pillar-like legs carry the huge body. A fatty cushion in each foot spreads the weight.",
      },
      {
        id: "tail",
        name: "Tail",
        position: [0.5, 0.5, 0.02],
        normal: [0, 0, -1],
        note: "The tail ends in a tuft of coarse hair and swats away flies.",
      },
    ],
    habitatTags: ["Savanna", "Grassland", "Woodland"],
  },
  {
    id: "giraffe",
    name: "Giraffe",
    scientificName: "Giraffa spp. (multiple species)",
    className: "Mammal . Giraffidae",
    icon: "fa-paw",
    habitat: "Dry savannas and open woodlands",
    range: "Sub-Saharan Africa",
    diet: "Herbivore",
    movement: "Walks with a pacing gait; gallops at speed.",
    adaptations: [
      "A long tongue reaches leaves among thorns",
      "Specialized circulation supports blood flow to the elevated head",
      "Distinctive coat patterns help break up the body outline",
    ],
    facts: [
      "Each giraffe has a unique coat pattern.",
      "A giraffe's neck has seven vertebrae, like a human's.",
    ],
    modelPath: "/models/giraffe/scene.gltf",
    modelAvailable: true,
    availableLayers: ["outerBody"],
    hotspots: [
      {
        id: "ossicones",
        name: "Ossicones",
        position: [0.5, 0.97, 0.88],
        normal: [0, 1, 0.3],
        note: "These horn-like knobs are bone covered in skin and hair.",
      },
      {
        id: "head",
        name: "Head and tongue",
        position: [0.5, 0.88, 0.95],
        normal: [0, 0.2, 1],
        note: "A long, dark tongue wraps around thorny branches and strips off leaves.",
      },
      {
        id: "neck",
        name: "Neck",
        position: [0.85, 0.7, 0.8],
        normal: [1, 0, 0],
        note: "A giraffe’s neck has seven vertebrae, the same number as a human’s, but each one is very long.",
      },
      {
        id: "coat",
        name: "Coat",
        position: [0.88, 0.45, 0.45],
        normal: [1, 0, 0],
        note: "Every giraffe has its own coat pattern, which helps break up its outline.",
      },
      {
        id: "legs",
        name: "Legs",
        position: [0.8, 0.22, 0.7],
        normal: [1, 0, 0],
        note: "Very long legs give long strides, and a kick can seriously injure a predator.",
      },
      {
        id: "hooves",
        name: "Hooves",
        position: [0.8, 0.03, 0.7],
        normal: [1, 0, 0.2],
        note: "Each foot ends in a large two-toed hoof.",
      },
      {
        id: "tail",
        name: "Tail",
        position: [0.5, 0.45, 0.03],
        normal: [0, 0, -1],
        note: "The tail ends in a tuft of long dark hair that swats flies.",
      },
    ],
    habitatTags: ["Savanna", "Woodland"],
  },
  {
    id: "kangaroo",
    name: "Kangaroo",
    scientificName: "Macropodidae (family)",
    className: "Mammal . Macropodidae",
    icon: "fa-paw",
    habitat: "Open grasslands and scrub",
    range: "Australia",
    diet: "Herbivore",
    movement: "Hops using powerful hind legs and balances with its tail.",
    adaptations: [
      "Elastic tendons return energy during hopping",
      "A pouch carries a developing joey",
      "Tail acts as a support while moving moving slowly",
    ],
    facts: [
      "While hopping, kangaroos land on both hind feet together; in water they can kick them separately.",
      "A group of kangaroos is commonly called a mob.",
    ],
    modelPath: "/models/kangaroo/scene.gltf",
    modelAvailable: true,
    availableLayers: ["outerBody"],
    hotspotSpace: "model",
    hotspots: [
      {
        id: "ears",
        name: "Ears",
        note: "Large ears can turn separately to pick up sounds from different directions.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "arms",
        name: "Forelimbs",
        note: "Short forelimbs with clawed fingers are used for grooming and feeding.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "pouch",
        name: "Pouch",
        note: "Female kangaroos carry a developing joey in a pouch.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "legs",
        name: "Hind legs",
        note: "Elastic tendons in the powerful hind legs return energy with every hop.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "feet",
        name: "Hind feet",
        note: "Long, narrow hind feet push off the ground for each hop.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "tail",
        name: "Tail",
        note: "The thick tail balances the body and acts as a support when moving slowly.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
    ],
    habitatTags: ["Grassland", "Scrub"],
  },
  {
    id: "tiger",
    name: "Tiger",
    scientificName: "Panthera tigris",
    className: "Mammal . Felidae",
    icon: "fa-cat",
    habitat: "Forests, grasslands, and mangrove swamps",
    range: "South and East Asia",
    diet: "Carnivore",
    movement: "A stealthy walk followed by a short, powerful pounce.",
    adaptations: [
      "Striped coat breaks up its outline",
      "Padded paws help it move quietly",
      "Strong forelimbs hold prey",
    ],
    facts: [
      "A tiger's stripes also appear on its skin.",
      "Tigers are strong swimmers.",
    ],
    modelPath: "/models/tiger/scene.gltf",
    modelAvailable: true,
    availableLayers: ["outerBody"],
    hotspotSpace: "model",
    hotspots: [
      {
        id: "head",
        name: "Head",
        note: "Strong jaws and long canine teeth grip prey. Forward-facing eyes judge distance well.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "stripes",
        name: "Stripes",
        note: "Each tiger’s stripe pattern is unique, and the stripes also mark its skin.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "foreleg",
        name: "Foreleg",
        note: "Strong forelimbs hold prey during a hunt.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "paws",
        name: "Paws",
        note: "Padded paws help it move quietly, and the claws pull back to stay sharp.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "hindleg",
        name: "Hind leg",
        note: "Powerful hind legs drive the short pounce.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "tail",
        name: "Tail",
        note: "The tail helps with balance when turning at speed.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
    ],

    habitatTags: ["Forest", "Grassland", "Wetland"],
  },
  {
    id: "wolf",
    name: "Wolf",
    scientificName: "Canis lupus",
    className: "Mammal . Canidae",
    icon: "fa-dog",
    habitat: "Forests, tundra, mountains, and grasslands",
    range: "Northern hemisphere",
    diet: "Carnivore",
    movement: "Travels long distances at a steady trot.",
    adaptations: [
      "Dense coat for cold climates",
      "Highly developed hearing and smell",
      "Pack cooperation can improve hunting success",
    ],
    facts: [
      "Wolves use scent, posture, and vocal sounds to communicate.",
      "Packs are family groups with flexible social roles.",
    ],
    modelPath: "/models/wolf/scene.gltf",
    modelAvailable: true,
    availableLayers: ["outerBody"],
    hotspotSpace: "model",
    hotspots: [
      {
        id: "head",
        name: "Head and jaws",
        note: "Adult wolves have 42 teeth. Strong jaws grip and tear food.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "ears",
        name: "Ears",
        note: "Upright ears pick up faint sounds from far away.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "snout",
        name: "Snout",
        note: "The long muzzle holds a sense of smell far sharper than ours.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "coat",
        name: "Coat",
        note: "A soft undercoat plus long outer hairs insulates against cold.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "legs",
        name: "Legs and paws",
        note: "Long legs and large paws let wolves trot long distances.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
      {
        id: "tail",
        name: "Tail",
        note: "Tail position helps signal a wolf’s mood to its pack.",
        position: [0, 0, 0],
        normal: [0, 0, 1],
      },
    ],
    habitatTags: ["Forest", "Tundra", "Mountain", "Grassland"],
  },
  {
    id: "monkey",
    name: "Monkey",
    scientificName: "Multiple species",
    className: "Mammal . Primates",
    icon: "fa-paw",
    habitat:
      "Varies by species: forests, woodlands, savannas, and other habitats",
    range: "Cental and South America, Africa, and Asia",
    diet: "Varies by species; may include fruit, leaves, seeds, insects, and other foods",
    movement: "Climbs, leaps, and moves on the ground depending on species.",
    adaptations: [
      "Grasping hands support climbing in many species",
      "Forward-facing eyes aid depth judgement",
      "Some New World monkeys use a prehensile tail to grip branches",
    ],
    facts: [
      '"Monkey" describes many different primate species, not one species.',
      "Only some monkeys have prehensile tails; Old World monkeys do not.",
    ],
    modelAvailable: false,
    habitatTags: ["Forest", "Woodland", "Savanna"],
  },
  {
    id: "hippopotamus",
    name: "Hippopotamus",
    scientificName: "Hippopotamus amphibius",
    className: "Mammal · Hippopotamidae",
    icon: "fa-hippo",
    habitat: "Rivers, lakes, and nearby grasslands",
    range: "Sub-Saharan Africa",
    diet: "Herbivore",
    movement: "Walks along riverbeds and runs on land.",
    adaptations: [
      "Eyes, ears, and nostrils sit high on the head",
      "Buoyancy helps support the body in water",
      "A reddish skin secretion offers protection from sun and microbes",
    ],
    facts: [
      "Hippos can close their nostrils underwater.",
      "They spend much of the day in water to stay cool.",
    ],
    modelAvailable: false,
    habitatTags: ["Wetland", "Grassland"],
  },
  {
    id: "crocodile",
    name: "Crocodile",
    scientificName: "Crocodylidae",
    className: "Reptile · Crocodylia",
    icon: "fa-paw",
    habitat:
      "Freshwater rivers, lakes, and wetlands; some species enter estuaries",
    range: "Africa, Asia, the Americas, and Australia",
    diet: "Carnivore",
    movement: "Uses a powerful tail to swim and a low walk on land.",
    adaptations: [
      "Eyes and nostrils remain above water while submerged",
      "Armoured scales protect the body",
      "A strong tail powers quick bursts in water",
    ],
    facts: [
      "Crocodiles replace teeth throughout their lives.",
      "They can sense movement in water through pressure receptors.",
    ],
    modelAvailable: false,
    habitatTags: ["Wetland"],
  },
  {
    id: "human",
    name: "Human",
    scientificName: "Homo sapiens",
    className: "Mammal · Hominidae",
    icon: "fa-person",
    habitat: "A wide range of terrestrial environments",
    range: "Worldwide",
    diet: "Omnivore",
    movement: "Habitual upright walking on two legs.",
    adaptations: [
      "Bipedal posture frees the hands",
      "Complex language supports shared learning",
      "Sweating helps regulate body temperature",
    ],
    facts: [
      "Humans are primates.",
      "The human skeleton has 206 bones in most adults.",
    ],
    modelAvailable: false,
    habitatTags: ["Varied"],
  },
];
