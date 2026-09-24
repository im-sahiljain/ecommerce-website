export type GuideDefinition = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  paragraphs: string[];
  shopHref: string;
  shopLabel: string;
};

export const GUIDES: GuideDefinition[] = [
  {
    slug: "plaster-painting-kits-for-kids",
    title: "Plaster Painting Kits for Kids",
    description:
      "Ready-to-paint plaster figurines for kids in India. Non-toxic POP painting kits for ages 4 and up, with animals, flowers, and little friends.",
    h1: "Plaster painting kits for kids",
    paragraphs: [
      "Kits & Craft plaster painting kits are ready-to-paint figurines for children. Each piece is cast in plaster of Paris, finished smooth enough for little hands, and meant to be painted at home.",
      "The sets suit ages 4 and up. Animals, flowers, and small friends give kids a finished object they can display after the paint dries.",
    ],
    shopHref: "/shop",
    shopLabel: "Shop kids’ painting kits",
  },
  {
    slug: "birthday-return-gifts",
    title: "Birthday Return Gift Craft Kits",
    description:
      "DIY plaster painting kits for birthday return gifts in India. Pack several ready-to-paint figurines for a party without a last-minute store run.",
    h1: "Birthday return gift craft kits",
    paragraphs: [
      "A plaster painting kit works as a birthday return gift because every child leaves with something to make. The figurine, not a sweet, is the gift.",
      "Party packs group several pieces so you can hand out matching kits. Single figurines work when you want each guest to pick a different animal or flower.",
    ],
    shopHref: "/shop",
    shopLabel: "Shop return gift kits",
  },
  {
    slug: "home-decor-figurines",
    title: "Plaster Figurines for Home Décor",
    description:
      "Small plaster pots and figurines you paint at home. Shelf and desk décor kits from Kits & Craft, finished by you.",
    h1: "Plaster figurines for home décor",
    paragraphs: [
      "Painted plaster pieces sit on a shelf or desk after the craft is done. Small pots are shaped for that: a hexagonal, heart, or octagonal pot becomes a holder once the paint dries.",
      "The same non-toxic plaster used in the kids’ kits is used for these décor pieces, so a family can paint them together.",
    ],
    shopHref: "/shop/pot",
    shopLabel: "Shop plaster pots",
  },
];

export function guideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}
