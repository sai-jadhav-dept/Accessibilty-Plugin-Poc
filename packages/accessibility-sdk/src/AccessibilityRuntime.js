const runtime = {
  pageReadText: "",
  fontScale: 1,
  accessibility: {
    pageRead: false,
    imageDescription: false,
    textMagnifier: false,
    dictionary: false,
    readingMask: false,
    readingLine: false,
    enlargeButtons: false,
    reducedMotion: false,
    highlightLinks: false,
    textAlignment: "left",
    isSpeakerDragging: false
  }
};

export const setRuntime = (partial) => {
  if (!partial || typeof partial !== "object") {
    return runtime;
  }

  if (partial.accessibility && typeof partial.accessibility === "object") {
    runtime.accessibility = {
      ...runtime.accessibility,
      ...partial.accessibility
    };
  }

  if (typeof partial.pageReadText === "string") {
    runtime.pageReadText = partial.pageReadText;
  }

  if (typeof partial.fontScale === "number" && Number.isFinite(partial.fontScale)) {
    runtime.fontScale = partial.fontScale;
  }

  return runtime;
};

export default runtime;
