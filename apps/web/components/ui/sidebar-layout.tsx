"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useSidebar } from "@/components/ui/sidebar"

import { ChevronRight, Sparkles, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { trackEvent, AMPLITUDE_EVENTS } from "@/lib/amplitude"
import { sections } from "@/lib/navigation"
import { News } from "@/components/ui/news"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SidebarState = {
  openSections: Record<string, boolean>
  scrollPosition: number
}

const sidebarStateAtom = atomWithStorage<SidebarState>("sidebarState", {
  openSections: { "Landing Pages": true, "UI elements": true },
  scrollPosition: 0,
})

export function AppSidebar() {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLAnchorElement>(null)
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom)
  const initialRender = useRef(true)
  const { toggleSidebar, open } = useSidebar()

  useEffect(() => {
    if (initialRender.current && sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarState.scrollPosition
      initialRender.current = false
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (
        e.code === "KeyS" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault()
        toggleSidebar()
        if (!open) {
          setTimeout(() => {
            firstItemRef.current?.focus()
          }, 100)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar, open])

  const handleScroll = () => {
    if (sidebarRef.current) {
      setSidebarState((prev) => ({
        ...prev,
        scrollPosition: sidebarRef.current?.scrollTop || 0,
      }))
    }
  }

  if (!sidebarState) {
    return null
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarRail />
      <SidebarContent
        className="mt-14 pb-[400px]"
        ref={sidebarRef}
        onScroll={handleScroll}
        suppressHydrationWarning
      >
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/pro"}
                onClick={() => {
                  trackEvent(AMPLITUDE_EVENTS.VIEW_SIDEBAR_SECTION, {
                    sectionTitle: "Pro Components",
                    path: "/pro",
                  })
                }}
              >
                <a
                  ref={firstItemRef}
                  href="/pro"
                  className="flex items-center gap-2"
                  tabIndex={0}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pro Components</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/authors"}
                onClick={() => {
                  trackEvent(AMPLITUDE_EVENTS.VIEW_SIDEBAR_SECTION, {
                    sectionTitle: "Authors",
                    path: "/authors",
                  })
                }}
              >
                <a href="/authors" className="flex items-center gap-2">
                  <UsersRound className="w-4 h-4" />
                  <span>Top Authors</span>
                  <Badge className="ml-1.5 text-xs bg-[#adfa1d] text-black px-1.5 rounded-md pointer-events-none select-none">
                    New
                  </Badge>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {sections.map((section) => (
              <Collapsible
                key={section.title}
                asChild
                open={sidebarState.openSections[section.title]}
                onOpenChange={(isOpen) => {
                  setSidebarState((prev) => ({
                    ...prev,
                    openSections: {
                      ...prev.openSections,
                      [section.title]: isOpen,
                    },
                  }))
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={section.title}>
                      {<section.icon className="w-4 h-4" />}
                      <span>{section.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === item.href}
                            onClick={() => {
                              trackEvent(
                                AMPLITUDE_EVENTS.VIEW_SIDEBAR_SECTION,
                                {
                                  sectionTitle: section.title,
                                  itemTitle: item.title,
                                  path: item.href,
                                },
                              )
                            }}
                          >
                            <a
                              href={item.href}
                              className="flex items-center justify-between w-full"
                            >
                              <span>{item.title}</span>
                              {item.isNew && (
                                <Badge className="ml-1.5 text-xs bg-[#adfa1d] text-black px-1.5 rounded-md pointer-events-none select-none">
                                  New
                                </Badge>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/s/hook"}
                onClick={() => {
                  trackEvent(AMPLITUDE_EVENTS.VIEW_SIDEBAR_SECTION, {
                    sectionTitle: "Hooks",
                    path: "/s/hook",
                  })
                }}
              >
                <a href="/s/hook" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Hooks</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="fixed bottom-4 left-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger />
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-1.5" side="right">
            <span>Toggle Sidebar</span>
            <kbd className="pointer-events-none h-5 text-muted-foreground select-none items-center gap-1 rounded border bg-muted px-1.5 opacity-100 flex text-[11px] leading-none font-sans">
              S
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </Sidebar>
  )
}
