// do not cache this layout
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Digger',
  description: 'Digger',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
