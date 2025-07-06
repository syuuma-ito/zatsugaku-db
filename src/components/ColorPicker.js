"use client";

import { PRESET_COLORS } from "@/lib/utils";
import { useState } from "react";

export default function ColorPicker({ color, onColorChange, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-8 h-8 rounded border-2 border-gray-300 flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{ backgroundColor: color }}
                    disabled={disabled}
                >
                    <div className="w-4 h-4 rounded border border-white"></div>
                </button>
                <span className="text-sm text-gray-600">{color}</span>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((presetColor) => (
                            <button
                                key={presetColor}
                                type="button"
                                onClick={() => {
                                    onColorChange(presetColor);
                                    setIsOpen(false);
                                }}
                                className={`w-8 h-8 rounded border-2 transition-all ${color === presetColor ? "border-gray-800 scale-110" : "border-gray-300 hover:border-gray-500"}`}
                                style={{ backgroundColor: presetColor }}
                                title={presetColor}
                            />
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                        <label className="block text-xs text-gray-600 mb-1">カスタムカラー</label>
                        <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="w-full h-8 rounded border border-gray-300 cursor-pointer" />
                    </div>
                </div>
            )}

            {/* オーバーレイ */}
            {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
