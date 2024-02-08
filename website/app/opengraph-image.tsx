/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export default async function Image() {
  const interRegular = fetch(
    new URL("/assets/fonts/inter/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBold = fetch(
    new URL("/assets/fonts/inter/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const logo = await fetch(new URL("/assets/logo.png", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full justify-around py-12"
        style={{
          background:
            "radial-gradient(circle, rgba(30,41,59,1) 0%, rgba(2,6,23,1) 75%, rgba(2,6,23,1) 100%)",
          fontFamily: "Inter",
        }}
      >
        <div tw="flex items-center text-slate-200">
          {/* @ts-ignore logo as buffer is fine */}
          <img width="496" height="496" src={logo} alt="" />

          <div tw="flex flex-col" style={{ width: 704 }}>
            <h1 tw="text-6xl font-bold text-white">Content Collections</h1>
            <div tw="text-4xl" style={{ textWrap: "balance" }}>
              Transform your content into type-safe data collections
            </div>
          </div>
        </div>
        <div tw="flex items-center justify-center w-full">
          <p tw="mr-4 text-2xl text-slate-200 text-center">
            Made with ❤️ by Sebastian Sdorra
          </p>
          <img
            tw="rounded-full border-2 border-slate-400/50"
            width="64"
            height="64"
            src="https://avatars.githubusercontent.com/u/493333"
            alt=""
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}

export const runtime = "edge";

export const alt = "About Content Collections";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
