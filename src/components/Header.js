"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Hash, LogOut, Menu, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function Header() {
    const { user, supabase } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("ログアウトしました");
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
        } catch (error) {
            toast.error("ログアウトに失敗しました");
        }
    };

    // ドロップダウン外をクリックしたら閉じる
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // デスクトップ用ナビゲーション
    const DesktopNavigation = () => (
        <nav className="hidden md:flex items-center space-x-4">
            <Link href="/search">
                <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    検索
                </Button>
            </Link>

            <Link href="/tags">
                <Button variant="ghost" size="sm">
                    <Hash className="w-4 h-4 mr-2" />
                    タグ
                </Button>
            </Link>

            {user ? (
                <>
                    <Link href="/zatsugaku/new">
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            追加
                        </Button>
                    </Link>

                    <div className="relative" ref={dropdownRef}>
                        <Button variant="ghost" size="sm" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                        </Button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                <div className="py-1">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        ログアウト
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <Link href="/login">
                    <Button variant="outline" size="sm">
                        ログイン
                    </Button>
                </Link>
            )}
        </nav>
    );

    // モバイル用ナビゲーション
    const MobileNavigation = ({ onItemClick }) => (
        <div className="space-y-2">
            {/* ホーム */}
            <Link href="/" onClick={onItemClick}>
                <Button variant="ghost" size="default" className="w-full justify-start h-12 text-base">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    ホーム
                </Button>
            </Link>

            {/* 検索 */}
            <Link href="/search" onClick={onItemClick}>
                <Button variant="ghost" size="default" className="w-full justify-start h-12 text-base">
                    <Search className="w-5 h-5 mr-3" />
                    検索
                </Button>
            </Link>

            {/* タグ */}
            <Link href="/tags" onClick={onItemClick}>
                <Button variant="ghost" size="default" className="w-full justify-start h-12 text-base">
                    <Hash className="w-5 h-5 mr-3" />
                    タグ
                </Button>
            </Link>

            {/* 追加（ログイン時のみ表示） */}
            {user && (
                <Link href="/zatsugaku/new" onClick={onItemClick}>
                    <Button variant="ghost" size="default" className="w-full justify-start h-12 text-base">
                        <Plus className="w-5 h-5 mr-3" />
                        追加
                    </Button>
                </Link>
            )}

            {/* ナビゲーションとログイン関係の間の隙間 */}
            <div className="h-6"></div>

            {/* ログイン情報（ログイン時のみ表示） */}
            {user && (
                <div className="px-4 py-3 text-sm text-gray-600 border border-gray-200 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">ログイン中</div>
                    <div className="font-medium">{user.email}</div>
                </div>
            )}

            {/* ログアウト/ログインボタン */}
            {user ? (
                <Button
                    variant="ghost"
                    size="default"
                    onClick={() => {
                        handleLogout();
                        onItemClick();
                    }}
                    className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    ログアウト
                </Button>
            ) : (
                <Link href="/login" onClick={onItemClick}>
                    <Button variant="ghost" size="default" className="w-full justify-start h-12 text-base">
                        <User className="w-5 h-5 mr-3" />
                        ログイン
                    </Button>
                </Link>
            )}
        </div>
    );

    return (
        <header className="border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        雑学DB
                    </Link>

                    {/* デスクトップナビゲーション */}
                    <DesktopNavigation />

                    {/* モバイルハンバーガーメニュー */}
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Menu className="w-10 h-10" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[50vw] max-w-sm bg-white">
                                <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>
                                <div className="mt-8 space-y-3 px-2">
                                    <MobileNavigation onItemClick={() => setIsMobileMenuOpen(false)} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
