import axios from "axios";
import download from "download";
import fs from "fs/promises";
import path from "path";

import { Release } from "./github/types";

export async function prepareKeplr() {
  const release = await getKeplrReleases();

  const downloadsDirectory = path.resolve(__dirname, "../downloads");

  await createDirIfNotExist(downloadsDirectory);

  const keplrDirectory = path.join(downloadsDirectory, release.tagName);
  const keplrDirectoryExists = await checkDirOrFileExist(keplrDirectory);

  if (!keplrDirectoryExists) {
    await download(release.downloadUrl, keplrDirectory, {
      extract: true,
    });
  }

  return keplrDirectory;
}

async function getKeplrReleases() {
  const response = await axios.get<Release[]>(
    "https://api.github.com/repos/chainapsis/keplr-wallet/releases",
  );

  const filename = response.data[0].assets[0].name;
  const downloadUrl = response.data[0].assets[0].browser_download_url;
  const tagName = response.data[0].tag_name;

  return {
    filename,
    downloadUrl,
    tagName,
  };
}

async function createDirIfNotExist(path: string) {
  try {
    await fs.access(path);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await fs.mkdir(path);
      return true;
    }

    throw new Error(
      `[createDirIfNotExist] Unhandled error from fs.access() with following error:\n${e}`,
    );
  }
}

async function checkDirOrFileExist(path: string) {
  try {
    await fs.access(path);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === "ENOENT") {
      return false;
    }

    throw new Error(
      `[checkDirOrFileExist] Unhandled error from fs.access() with following error:\n${e}`,
    );
  }
}
