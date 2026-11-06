import "./globals.css";
export const metadata = {
  title: "COLD SKY · Documents",
  description: "Quotation and delivery note document manager"
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}