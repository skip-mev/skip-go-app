import axios from "axios";

export async function prepareKeplr() {
  const response = await axios.get(
    "https://api.github.com/repos/chainapsis/keplr-wallet/releases",
  );

  const filename = response.data[0].assets[0].name;
  const downloadUrl = response.data[0].assets[0].browser_download_url;
  const tagName = response.data[0].tag_name;
  console.log(
    `Keplr version found! Filename: ${filename}; Download url: ${downloadUrl}; Tag name: ${tagName}`,
  );
}
