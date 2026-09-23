import { createHash } from "node:crypto";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const VERSION = "7.3.15";
const TARGET = process.env.CLIPROXYAPI_TARGET
  ?? (process.platform === "darwin" && process.arch === "arm64"
    ? "aarch64-apple-darwin"
    : "");
const ARCHIVE_NAME = `CLIProxyAPI_${VERSION}_darwin_aarch64.tar.gz`;
const ARCHIVE_SHA256 = "c1e49c148a94c476dc43a6a0eed28bca34239d5153ebb7792048d8c18f3b92f0";
const BINARY_SHA256 = "7212d39890dac46fac10d75f8029d8c377fdcc75798d5dcecefffc90b987d0a9";
const DOWNLOAD_URL =
  `https://github.com/router-for-me/CLIProxyAPI/releases/download/v${VERSION}/${ARCHIVE_NAME}`;
const DESTINATION = resolve(
  "src-tauri",
  "binaries",
  `cliproxyapi-${TARGET}`,
);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function existingBinaryIsValid() {
  try {
    return sha256(await readFile(DESTINATION)) === BINARY_SHA256;
  } catch {
    return false;
  }
}

if (TARGET !== "aarch64-apple-darwin") {
  throw new Error(
    `CLIProxyAPI sidecar 暂只支持 Apple Silicon 构建，当前目标：${TARGET || "unknown"}`,
  );
}

if (await existingBinaryIsValid()) {
  console.log(`[CLIProxyAPI] v${VERSION} sidecar ready`);
  process.exit(0);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "switchpp-cliproxyapi-"));
try {
  const archivePath = join(temporaryDirectory, ARCHIVE_NAME);
  const response = await fetch(DOWNLOAD_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`下载失败：HTTP ${response.status}`);
  }
  const archive = Buffer.from(await response.arrayBuffer());
  const archiveDigest = sha256(archive);
  if (archiveDigest !== ARCHIVE_SHA256) {
    throw new Error(
      `归档校验失败：期望 ${ARCHIVE_SHA256}，实际 ${archiveDigest}`,
    );
  }
  await writeFile(archivePath, archive);

  const extractedDirectory = join(temporaryDirectory, "extracted");
  await mkdir(extractedDirectory);
  const extraction = spawnSync(
    "tar",
    ["-xzf", archivePath, "-C", extractedDirectory, "cli-proxy-api"],
    { encoding: "utf8" },
  );
  if (extraction.status !== 0) {
    throw new Error(
      `解压失败：${(extraction.stderr || extraction.stdout).trim()}`,
    );
  }

  const extractedBinary = join(extractedDirectory, "cli-proxy-api");
  const binaryDigest = sha256(await readFile(extractedBinary));
  if (binaryDigest !== BINARY_SHA256) {
    throw new Error(
      `二进制校验失败：期望 ${BINARY_SHA256}，实际 ${binaryDigest}`,
    );
  }

  await mkdir(dirname(DESTINATION), { recursive: true });
  const temporaryDestination = `${DESTINATION}.tmp`;
  await rm(temporaryDestination, { force: true });
  await copyFile(extractedBinary, temporaryDestination);
  await chmod(temporaryDestination, 0o755);
  await rename(temporaryDestination, DESTINATION);
  console.log(`[CLIProxyAPI] bundled v${VERSION} for ${TARGET}`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
