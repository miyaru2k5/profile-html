import Link from "next/link";
import { ArrowRight, Globe2, LayoutTemplate, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const features = [
  {
    title: "Hồ sơ đa tenant",
    description: "Không giới hạn profile, theme, template và thành viên trong workspace.",
    icon: LayoutTemplate,
  },
  {
    title: "Tên miền riêng",
    description: "Render theo host, xác minh DNS, HTTPS và SEO canonical chuẩn.",
    icon: Globe2,
  },
  {
    title: "Trợ lý AI",
    description: "Soạn bio, metadata SEO và gợi ý bố cục ngay trong bảng điều khiển.",
    icon: Sparkles,
  },
  {
    title: "Sẵn sàng kiểm toán",
    description: "Nhật ký hoạt động, audit trail, thanh toán, CRM và marketplace plugin.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-mono text-sm font-bold tracking-[0.18em] uppercase">
          MI<span className="text-orange-500">YA</span>RU
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Dùng miễn phí</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-orange-600">
              Nền tảng Profile SaaS
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
              Nền tảng profile đa tenant cho thương hiệu &amp; nhà sáng tạo
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
              Từ trang profile tĩnh Miyaru thành nền tảng Next.js MVC đầy đủ: tên miền riêng,
              page builder, phân tích, thanh toán, CRM, marketplace và AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/profile/miyaru">
                  Xem profile demo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Mở bảng điều khiển</Link>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-orange-100 bg-white/90">
            <CardHeader>
              <CardTitle>Workspace mẫu sẵn sàng</CardTitle>
              <CardDescription>
                Đăng nhập tài khoản seed để trải nghiệm toàn bộ module ngay.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-stone-600">
              <div className="rounded-xl bg-stone-50 p-4 font-mono text-xs leading-relaxed">
                Owner: miyaru2k5@gmail.com
                <br />
                Admin: admin@miyaru.online
                <br />
                Member: member@miyaru.online
                <br />
                Viewer: viewer@miyaru.online
                <br />
                Editor: editor@miyaru.online
                <br />
                mật khẩu (tất cả): demo1234
              </div>
              <p>
                Profile công khai:{" "}
                <Link className="font-semibold text-orange-600" href="/profile/miyaru">
                  /profile/miyaru
                </Link>
              </p>
              <p>
                Domain production:{" "}
                <a className="font-semibold text-orange-600" href="https://miyaru.online">
                  miyaru.online
                </a>{" "}
                — hiển thị profile tại trang chủ `/`.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
