# AURORA 部署说明

## 前台

前台是纯 Vite 静态站点，不包含后台入口。

```bash
npm run build
```

把 `dist/` 目录部署到 Nginx、宝塔、CDN 或任意静态网站服务即可。

如果后台 API 和前台不是同一个域名，构建前设置：

```bash
VITE_API_BASE=https://你的后台域名
npm run build
```

Windows PowerShell 示例：

```powershell
$env:VITE_API_BASE="https://你的后台域名"
npm run build
```

## 后台

后台是独立 Node 服务，不会打包进前台。

```bash
ADMIN_TOKEN=请改成强密码 PORT=8787 npm run server
```

Windows PowerShell 示例：

```powershell
$env:ADMIN_TOKEN="请改成强密码"
$env:PORT="8787"
npm run server
```

后台地址：

```text
http://服务器IP:8787/admin
```

公开数据接口：

```text
http://服务器IP:8787/api/site
```

后台保存的数据文件在：

```text
server/data/site.json
```

后台上传的视频文件在：

```text
server/uploads/
```

迁移服务器或备份时，记得同时保留 `server/data/` 和 `server/uploads/`。

上线时建议用 Nginx 反向代理后台服务，并把 `/admin` 限制为内部人员访问。
