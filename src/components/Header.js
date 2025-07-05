"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function Header() {
    const { user, supabase } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("ログアウトしました");
            setIsDropdownOpen(false);
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

    return (
        <header className="border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        雑学DB
                    </Link>

                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/search">
                                    <Button variant="ghost" size="sm">
                                        <Search className="w-4 h-4 mr-2" />
                                        検索
                                    </Button>
                                </Link>

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
                            <>
                                <Link href="/search">
                                    <Button variant="ghost" size="sm">
                                        <Search className="w-4 h-4 mr-2" />
                                        検索
                                    </Button>
                                </Link>

                                <Link href="/login">
                                    <Button variant="outline" size="sm">
                                        ログイン
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
