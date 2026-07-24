"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Share2,
  Tags,
  UserRound,
} from "lucide-react";
import type { ProfileAggregate } from "@/modules/profile/domain/types";
import { cn } from "@/shared/lib/utils";

const accentMap: Record<string, string> = {
  rd: "bg-rose-50 text-rose-700",
  pu: "bg-violet-50 text-violet-700",
  gr: "bg-emerald-50 text-emerald-700",
  bl: "bg-sky-50 text-sky-700",
  or: "bg-orange-50 text-orange-700",
};

export function ProfileView({ aggregate }: { aggregate: ProfileAggregate }) {
  const { profile, stats, tags, socialLinks, quickLinks, timeline } = aggregate;
  const tokens = (aggregate.theme?.tokens ?? {}) as Record<string, string>;
  const primary = tokens.primary ?? "#ff7a00";

  return (
    <div
      className="min-h-screen bg-[#f7f6f2] text-[#18160f]"
      style={{ ["--pr" as string]: primary }}
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_20%_20%,#ff7a00,transparent_40%),radial-gradient(circle_at_80%_80%,#ff9a3c,transparent_35%)]" />

      <main className="relative z-10 mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-5">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <div className="relative h-[165px] overflow-hidden rounded-3xl sm:h-[270px]">
            {profile.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.bannerUrl}
                alt={`Banner ${profile.displayName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-stone-800 to-orange-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-orange-500/20" />
          </div>

          <div className="mt-0 flex flex-wrap items-end gap-4 px-3 sm:px-5">
            <div className="flex min-w-0 flex-1 items-end gap-4">
              <div className="-mt-12 h-[100px] w-[100px] shrink-0 overflow-hidden rounded-2xl border-4 border-[#f7f6f2] shadow-[0_14px_44px_rgba(255,122,0,0.2)] sm:-mt-16 sm:h-40 sm:w-40 sm:rounded-[20px]">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600">
                    <UserRound className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {profile.displayName}
                  </h1>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1d9bf0] text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </div>
                {profile.handle ? (
                  <p className="font-mono text-sm text-orange-600">{profile.handle}</p>
                ) : null}
                {profile.headline ? (
                  <p className="mt-1 text-sm text-stone-600">{profile.headline}</p>
                ) : null}
              </div>
            </div>

            {stats.length > 0 ? (
              <div className="mb-2 flex w-full justify-center sm:w-auto sm:justify-end">
                <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm sm:gap-5 sm:px-6">
                  {stats.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 sm:gap-5">
                      {i > 0 ? <div className="h-8 w-px bg-stone-200" /> : null}
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-orange-600">{s.value}</div>
                        <div className="text-[10px] uppercase tracking-wider text-stone-400">
                          {s.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </motion.header>

        <div className="grid gap-5 lg:grid-cols-[370px_1fr]">
          <div className="space-y-5">
            <Section icon={<UserRound className="h-4 w-4" />} title="Giới thiệu">
              <p className="text-sm leading-7 text-stone-600">{profile.bio}</p>
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                {profile.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span>{profile.location}</span>
                  </div>
                ) : null}
                {profile.headline ? (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    <span>{profile.headline}</span>
                  </div>
                ) : null}
                {profile.email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <a className="text-orange-600 hover:opacity-80" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  </div>
                ) : null}
              </div>
            </Section>

            {tags.length > 0 ? (
              <Section icon={<Tags className="h-4 w-4" />} title="Kỹ năng & Dịch vụ">
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-lg border border-orange-200/70 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </Section>
            ) : null}

            {socialLinks.length > 0 ? (
              <Section icon={<Share2 className="h-4 w-4" />} title="Mạng xã hội">
                <div className="space-y-2">
                  {socialLinks
                    .filter((s) => s.isVisible)
                    .map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-[#faf9f7] px-3 py-3 transition hover:border-orange-300 hover:bg-orange-50"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold uppercase text-stone-700 shadow-sm">
                          {s.label.slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{s.label}</div>
                          <div className="truncate font-mono text-xs text-stone-400">
                            {s.handle ?? s.url}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-stone-400" />
                      </a>
                    ))}
                </div>
              </Section>
            ) : null}
          </div>

          <div className="space-y-5">
            <Section icon={<Share2 className="h-4 w-4" />} title="Liên kết nhanh">
              <div className="space-y-2.5">
                {quickLinks
                  .filter((l) => l.isVisible)
                  .map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target={l.url.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-[#faf9f7] p-3 transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          accentMap[l.accent ?? "or"] ?? accentMap.or,
                        )}
                      >
                        {l.title.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{l.title}</div>
                        {l.description ? (
                          <div className="truncate text-xs text-stone-400">{l.description}</div>
                        ) : null}
                        {l.isPriced ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-stone-400">{l.priceLabel}</span>
                            <span className="font-extrabold text-orange-600">{l.priceValue}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-400 transition group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white">
                        {l.isPriced ? <CreditCard className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                    </a>
                  ))}
              </div>
            </Section>

            {timeline.length > 0 ? (
              <Section icon={<Calendar className="h-4 w-4" />} title="Hành trình">
                <ol className="space-y-5">
                  {timeline.map((item) => (
                    <li key={item.id} className="grid grid-cols-[36px_1fr] gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold",
                          accentMap[item.accent ?? "or"] ?? accentMap.or,
                        )}
                      >
                        {item.sortOrder + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{item.title}</h3>
                        {item.badge ? (
                          <span className="mt-1 inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                            {item.badge}
                          </span>
                        ) : null}
                        {item.description ? (
                          <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                        ) : null}
                        {item.period ? (
                          <p className="mt-1 font-mono text-xs text-stone-400">{item.period}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.055)] sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-orange-50 text-orange-600">
          {icon}
        </div>
        <h2 className="text-[0.95rem] font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
