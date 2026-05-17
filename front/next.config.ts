import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import million from "million/compiler";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

// million v3 espera un subset del tipo NextConfig — el cast es necesario por
// incompatibilidad de tipos con Next.js 16 (webpack: null vs undefined).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default million.next(withNextIntl(nextConfig) as any, { auto: true });
