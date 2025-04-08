import { useRouter } from "next/router";
import { DefaultSeo as NextDefaultSeo, DefaultSeoProps } from "next-seo";

import { cosmosMetadata, skipMetadata } from "@/constants/seo";
import { isCosmosDomain } from "@/pages";

export function DefaultSeo(props: DefaultSeoProps) {
  const { asPath } = useRouter();

  const metadata = isCosmosDomain ? cosmosMetadata : skipMetadata;

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
        images: metadata.images,
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
