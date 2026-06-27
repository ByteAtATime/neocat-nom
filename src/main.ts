import "./style.css";
import background from "./assets/neocat_nom.png?inline";
import overlaySrc from "./assets/neocat_nom_overlay.png?inline";

const CANVAS_SIZE = 1000;
const IMAGE_SIZE = 580;
const IMAGE_X = 150;
const IMAGE_Y = 380;

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
const ctx = canvas.getContext("2d")!;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const loadImage = async (source: string | Blob): Promise<HTMLImageElement> => {
  const img = new Image();
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  img.src = url;

  try {
    await img.decode();
    return img;
  } finally {
    if (typeof source !== "string") {
      URL.revokeObjectURL(url);
    }
  }
};

const drawBackground = async (): Promise<void> => {
  const bg = await loadImage(background);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

drawBackground().catch(console.error);

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  try {
    await drawBackground();

    const [img, overlay] = await Promise.all([
      loadImage(file),
      loadImage(overlaySrc),
    ]);

    ctx.drawImage(img, IMAGE_X, IMAGE_Y, IMAGE_SIZE, IMAGE_SIZE);
    ctx.drawImage(overlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    downloadBtn.disabled = false;
    copyBtn.disabled = false;
  } catch (err) {
    console.error("Failed to render the composed image:", err);
  }
});

downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "composed-image.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

copyBtn.addEventListener("click", async () => {
  const originalHTML = copyBtn.innerHTML;

  try {
    copyBtn.disabled = true;
    copyBtn.innerText = "Copying...";

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Blob creation failed"))),
        "image/png",
      ),
    );

    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

    alert("Copied to clipboard!");
  } catch (err) {
    console.error(err);
    alert("Clipboard copy failed.");
  } finally {
    copyBtn.disabled = false;
    copyBtn.innerHTML = originalHTML;
  }
});
