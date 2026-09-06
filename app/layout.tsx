import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '霍格沃茨 · 入夜之后',
  description: '从黑湖石桥走入霍格沃茨。手持魔杖，自由探索礼堂、图书馆与天文塔的沉浸式三维城堡。',
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><head><meta name="theme-color" content="#111c24"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/></head><body>{children}</body></html>;}
