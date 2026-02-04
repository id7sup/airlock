/**
 * Layout spécifique pour les pages de partage publiques
 * 
 * Ce layout ne définit pas <html> et <body> car ils sont déjà
 * définis dans le layout principal. Les pages de partage sont
 * accessibles sans authentification via la configuration dans proxy.ts.
 */

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
