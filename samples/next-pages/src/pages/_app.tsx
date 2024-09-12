import type { AppProps } from "next/app";
import "@content-collections/sample-theme/sample.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
