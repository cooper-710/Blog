import type { ArticleCategory } from "@/lib/types";
import { categories } from "@/lib/utils";

export type FocusArea = {
  title: ArticleCategory;
  category: ArticleCategory;
  image: string;
  imagePosition: string;
};

const focusAreaMeta: Record<ArticleCategory, { image: string; imagePosition: string }> = {
  Pitching: {
    image: "/focus-areas/pitching.png",
    imagePosition: "center 18%"
  },
  Hitting: {
    image: "/focus-areas/hitting.png",
    imagePosition: "center 42%"
  },
  Biomechanics: {
    image: "/focus-areas/biomechanics.png",
    imagePosition: "center"
  },
  Training: {
    image: "/focus-areas/training.png",
    imagePosition: "center"
  },
  Technology: {
    image: "/focus-areas/technology.png",
    imagePosition: "center 55%"
  },
  "Case Studies": {
    image: "/focus-areas/case-studies.png",
    imagePosition: "center"
  }
};

export const focusAreas: FocusArea[] = categories.map((category) => ({
  title: category,
  category,
  ...focusAreaMeta[category]
}));
