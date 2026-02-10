export interface PSEOPageData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  problemTitle: string;
  problemContent: string;
  solutionTitle: string;
  solutionContent: string;
  features: { title: string; description: string }[];
  useCases: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedPages: { href: string; label: string }[];
}
