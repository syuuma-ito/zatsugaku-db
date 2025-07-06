import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
    variable: "--font-zen-kaku-gothic-new",
    subsets: ["latin"],
    weight: ["400"],
});

export const metadata = {
    title: "雑学データベース",
    description: "雑学の閲覧、検索、管理ができるWebアプリケーション",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
            <body className={`${zenKakuGothicNew.variable} antialiased`}>
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
