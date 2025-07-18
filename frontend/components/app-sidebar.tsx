import { Calendar, Home, Inbox, Search, Settings, ChevronLeft, Menu } from "lucide-react"
 
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
    url: "/",
    icon: Home,
  },
  {
    title: "地図",
    url: "/map-back",
    icon: Search,
  },
  {
    title: "投稿",
    url: "/posts",
    icon: Inbox,
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

  return (
    <Sidebar className="bg-white/95 backdrop-blur-sm border-r shadow-lg">
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
      </SidebarContent>
    </Sidebar>
  )
}