/**
 * Species records live apart from the viewer and UI, so new museum entries
 * can be added here without changing the rendering code.
 */

export type AnatomyLayer = "outerBody" | "muscles" | "skeleton";

/**
 * One clickable exterior region of a model. The viewer picks he region whose
 * named rig joint (boneName) is nearest to the click. The bone names must
 * match the real names inside that specific GLB file.
 */
export type BodyRegion = {
  id: string;
  name: string;
  boneName: string;
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
  /** Only list a region if the model has a rig joint for it. */
  regions?: BodyRegion[];
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
    regions: [
      {
        id: "head",
        name: "Head",
        boneName: "Head",
        note: "A lion uses its head for sight, hearing, smell, and biting. The model shows only its outer shape, not the skull or brain.",
      },
      {
        id: "torso",
        name: "Torso",
        boneName: "Spine",
        note: "The torso contains the heart and lungs and connects the limbs. No internal organs are visible in this model.",
      },
      {
        id: "forelimbs",
        name: "Forelimbs",
        boneName: "LeftLegF",
        note: "A lion's forelimbs help it grapple with prey and support its weight. This model does not show the muscles or bones inside them.",
      },
      {
        id: "hindlimbs",
        name: "Hindlimbs",
        boneName: "LeftLegB",
        note: "The hindlimbs contribute to powerful acceleration and leaps. The mesh shows the outside body only.",
      },
      {
        id: "tail",
        name: "Tail",
        boneName: "Tail",
        note: "A lion's tail helps with balance and carries a dark tuft at the tip. The focus identifies its outer body region.",
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
    modelAvailable: false,
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
    modelAvailable: false,
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
    modelAvailable: false,
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
    modelAvailable: false,
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
    modelAvailable: false,
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
