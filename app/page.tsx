'use client';

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { button as buttonStyles } from "@heroui/theme";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon, RocketIcon, SparklesIcon, LightningIcon } from "@/components/icons";

export default function Home() {
  const techStack = [
    { name: "Next.js", color: "primary", description: "React 框架" },
    { name: "React", color: "secondary", description: "用户界面库" },
    { name: "TypeScript", color: "success", description: "类型安全的 JavaScript" },
    { name: "Tailwind CSS", color: "warning", description: "实用优先的 CSS 框架" },
    { name: "HeroUI", color: "danger", description: "现代化 UI 组件库" },
    { name: "Framer Motion", color: "primary", description: "动画库" },
    { name: "Recharts", color: "secondary", description: "数据可视化" },
    { name: "JSZip", color: "success", description: "文件压缩与解压" },
  ];

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16">
      <div className="inline-block max-w-2xl text-center justify-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className={`${title()} text-4xl md:text-5xl mb-2`}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Dify</span>
          <span className={title({ color: "violet" })}> Dashboard</span>
        </h1>
        <h2 className={`${title()} text-2xl md:text-3xl mb-6`}>
          简单，轻巧，快速的操作您的AI应用
        </h2>
        <p className={subtitle({ class: "mt-4 text-lg" })}>
          无需额外配置，开箱即用。专为Dify用户打造的现代化管理界面。
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
            size: "lg",
          })}
          href="/signin"
        >
          <LightningIcon className="w-5 h-5 mr-1" />
          立即登录
        </Link>
        <Link
          isExternal
          className={buttonStyles({ 
            variant: "bordered", 
            radius: "full",
            size: "lg"
          })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>

      <div className="w-full max-w-5xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-1 border-default-200 shadow-sm hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-primary-100 p-3 rounded-full mb-4">
                <RocketIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">快速部署</h3>
              <p className="text-default-500">一键部署，无需复杂配置，立即开始管理您的Dify应用</p>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border-1 border-default-200 shadow-sm hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-secondary-100 p-3 rounded-full mb-4">
                <SparklesIcon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">现代界面</h3>
              <p className="text-default-500">精心设计的用户界面，提供流畅的操作体验和直观的数据展示</p>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border-1 border-default-200 shadow-sm hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-success-100 p-3 rounded-full mb-4">
                <LightningIcon className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">高效管理</h3>
              <p className="text-default-500">轻松管理所有应用，查看统计数据，导出配置，一站式解决方案</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Divider className="my-8 max-w-5xl" />

      <div className="w-full max-w-5xl">
        <h2 className={`${title()} text-2xl text-center mb-6`}>技术栈</h2>
        <Card className="border-1 border-default-200 shadow-sm">
          <CardBody>
            <div className="flex flex-wrap justify-center gap-3 p-4">
              {techStack.map((tech) => (
                <Tooltip key={tech.name} content={tech.description}>
                  <Chip
                    color={tech.color as any}
                    variant="flat"
                    className="text-sm font-medium"
                  >
                    {tech.name}
                  </Chip>
                </Tooltip>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 w-full max-w-5xl">
        <Link href="/dashboard" className="w-full">
          <Card className="w-full border-1 border-default-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-primary-50 to-secondary-50">
            <CardBody className="flex items-center justify-center py-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">准备好开始了吗？</h3>
                <Snippet 
                  hideCopyButton 
                  hideSymbol 
                  variant="flat"
                  className="bg-background/60 backdrop-blur-sm border-1 border-default-200"
                >
                  <span className="font-medium">
                    开始使用 Dify Dashboard 管理您的 AI 应用
                  </span>
                </Snippet>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </section>
  );
}
