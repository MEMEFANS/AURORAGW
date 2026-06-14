import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  Download,
  Gauge,
  Lock,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

type Metric = {
  label: string;
  value: string;
  trend: string;
};

type Resource = {
  title: string;
  type: string;
  size: string;
  url?: string;
};

type Video = {
  title: string;
  author: string;
  views: string;
  url?: string;
};

type Notice = {
  title: string;
  content: string;
  status: '已发布' | '草稿';
};

type SiteData = {
  heroTitle: string;
  heroHighlight: string;
  heroText: string;
  ctaText: string;
  announcement: string;
  metrics: Metric[];
  resources: Resource[];
  videos: Video[];
  notices: Notice[];
};

const defaultData: SiteData = {
  heroTitle: 'AI 预见趋势',
  heroHighlight: '让收益自主生长',
  heroText:
    'AURORA 极光是一套面向 Web4 的 AI 智能预测金融操作系统，融合趋势预判、资产策略、节点共建与生态治理，帮助用户更早看见机会，更稳参与增长。',
  ctaText: '进入生态',
  announcement: 'Web4 AI 智能预测金融操作系统，正在开放生态共建席位。',
  metrics: [
    { label: '生态参与者', value: '128,600+', trend: '+18.4%' },
    { label: 'AI 策略胜率', value: '82.7%', trend: '+6.2%' },
    { label: '节点覆盖地区', value: '36', trend: '+9' },
  ],
  resources: [
    { title: 'AURORA 2026 白皮书', type: 'PDF', size: '4.2 MB', url: '/resources/aurora-2026-whitepaper.pdf' },
    { title: 'AI 预测模型说明', type: 'PDF', size: '2.8 MB', url: '/resources/ai-model-brief.pdf' },
    { title: '节点收益与释放明细', type: 'CSV', size: '1.4 MB', url: '/resources/node-release-details.csv' },
  ],
  videos: [
    { title: '3 分钟了解 AURORA 核心机制', author: 'Aurora Official', views: '12K' },
    { title: '如何配置你的 AI 智能代理', author: '生态学院', views: '8.5K' },
    { title: 'Web4 趋势预测实战演示', author: 'Finance Today', views: '15K' },
  ],
  notices: [
    {
      title: '节点共建计划开放',
      content: '第一期节点席位已开放申请，优先面向早期生态贡献者。',
      status: '已发布',
    },
  ],
};

const apiBase = import.meta.env.VITE_API_BASE ?? '';

const resolveMediaUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  return url.startsWith('/uploads/') ? `${apiBase}${url}` : url;
};

