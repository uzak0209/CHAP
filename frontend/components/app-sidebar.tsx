import { Calendar, Home, Search, Settings, ChevronLeft } from "lucide-react"
import React from "react"
import { useAppDispatch, useAppSelector } from "@/store"
import { filtersActions } from "@/store/filtersSlice"
import type { Category } from "@/types/types"
// import { RefreshPopupID } from "@/app/map-back/page"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
 
// Menu items.
const items = [
  {
    title: "ホーム",
    url: "/timeline",
    icon: Home,
  },
  {
    title: "地図",
    url: "/map-back",
    icon: Search,
  },
  {
    title: "イベント",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "設定",
    url: "/settings",
    icon: Settings,
  },
]
 
export function AppSidebar() {
  const { toggleSidebar } = useSidebar()
  const dispatch = useAppDispatch()
  const selectedCategories = useAppSelector(state => state.filters.selectedCategories)
  const isChecked = (c: Category) => selectedCategories.includes(c)
  const toggle = (c: Category) => dispatch(filtersActions.toggleCategory(c))

  return (
    <Sidebar className="bg-white/95 backdrop-blur-sm border-r shadow-md">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold text-blue-600">CHAP</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full transition-colors"
            title="サイドバーを閉じる"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* カテゴリフィルタセクション */}
        <SidebarGroup>
          <SidebarGroupLabel>投稿カテゴリ</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {/* <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked('entertainment')}
                  onChange={() => toggle('entertainment')}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1 select-none">
                  <span className="text-sm">💬</span>
                  <span className="text-sm font-medium text-gray-900">娯楽目的</span>
                </div>
              </label> */}
              
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked('community')}
                  onChange={() => toggle('community')}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1 select-none">
                  <span className="text-sm">🏘️</span>
                  <span className="text-sm font-medium text-gray-900">地域住民コミュニケーション</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked('disaster')}
                  onChange={() => toggle('disaster')}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1 select-none">
                  <span className="text-sm">🚨</span>
                  <span className="text-sm font-medium text-gray-900">災害用</span>
                </div>
              </label>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}