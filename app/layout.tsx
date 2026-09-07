import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '未赴之约 · 霍格沃茨',
  description: '五语言单机叙事探索。在霍格沃茨分院、解谜、寻找城堡的小秘密，并走进斯内普的一段平行故事。',
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><head><meta name="theme-color" content="#111c24"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/></head><body>{children}</body></html>;}
