import { useRouter } from "next/router";
import { DefaultSeo as NextDefaultSeo, DefaultSeoProps } from "next-seo";

import { metadata } from "@/constants/seo";

export function DefaultSeo(props: DefaultSeoProps) {
  const { asPath } = useRouter();
  return (
    <NextDefaultSeo
      canonical={metadata.url + (asPath || "")}
      defaultTitle={metadata.name}
      description={metadata.description}
      openGraph={{
        title: metadata.name,
        description: metadata.description,
        type: "website",
        site_name: metadata.name,
        images: [{ url: `${metadata.url}/social.png` }],
      }}
      twitter={{
        cardType: "summary_large_image",
        handle: metadata.twitter.username,
        site: metadata.twitter.username,
      }}
      themeColor={metadata.themeColor}
      {...props}
    />
  );
}
