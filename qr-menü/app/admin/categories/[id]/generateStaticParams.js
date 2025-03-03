export function generateStaticParams() {
  // Return at least the 'new' path for static generation
  return [{ id: 'new' }];
} 