'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  SearchIcon,
  SparklesIcon,
  LogoutIcon,
  RocketIcon,
  LightningIcon,
} from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, logout, userInfo } = useAuth();
  const pathname = usePathname();
  const isSignInPage = pathname === "/signin";

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  // 导航链接
  const navItems = [

    {
      label: "仪表盘",
      href: "/dashboard",
    },
    {
      label: "应用",
      href: "/apps",
    }
  ];

  // 检查路径是否匹配导航项
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // 如果是登录页面，不显示导航栏
  if (isSignInPage) {
    return null;
  }

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <div className="bg-gradient-to-r from-primary to-secondary p-1.5 rounded-full">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-bold text-inherit">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Dify</span>
              <span className="text-violet-500"> Dashboard</span>
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium flex items-center gap-1.5",
                  isActiveLink(item.href) && "text-primary font-medium border-b-2 border-primary pb-1"
                )}
                color="foreground"
                href={item.href}
              >
                {item.href === "/dashboard" && <RocketIcon className="w-4 h-4" />}
                {item.href === "/apps" && <LightningIcon className="w-4 h-4" />}
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {userInfo && (
                <NextLink href="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-default-100 rounded-lg p-2 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : userInfo.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{userInfo.name || userInfo.email}</span>
                </NextLink>
              )}
              <Button
                color="danger"
                variant="flat"
                onClick={logout}
                className="text-sm font-normal"
                startContent={<LogoutIcon size={14} className="opacity-70" />}
              >
                退出
              </Button>
            </div>
          ) : (
            <Button
              as={NextLink}
              color="primary"
              href="/signin"
              className="text-sm font-normal"
              startContent={<LightningIcon className="w-4 h-4" />}
            >
              登录
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {isAuthenticated && userInfo && (
          <NextLink href="/dashboard">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : userInfo.email.charAt(0).toUpperCase()}
            </div>
          </NextLink>
        )}
        {isAuthenticated ? (
          <Button
            color="danger"
            variant="flat"
            size="sm"
            onClick={logout}
            startContent={<LogoutIcon size={12} className="opacity-70" />}
          >
            退出
          </Button>
        ) : (
          <Button
            as={NextLink}
            color="primary"
            href="/signin"
            size="sm"
            startContent={<LightningIcon className="w-4 h-4" />}
          >
            登录
          </Button>
        )}
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {userInfo && isAuthenticated && (
            <NextLink href="/dashboard">
              <div className="flex items-center gap-2 p-2 mb-4 hover:bg-default-100 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : userInfo.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{userInfo.name || userInfo.email}</p>
                  <p className="text-xs text-default-500">{userInfo.email}</p>
                  {userInfo.last_login_at && (
                    <p className="text-xs text-default-400">
                      上次登录: {new Date(userInfo.last_login_at * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </NextLink>
          )}
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                color={isActiveLink(item.href) ? "primary" : "foreground"}
                className="w-full"
                href={item.href}
                size="lg"
                startContent={
                  item.href === "/dashboard" ? <RocketIcon className="w-5 h-5" /> : 
                  item.href === "/apps" ? <LightningIcon className="w-5 h-5" /> : null
                }
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              {item.href === '/logout' ? (
                <Link
                  color="danger"
                  className="w-full"
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                  startContent={<LogoutIcon size={14} className="opacity-70" />}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  color={isActiveLink(item.href) ? 'primary' : 'foreground'}
                  href={item.href}
                  size="lg"
                  className={isActiveLink(item.href) ? 'font-medium' : ''}
                >
                  {item.label}
                </Link>
              )}
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
