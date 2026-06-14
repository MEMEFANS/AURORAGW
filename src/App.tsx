import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  Download,
  Gauge,
  Lock,
  Menu,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
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
    { title: 'AURORA 2026 白皮书', type: '', size: '', url: 'https://aurora-kappa-lovat.vercel.app/#/zh/README' },
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
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <a href="#home" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gold-glow shadow-[0_0_28px_rgba(250,204,21,0.35)]">
              <img 
                src="/logo.png" 
                alt="AURORA 极光 LOGO" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'grid h-full w-full place-items-center';
                  fallback.innerHTML = '<svg class="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>';
                  target.parentNode?.appendChild(fallback);
                }}
              />
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

          <div className="hidden md:flex">
            <a className="gold-button" href="#resources">
              <BookOpen className="h-4 w-4" />
              <span>查看资料</span>
            </a>
          </div>

          <button 
            className="md:hidden p-2 rounded-lg text-amber-200 hover:bg-amber-200/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 top-16 z-40 w-full border-b border-amber-200/10 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3">
                <a 
                  href="#advantages" 
                  className="nav-link py-2 px-3 rounded-lg hover:bg-amber-200/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  核心优势
                </a>
                <a 
                  href="#market" 
                  className="nav-link py-2 px-3 rounded-lg hover:bg-amber-200/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  市场趋势
                </a>
                <a 
                  href="#resources" 
                  className="nav-link py-2 px-3 rounded-lg hover:bg-amber-200/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  资料中心
                </a>
                <a 
                  href="#community" 
                  className="nav-link py-2 px-3 rounded-lg hover:bg-amber-200/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  社区视频
                </a>
                <div className="pt-2">
                  <a className="gold-button w-full justify-center" href="#resources" onClick={() => setMobileMenuOpen(false)}>
                    <BookOpen className="h-4 w-4" />
                    <span>查看资料</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section id="home" className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
          <div className="hero-shine" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1.5 text-xs sm:text-sm text-amber-100">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
                <span className="truncate">{data.announcement}</span>
              </div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight text-stone-50 sm:text-4xl md:text-5xl lg:text-7xl">
                {data.heroTitle}
                <span className="gold-gradient block">{data.heroHighlight}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-9">{data.heroText}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#advantages" className="gold-button gold-button-lg">
                  <span>{data.ctaText}</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#resources" className="ghost-button">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
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
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm text-amber-200/70">AI Strategy Console</div>
                    <div className="text-xl sm:text-2xl font-black text-stone-50">实时生态仪表盘</div>
                  </div>
                  <Gauge className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {data.metrics.map((metric) => (
                    <div key={metric.label} className="metric-tile">
                      <div className="text-xs text-stone-400">{metric.label}</div>
                      <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-stone-50">{metric.value}</div>
                      <div className="mt-1 text-xs sm:text-sm text-emerald-300">{metric.trend}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-40 sm:h-52 rounded-lg border border-amber-200/10 bg-black/25 p-4 sm:p-5">
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

        <section id="market" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-eyebrow">Market Pulse</span>
              <h2 className="mt-4 text-3xl font-black text-stone-50 md:text-5xl">AI 驱动的智能金融生态</h2>
              <p className="mt-5 leading-8 text-stone-300">
                通过人工智能深度融合 Web4、DeFi、RWA 与 DAO，打造下一代金融操作系统，为用户提供全方位的智能金融服务。
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
              const isWhitepaper = resource.title === 'AURORA 2026 白皮书';

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
                  {!isWhitepaper && <span className="mt-1 block text-sm text-stone-400">{resource.type} · {resource.size}</span>}
                </span>
                {resourceUrl && <ChevronRight className="h-5 w-5 text-stone-500" />}
                {!resourceUrl && <span className="rounded bg-stone-800 px-2 py-1 text-xs font-bold text-stone-400">待上线</span>}
              </CardTag>
              );
            })}
          </div>
        </section>

        <section id="community" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionTitle eyebrow="Community" title="社区视频与公告" desc="视频内容和已发布公告会从独立后台同步到前台。" />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 md:grid-cols-3">
              {data.videos.map((video, index) => {
                const videoUrl = resolveMediaUrl(video.url);

                return (
                <div
                  key={video.title}
                  className={`video-card ${videoUrl ? 'cursor-pointer' : 'opacity-60'}`}
                  onClick={() => videoUrl && setPlayingVideo({ url: videoUrl, title: video.title })}
                >
                  <div className="video-cover">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.42),transparent_34%),linear-gradient(135deg,rgba(20,184,166,0.18),rgba(0,0,0,0.35))]" />
                    <div className="relative z-10 grid h-full place-items-center">
                      <PlayCircle className="h-10 w-10 sm:h-14 sm:w-14 text-amber-100/90" />
                    </div>
                    {videoUrl && (
                      <span className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 rounded bg-amber-200 px-2 py-1 text-xs font-black text-black">可播放</span>
                    )}
                    <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 rounded bg-black/45 px-2 py-1 text-xs text-stone-200">EP {index + 1}</span>
                  </div>
                  <h3 className="mt-3 sm:mt-4 font-black text-stone-50 text-base sm:text-lg">{video.title}</h3>
                  <div className="mt-1.5 sm:mt-2 flex justify-between text-xs sm:text-sm text-stone-400">
                    <span>{video.author}</span>
                    <span>{video.views} 播放</span>
                  </div>
                </div>
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

      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl mx-3 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-xl font-black text-stone-50 line-clamp-1">{playingVideo.title}</h3>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="p-1.5 sm:p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-stone-300" />
                </button>
              </div>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-amber-200/20">
                <video
                  src={playingVideo.url}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
