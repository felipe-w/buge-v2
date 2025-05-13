"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GroupWithMembers, User } from "@/lib/db/types";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { UserDropdown } from "./user-dropdown";

interface NavItem {
  label: string;
  url: string;
}

interface StackedLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  logoUrl: string;
  groups: GroupWithMembers[];
  user: User;
}

export function DashboardLayout({ children, navItems, logoUrl, groups, user }: StackedLayoutProps) {
  const pathname = usePathname();

  const isActive = React.useCallback(
    (url: string) => (url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url)),
    [pathname],
  );

  return (
    <div className="bg-background lg:bg-primary relative isolate flex min-h-svh w-full flex-col">
      {/* Mobile Sidebar using Sheet */}
      <Sheet>
        <header className="bg-primary flex items-center px-4">
          <div className="py-2 lg:hidden">
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="icon"
                aria-label="Open navigation"
                className="bg-foreground/40 text-primary-foreground/90 hover:bg-foreground/60 hover:text-background"
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
          </div>

          <div className="min-w-0 flex-1">
            {/* Desktop Navbar */}
            <div className="flex items-center gap-4 py-2">
              <Link href="/dashboard" aria-label="Home" className="mx-4 py-0.5 max-lg:hidden">
                <img src={logoUrl} alt="Logo" className="h-8 w-10" />
              </Link>

              <div className="flex w-full justify-center max-lg:hidden">
                <NavigationMenu>
                  <NavigationMenuList>
                    {navItems.map(({ label, url }) => (
                      <NavigationMenuItem key={label}>
                        <NavigationMenuLink
                          active={isActive(url)}
                          className="text-primary-foreground/90 hover:bg-foreground/40 hover:text-background focus:bg-foreground/40 focus:text-background data-active:bg-foreground/60 data-active:text-background data-active:border-primary-foreground/40 rounded-md px-3 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 data-active:border-b-1"
                          asChild
                        >
                          <Link href={url}>{label}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="flex-1"></div>

              <div className="mr-2">
                <UserDropdown groups={groups} user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Content */}
        <SheetContent side="left" className="bg-primary border-primary-foreground/20 w-60 border-r p-0">
          <div className="flex h-full flex-col">
            <div className="border-foreground/5 flex flex-col border-b p-4">
              <div className="mx-auto flex pt-2">
                <Link href="/dashboard" aria-label="Home">
                  <img src={logoUrl} alt="Logo" className="w-16" />
                </Link>
              </div>
            </div>

            <div className="mx-5 flex items-center py-1">
              <Separator className="bg-primary-foreground/10" orientation="horizontal" />
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <div className="flex flex-col gap-0.5">
                {navItems.map(({ label, url }) => (
                  <Link
                    key={label}
                    href={url}
                    className="text-primary-foreground/90 hover:bg-foreground/40 hover:text-background flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Content */}
      <main className="flex flex-1 flex-col pb-2 lg:px-2">
        <div className="lg:bg-background lg:ring-primary-900/5 grow p-6 lg:rounded-lg lg:p-10 lg:shadow-xs lg:ring-1">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
