
import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/flan-t5-small";

const $ = (id) => document.getElementById(id);

let generatorPromise = null;

const form = $("listing-form");
const generateButton = $("generate-btn");
const statusLabel = $("model-status");
const emptyState = $("empty-state");
const loadingState = $("loading-state");
const results = $("results");
const errorMessage = $("error-message");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function setLoading(message, title = "Warming up your local AI...") {
  emptyState.classList.add("hidden");
  results.classList.add("hidden");
  loadingState.classList.remove("hidden");

  $("loading-title").textContent = title;
  $("loading-message").textContent = message;
}

function showResults(title, description, tags) {
  $("result-title").textContent = title;
  $("result-description").textContent = description;
  $("result-tags").textContent = tags;

  loadingState.classList.add("hidden");
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
}

async function getGenerator() {
  if (!generatorPromise) {
    statusLabel.textContent = "Loading open model...";

    generatorPromise = pipeline(
      "text2text-generation",
      MODEL_ID,
      {
        quantized: true,
        progress_callback: (progress) => {
          if (progress.status === "progress" && progress.total) {
            const pct = Math.round(
              (progress.loaded / progress.total) * 100
            );

            statusLabel.textContent = `Downloading model ${pct}%`;

            $("loading-message").textContent =
              `Downloading model files: ${pct}% complete. ` +
              "This is usually needed only on first use.";
          } else if (progress.status === "done") {
            statusLabel.textContent = "Preparing model...";
          }
        }
      }
    ).then((generator) => {
      statusLabel.textContent = "Open model ready";
      return generator;
    }).catch((error) => {
      generatorPromise = null;
      statusLabel.textContent = "Model not loaded";
      throw error;
    });
  }

  return generatorPromise;
}

function cleanOutput(text) {
  return String(text || "")
    .replace(/^\s*["'`]+|["'`]+\s*$/g, "")
    .trim();
}

async function generateText(generator, prompt, maxNewTokens = 150) {
  const output = await generator(prompt, {
    max_new_tokens: maxNewTokens,
    do_sample: false
  });

  return cleanOutput(output?.[0]?.generated_text);
}

function makeFallback(data) {
  const name = data.productName.trim();
  const features = data.features.trim().replace(/\s+/g, " ");

  const audience = data.audience.trim() ||
    "anyone who appreciates thoughtful finds";

  const keywords = data.keywords
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  const title = `${name} | ${data.category} | Thoughtful Gift`;

  const description =
    `Meet ${name} — a ${data.category.toLowerCase()} find ` +
    `made for ${audience}. ${features}\n\n` +
    "Whether you're treating yourself or choosing a meaningful " +
    "gift, this piece brings personality to everyday life.\n\n" +
    "Please verify all product details before publishing.";

  const tags = [
    ...new Set([
      ...keywords,
      name.toLowerCase(),
      data.category.toLowerCase(),
      "unique gift",
      "small business",
      "thoughtful find"
    ])
  ].slice(0, 13).join(" · ");

  return { title, description, tags };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  if (!form.reportValidity()) return;

  const data = {
    productName: $("product-name").value,
    category: $("category").value,
    platform: $("platform").value,
    features: $("features").value,
    tone: $("tone").value,
    audience: $("audience").value,
    keywords: $("keywords").value
  };

  generateButton.disabled = true;
  generateButton.textContent = "Creating your listing...";

  setLoading(
    "The model runs on your device. The first download may take a few minutes."
  );

  try {
    const generator = await getGenerator();

    const context =
      `Product: ${data.productName}. ` +
      `Category: ${data.category}. ` +
      `Details: ${data.features}. ` +
      `Audience: ${data.audience || "gift shoppers"}. ` +
      `Tone: ${data.tone}. ` +
      `Platform: ${data.platform}. ` +
      `Keywords: ${data.keywords || "relevant natural keywords"}.`;

    const [titleResult, descriptionResult, tagsResult] =
      await Promise.all([
        generateText(
          generator,
          `Write one compelling, accurate ${data.platform} ` +
          `product title under 14 words. Do not invent facts. ` +
          `Tone: ${data.tone}. ${context} Title:`,
          45
        ),

        generateText(
          generator,
          "Write a helpful product description in 2 short " +
          "paragraphs, using only provided facts. " +
          `Tone: ${data.tone}. Avoid unsupported claims. ` +
          `${context} Description:`,
          150
        ),

        generateText(
          generator,
          "Give 10 short search tags separated by commas. " +
          "No numbering. Use provided keywords where relevant. " +
          `${context} Tags:`,
          70
        )
      ]);

    const fallback = makeFallback(data);

    showResults(
      titleResult || fallback.title,
      descriptionResult || fallback.description,
      (tagsResult || fallback.tags)
        .replace(/^\s*[-*\d., ]+/, "")
        .replace(/,\s*/g, " · ")
    );

    statusLabel.textContent = "Open model ready";

  } catch (error) {
    console.error(error);

    const fallback = makeFallback(data);

    showResults(
      fallback.title,
      fallback.description,
      fallback.tags
    );

    statusLabel.textContent = "Template mode";

    showError(
      "The open AI model could not load, so we created an editable " +
      "template instead. Check your internet connection and reload " +
      "to try again. This template is not AI-generated."
    );

  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML =
      '<span>✦</span> Generate my listing ' +
      '<span class="button-arrow">→</span>';
  }
});

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);

    const oldText = button.textContent;
    button.textContent = "Copied!";

    setTimeout(() => {
      button.textContent = oldText;
    }, 1200);

  } catch (error) {
    showError(
      "Clipboard access was blocked. Select the text and copy it manually."
    );
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => {
    copyText($(button.dataset.copy).innerText, button);
  });
});

function fullListing() {
  return (
    `TITLE\n${$("result-title").innerText}\n\n` +
    `DESCRIPTION\n${$("result-description").innerText}\n\n` +
    `SEARCH TAGS\n${$("result-tags").innerText}\n`
  );
}

$("copy-all").addEventListener("click", (event) => {
  copyText(fullListing(), event.currentTarget);
});

$("download-txt").addEventListener("click", () => {
  const blob = new Blob([fullListing()], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "craftcopy-product-listing.txt";
  link.click();

  URL.revokeObjectURL(url);
});