const SectionTitle = ({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) => (
  <div className="mx-auto mb-12 max-w-3xl text-center">
    <span className="section-eyebrow">{eyebrow}</span>
    <h2 className="mt-4 text-3xl font-black text-stone-50 md:text-5xl">{title}</h2>
    <p className="mt-4 text-base leading-8 text-stone-300">{desc}</p>
  </div>
);

const App = () => {
  const [data, setData] = useState<SiteData>(defaultData);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiBase}/api/site`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load site data');
        }
        return res.json();
      })
      .then((nextData: SiteData) => setData({ ...defaultData, ...nextData }))
      .catch(() => {
        setData(defaultData);
      });

    return () => controller.abort();
  }, []);

  const publishedNotices = useMemo(
    () => data.notices.filter((notice) => notice.status === '已发布'),
    [data.notices],
  );

  return (
    <div className="min-h-screen bg-aurora text-stone-100">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-amber-200/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold-glow shadow-[0_0_28px_rgba(250,204,21,0.35)]">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="text-lg font-black tracking-wide">AURORA 极光</div>
              <div className="text-xs text-amber-200/70">Web4 AI Finance OS</div>
            </div>
          </a>

          <div className="hidden items-center gap-7 text-sm text-stone-300 md:flex">
            <a href="#advantages" className="nav-link">核心优势</a>
            <a href="#market" className="nav-link">市场趋势</a>
            <a href="#resources" className="nav-link">资料中心</a>
            <a href="#community" className="nav-link">社区视频</a>
          </div>

          <a className="gold-button" href="#resources">
            <BookOpen className="h-4 w-4" />
            <span>查看资料</span>
          </a>
        </div>
      </nav>

      <main>
        <section id="home" className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          <div className="hero-shine" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm text-amber-100">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{data.announcement}</span>
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-stone-50 md:text-7xl">
                {data.heroTitle}
                <span className="gold-gradient block">{data.heroHighlight}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-stone-300">{data.heroText}</p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a href="#advantages" className="gold-button gold-button-lg">
                  <span>{data.ctaText}</span>
                  <ChevronRight className="h-5 w-5" />
                </a>
                <a href="#resources" className="ghost-button">
                  <BookOpen className="h-5 w-5" />
                  <span>查看资料</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="terminal-card">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-amber-200/70">AI Strategy Console</div>
                    <div className="text-2xl font-black text-stone-50">实时生态仪表盘</div>
                  </div>
                  <Gauge className="h-8 w-8 text-amber-300" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {data.metrics.map((metric) => (
                    <div key={metric.label} className="metric-tile">
                      <div className="text-xs text-stone-400">{metric.label}</div>
                      <div className="mt-2 text-2xl font-black text-stone-50">{metric.value}</div>
                      <div className="mt-1 text-sm text-emerald-300">{metric.trend}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-52 rounded-lg border border-amber-200/10 bg-black/25 p-5">
                  <div className="flex h-full items-end gap-3">
                    {[42, 58, 51, 66, 76, 70, 88, 96].map((height, index) => (
                      <div key={index} className="chart-bar" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="advantages" className="section-band">
          <SectionTitle
            eyebrow="Core Modules"
            title="面向运营增长的前台结构"
            desc="品牌展示、数据指标、资料下载、视频内容和公告发布都由服务端后台统一维护，前台只负责展示。"
          />
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              { icon: Activity, title: 'AI 趋势预测', desc: '聚合市场信号、链上数据与风控规则，形成可视化策略看板。' },
              { icon: ShieldCheck, title: '资产安全机制', desc: '强调权限隔离、节点审核与透明规则，让增长路径更可信。' },
              { icon: Users, title: '社区共建系统', desc: '资料、视频、公告联动展示，为用户教育和运营活动留好入口。' },
            ].map((item) => (
              <div key={item.title} className="feature-card">
                <div className="feature-icon"><item.icon className="h-6 w-6" /></div>
                <h3 className="mt-6 text-xl font-black text-stone-50">{item.title}</h3>
                <p className="mt-3 leading-7 text-stone-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="market" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-eyebrow">Market Pulse</span>
              <h2 className="mt-4 text-3xl font-black text-stone-50 md:text-5xl">鎏金不是浮夸，是有层次的高级感</h2>
              <p className="mt-5 leading-8 text-stone-300">
                页面背景采用深曜石底色叠加金属光泽，核心按钮与重点数据使用鎏金渐变，辅助信息用石墨灰和少量翡翠绿做平衡。
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Web4 智能代理', value: 'AI Agent', icon: Sparkles },
                { label: 'DeFi 风控进化', value: 'Risk Engine', icon: Lock },
                { label: 'RWA 资产映射', value: 'Real Assets', icon: CircleDollarSign },
                { label: '生态治理增长', value: 'DAO Growth', icon: BarChart3 },
              ].map((item) => (
                <div key={item.label} className="signal-card">
                  <item.icon className="h-7 w-7 text-amber-300" />
                  <div className="mt-7 text-sm text-stone-400">{item.label}</div>
                  <div className="mt-2 text-2xl font-black text-stone-50">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="section-band">
          <SectionTitle eyebrow="Resources" title="资料中心" desc="白皮书、模型说明和节点资料已经整理成统一入口。" />
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {data.resources.map((resource) => {
              const resourceUrl = resolveMediaUrl(resource.url);
              const CardTag = resourceUrl ? 'a' : 'div';

              return (
              <CardTag
                key={resource.title}
                className="resource-card"
                href={resourceUrl || undefined}
                target={resourceUrl ? '_blank' : undefined}
                rel={resourceUrl ? 'noreferrer' : undefined}
              >
                <Download className="h-6 w-6 text-amber-300" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-bold text-stone-50">{resource.title}</span>
                  <span className="mt-1 block text-sm text-stone-400">{resource.type} · {resource.size}</span>
                </span>
                {resourceUrl && <ChevronRight className="h-5 w-5 text-stone-500" />}
                {!resourceUrl && <span className="rounded bg-stone-800 px-2 py-1 text-xs font-bold text-stone-400">待上线</span>}
              </CardTag>
              );
            })}
          </div>
        </section>

        <section id="community" className="px-4 py-24 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Community" title="社区视频与公告" desc="视频内容和已发布公告会从独立后台同步到前台。" />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 md:grid-cols-3">
              {data.videos.map((video, index) => {
                const videoUrl = resolveMediaUrl(video.url);
                const CardTag = videoUrl ? 'a' : 'div';

                return (
                <CardTag
                  key={video.title}
                  className="video-card block"
                  href={videoUrl || undefined}
                  target={videoUrl ? '_blank' : undefined}
                  rel={videoUrl ? 'noreferrer' : undefined}
                >
                  <div className="video-cover">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.42),transparent_34%),linear-gradient(135deg,rgba(20,184,166,0.18),rgba(0,0,0,0.35))]" />
                    <div className="relative z-10 grid h-full place-items-center">
                      <PlayCircle className="h-14 w-14 text-amber-100/90" />
                    </div>
                    {videoUrl && (
                      <span className="absolute right-3 top-3 z-10 rounded bg-amber-200 px-2 py-1 text-xs font-black text-black">可播放</span>
                    )}
                    <span className="absolute bottom-3 left-3 z-10 rounded bg-black/45 px-2 py-1 text-xs text-stone-200">EP {index + 1}</span>
                  </div>
                  <h3 className="mt-4 font-black text-stone-50">{video.title}</h3>
                  <div className="mt-2 flex justify-between text-sm text-stone-400">
                    <span>{video.author}</span>
                    <span>{video.views} 播放</span>
                  </div>
                </CardTag>
                );
              })}
            </div>
            <div className="notice-panel">
              <div className="mb-5 flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-black text-stone-50">最新公告</h3>
              </div>
              <div className="space-y-4">
                {publishedNotices.map((notice) => (
                  <div key={notice.title} className="rounded-lg border border-amber-200/10 bg-black/20 p-4">
                    <div className="font-bold text-stone-50">{notice.title}</div>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-amber-200/10 bg-black/40 px-4 py-10 text-sm text-stone-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <span>© 2026 AURORA 极光 Foundation. All rights reserved.</span>
          <span>鎏金视觉 · 前台展示 · 服务端后台</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
