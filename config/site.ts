export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Dify Dashboard",
  description: "Dify Dashboard built with HeroUI and Next.js.",
  navItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "仪表盘",
      href: "/dashboard",
    },
    {
      label: "应用列表",
      href: "/apps",
    }
  ],
  navMenuItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "仪表盘",
      href: "/dashboard",
    },
    {
      label: "应用列表",
      href: "/apps",
    },
    {
      label: "登出",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/huixiangyang/dify-dashboard",
    docs: "",
    sponsor: "",
  },
};
